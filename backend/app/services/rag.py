from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document as LCDocument

from .file_parser import parse_file
from ..settings import settings


_splitter = RecursiveCharacterTextSplitter(
    chunk_size=900,
    chunk_overlap=150,
)


def _embeddings():
    return HuggingFaceEmbeddings(
        model_name=settings.embedding_model
    )


def _clean_metadata(metadata: dict) -> dict:
    """
    ChromaDB metadata only supports:
    str, int, float, bool.

    Convert None and other unsupported values into safe values.
    """
    cleaned = {}

    for key, value in metadata.items():

        if value is None:
            cleaned[key] = ""

        elif isinstance(value, (str, int, float, bool)):
            cleaned[key] = value

        else:
            cleaned[key] = str(value)

    return cleaned


def _clean_documents(docs):
    """
    Make sure every LangChain document contains
    Chroma-compatible metadata.
    """
    for doc in docs:
        doc.metadata = _clean_metadata(doc.metadata)

    return docs


def index_document(
    document_id,
    user_id,
    name,
    path,
    content_type,
    db=None,
):
    """
    Extract document text, split it into chunks,
    create embeddings and store the chunks in ChromaDB.
    """

    text, pages = parse_file(path, content_type)

    docs = []

    # ---------------------------------------------------------
    # PDF DOCUMENT
    # ---------------------------------------------------------
    if pages:

        for page in pages:

            page_text = page.get("text", "")

            if not page_text.strip():
                continue

            page_number = page.get("page", 0)

            metadata = {
                "document_id": str(document_id),
                "user_id": str(user_id),
                "document_name": str(name or "Unknown document"),
                "page": int(page_number or 0),
                "section": "",
            }

            metadata = _clean_metadata(metadata)

            page_docs = _splitter.create_documents(
                [page_text],
                metadatas=[metadata],
            )

            docs.extend(page_docs)

    # ---------------------------------------------------------
    # MARKDOWN DOCUMENT
    # ---------------------------------------------------------
    else:
        import re

        headings = list(
            re.finditer(
                r"(?m)^#{1,6}\s+(.+)$",
                text,
            )
        )

        if headings:

            for idx, match in enumerate(headings):

                section = match.group(1).strip()

                start = match.start()

                end = (
                    headings[idx + 1].start()
                    if idx + 1 < len(headings)
                    else len(text)
                )

                section_text = text[start:end].strip()

                if not section_text:
                    continue

                metadata = {
                    "document_id": str(document_id),
                    "user_id": str(user_id),
                    "document_name": str(name or "Unknown document"),
                    "page": 0,
                    "section": str(section or ""),
                }

                metadata = _clean_metadata(metadata)

                section_docs = _splitter.create_documents(
                    [section_text],
                    metadatas=[metadata],
                )

                docs.extend(section_docs)

        else:

            metadata = {
                "document_id": str(document_id),
                "user_id": str(user_id),
                "document_name": str(name or "Unknown document"),
                "page": 0,
                "section": "",
            }

            metadata = _clean_metadata(metadata)

            docs = _splitter.create_documents(
                [text],
                metadatas=[metadata],
            )

    # ---------------------------------------------------------
    # NO TEXT
    # ---------------------------------------------------------
    if not docs:
        raise ValueError(
            "No extractable text was found in the document."
        )

    # ---------------------------------------------------------
    # ADD CHUNK IDs
    # ---------------------------------------------------------
    for i, doc in enumerate(docs):

        doc.metadata["chunk_id"] = (
            f"{document_id}:{i}"
        )

        doc.metadata = _clean_metadata(
            doc.metadata
        )

    # ---------------------------------------------------------
    # CHROMA VECTOR DATABASE
    # ---------------------------------------------------------
    vectorstore = Chroma(
        collection_name="contextiq_documents",
        embedding_function=_embeddings(),
        persist_directory=settings.chroma_persist_directory,
    )

    ids = [
        str(doc.metadata["chunk_id"])
        for doc in docs
    ]

    # Final safety check before ChromaDB
    docs = _clean_documents(docs)

    vectorstore.add_documents(
        documents=docs,
        ids=ids,
    )

    # ---------------------------------------------------------
    # SAVE CHUNKS TO SQL DATABASE
    # ---------------------------------------------------------
    if db:

        from ..models import DocumentChunk

        for i, doc in enumerate(docs):

            page_value = doc.metadata.get("page")
            section_value = doc.metadata.get("section")

            # Convert empty page to None for SQL database
            if page_value == 0:
                page_value = None

            if section_value == "":
                section_value = None

            db.add(
                DocumentChunk(
                    id=str(doc.metadata["chunk_id"]),
                    document_id=document_id,
                    chunk_index=i,
                    page=page_value,
                    section=section_value,
                    text=doc.page_content,
                )
            )

    return text, len(docs)


def retrieve(
    document_id,
    user_id,
    question,
    k=5,
):
    """
    Retrieve the most relevant chunks belonging
    only to the specified user's document.
    """

    vectorstore = Chroma(
        collection_name="contextiq_documents",
        embedding_function=_embeddings(),
        persist_directory=settings.chroma_persist_directory,
    )

    return vectorstore.similarity_search(
        question,
        k=k,
        filter={
            "$and": [
                {
                    "document_id": str(document_id)
                },
                {
                    "user_id": str(user_id)
                },
            ]
        },
    )


def delete_document_vectors(
    document_id,
    user_id,
):
    """
    Delete all Chroma vectors belonging to
    the specified document and user.
    """

    vectorstore = Chroma(
        collection_name="contextiq_documents",
        embedding_function=_embeddings(),
        persist_directory=settings.chroma_persist_directory,
    )

    vectorstore.delete(
        where={
            "$and": [
                {
                    "document_id": str(document_id)
                },
                {
                    "user_id": str(user_id)
                },
            ]
        }
    )


def build_context(docs):
    """
    Convert retrieved documents into grounded
    context for the LLM.
    """

    context_parts = []

    for i, doc in enumerate(docs):

        page = doc.metadata.get("page")

        section = doc.metadata.get("section")

        page_display = (
            str(page)
            if page not in (None, 0, "")
            else "N/A"
        )

        section_display = (
            str(section)
            if section
            else "N/A"
        )

        context_parts.append(
            f"SOURCE {i + 1} | "
            f"Page: {page_display} | "
            f"Section: {section_display}\n"
            f"{doc.page_content}"
        )

    return (
        "\n\n--- RETRIEVED DOCUMENT CONTENT ---\n\n"
        .join(context_parts)
    )