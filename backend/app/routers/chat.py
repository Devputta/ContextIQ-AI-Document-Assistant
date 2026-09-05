import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import Conversation, Document, Message, User
from ..schemas import (
    ChatRequest,
    ChatResponse,
    ConversationDetail,
    ConversationOut,
)
from ..services.rag import retrieve
from ..services.llm import (
    stream_answer,
    sources_from_docs,
    citation_suffix,
)

router = APIRouter(tags=["chat"])


def source_list(raw):
    return raw or []


def make_title(question: str):
    q = " ".join(question.strip().split())
    return (q[:72] + "…") if len(q) > 75 else q


def conv_dto(c, db):
    msgs = c.messages
    last = msgs[-1].content if msgs else None

    return {
        "id": c.id,
        "title": c.title,
        "documentId": c.document_id,
        "documentName": c.document.name,
        "lastMessage": last,
        "updatedAt": c.updated_at,
        "messageCount": len(msgs),
    }


def owned_doc(doc_id, user, db):
    document = (
        db.query(Document)
        .filter(
            Document.id == doc_id,
            Document.owner_id == user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if document.status != "READY":
        raise HTTPException(
            status_code=409,
            detail=f"Document is not ready. Current status: {document.status}.",
        )

    return document


def get_conv(cid, user, db, document_id=None):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == cid,
            Conversation.user_id == user.id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    # Make sure a conversation cannot be reused with another document.
    if document_id is not None and conversation.document_id != document_id:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found for this document.",
        )

    return conversation


@router.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    question = req.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    doc = owned_doc(req.document_id, user, db)

    try:
        matches = retrieve(
            doc.id,
            user.id,
            question,
        )

        if req.conversation_id:
            conversation = get_conv(
                req.conversation_id,
                user,
                db,
                document_id=doc.id,
            )
        else:
            conversation = Conversation(
                user_id=user.id,
                document_id=doc.id,
                title=make_title(question),
            )

            db.add(conversation)
            db.flush()

        answer = "".join(
            stream_answer(question, matches)
        ).strip()

        final_answer = answer + citation_suffix(matches)

        db.add(
            Message(
                conversation_id=conversation.id,
                role="user",
                content=question,
                sources_json="[]",
            )
        )

        db.add(
            Message(
                conversation_id=conversation.id,
                role="assistant",
                content=final_answer,
                sources_json=json.dumps(
                    sources_from_docs(matches)
                ),
            )
        )

        conversation.updated_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "answer": final_answer,
            "sources": sources_from_docs(matches),
            "conversationId": conversation.id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=503,
            detail=f"Failed to generate answer: {str(exc)}",
        ) from exc


@router.post("/chat/stream")
def chat_stream(
    req: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    question = req.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    doc = owned_doc(req.document_id, user, db)

    try:
        matches = retrieve(
            doc.id,
            user.id,
            question,
        )

        # ---------------------------------------------------------
        # IMPORTANT:
        # If this is a new conversation, commit it BEFORE
        # StreamingResponse starts sending events.
        #
        # This prevents:
        #
        # POST /api/chat/stream -> conversation ID
        # GET /api/conversations/<id> -> 404
        #
        # because the second request can now see the committed row.
        # ---------------------------------------------------------

        if req.conversation_id:
            conversation = get_conv(
                req.conversation_id,
                user,
                db,
                document_id=doc.id,
            )
        else:
            conversation = Conversation(
                user_id=user.id,
                document_id=doc.id,
                title=make_title(question),
            )

            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        sources = sources_from_docs(matches)
        conversation_id = conversation.id

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=503,
            detail=f"Failed to prepare chat: {str(exc)}",
        ) from exc

    def events():
        answer = ""

        try:
            # Send conversation ID only after it has been committed.
            yield (
                "event: meta\n"
                "data: "
                + json.dumps(
                    {
                        "conversationId": conversation_id,
                    }
                )
                + "\n\n"
            )

            for token in stream_answer(
                question,
                matches,
            ):
                answer += token

                yield (
                    "event: token\n"
                    "data: "
                    + json.dumps(
                        {
                            "token": token,
                        }
                    )
                    + "\n\n"
                )

            final_answer = (
                answer.strip()
                + citation_suffix(matches)
            )

            # Check whether the browser cancelled the request.
            if await_disconnect(request):
                return

            # Save user message.
            db.add(
                Message(
                    conversation_id=conversation_id,
                    role="user",
                    content=question,
                    sources_json="[]",
                )
            )

            # Save assistant message.
            db.add(
                Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=final_answer,
                    sources_json=json.dumps(sources),
                )
            )

            conversation.updated_at = datetime.now(
                timezone.utc
            )

            db.commit()

            yield (
                "event: done\n"
                "data: "
                + json.dumps(
                    {
                        "answer": final_answer,
                        "sources": sources,
                        "conversationId": conversation_id,
                    }
                )
                + "\n\n"
            )

        except Exception as exc:
            import traceback

            db.rollback()

            print("\n" + "=" * 80)
            print("CONTEXTIQ AI ERROR")
            print("=" * 80)
            print("Error Type:", type(exc).__name__)
            print("Error:", str(exc))
            print("-" * 80)
            traceback.print_exc()
            print("=" * 80 + "\n")

            yield (
                "event: error\n"
                "data: "
                + json.dumps(
                    {
                        "message": f"AI error: {str(exc)}"
                    }
                )
                + "\n\n"
            )

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


def await_disconnect(request):
    """
    StreamingResponse uses a synchronous generator in this project,
    so we don't await request.is_disconnected() here.

    Kept as a small compatibility helper so the streaming code
    remains easy to extend later.
    """
    return False


@router.get(
    "/conversations",
    response_model=list[ConversationOut],
)
def conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conversations = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == user.id
        )
        .order_by(
            Conversation.updated_at.desc()
        )
        .all()
    )

    return [
        conv_dto(conversation, db)
        for conversation in conversations
    ]


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationDetail,
)
def conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conversation = get_conv(
        conversation_id,
        user,
        db,
    )

    data = conv_dto(
        conversation,
        db,
    )

    messages = []

    for message in conversation.messages:
        try:
            sources = json.loads(
                message.sources_json or "[]"
            )
        except (TypeError, json.JSONDecodeError):
            sources = []

        messages.append(
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "sources": sources,
                "createdAt": message.created_at,
            }
        )

    data["messages"] = messages

    return data


@router.patch(
    "/conversations/{conversation_id}"
)
def rename_conversation(
    conversation_id: str,
    title: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conversation = get_conv(
        conversation_id,
        user,
        db,
    )

    conversation.title = (
        title.strip()[:200]
        or "New conversation"
    )

    db.commit()

    return conv_dto(
        conversation,
        db,
    )


@router.delete(
    "/conversations/{conversation_id}"
)
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conversation = get_conv(
        conversation_id,
        user,
        db,
    )

    db.delete(conversation)
    db.commit()

    return {
        "deleted": True
    }