import json
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = Path(os.getenv("DOCUMENT_STORAGE_DIR", BASE_DIR / "storage"))
METADATA_FILE = STORAGE_DIR / "documents.json"
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))
ALLOWED_EXTENSIONS = {".pdf", ".md", ".markdown"}
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="ContextIQ API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_docs():
    if not METADATA_FILE.exists():
        return []
    try:
        return json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

def save_docs(docs):
    tmp = METADATA_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(docs, indent=2), encoding="utf-8")
    tmp.replace(METADATA_FILE)

def file_type(name: str):
    suffix = Path(name).suffix.lower()
    return "PDF" if suffix == ".pdf" else "Markdown"

def now():
    return datetime.now(timezone.utc).isoformat()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Unsupported file type. Only PDF, .md and .markdown are allowed.")

    doc_id = str(uuid.uuid4())
    target = STORAGE_DIR / f"{doc_id}{suffix}"
    total = 0
    try:
        with target.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    out.close()
                    target.unlink(missing_ok=True)
                    raise HTTPException(413, f"File exceeds the {MAX_UPLOAD_BYTES} byte limit.")
                out.write(chunk)
    except HTTPException:
        raise
    except Exception:
        target.unlink(missing_ok=True)
        raise HTTPException(500, "Could not store document.")

    doc = {
        "id": doc_id,
        "name": file.filename,
        "fileType": file_type(file.filename or ""),
        "mimeType": file.content_type or ("application/pdf" if suffix == ".pdf" else "text/markdown"),
        "size": total,
        "uploadedAt": now(),
        "status": "Uploaded",
        "error": None,
    }
    docs = load_docs()
    docs.append(doc)
    save_docs(docs)
    # Day 3 intentionally stops at durable upload. No fake extraction/embedding/Ready state.
    return doc

@app.get("/api/documents")
def list_documents():
    return load_docs()

@app.get("/api/documents/{document_id}")
def get_document(document_id: str):
    doc = next((d for d in load_docs() if d["id"] == document_id), None)
    if not doc:
        raise HTTPException(404, "Document not found.")
    return doc

@app.get("/api/documents/{document_id}/content")
def document_content(document_id: str):
    doc = next((d for d in load_docs() if d["id"] == document_id), None)
    if not doc:
        raise HTTPException(404, "Document not found.")
    path = next(STORAGE_DIR.glob(f"{document_id}.*"), None)
    if not path or not path.exists():
        raise HTTPException(404, "Original document is missing.")
    if doc["fileType"] == "PDF":
        return FileResponse(path, media_type="application/pdf", filename=doc["name"])
    return PlainTextResponse(path.read_text(encoding="utf-8", errors="replace"), media_type="text/markdown")

@app.delete("/api/documents/{document_id}")
def delete_document(document_id: str):
    docs = load_docs()
    doc = next((d for d in docs if d["id"] == document_id), None)
    if not doc:
        raise HTTPException(404, "Document not found.")
    for path in STORAGE_DIR.glob(f"{document_id}.*"):
        path.unlink(missing_ok=True)

    # Future cascade hooks: extracted text, embeddings, Chroma/vector records, and document chat history.
    # They are represented by the same document_id so deletion can become transactional when those stores exist.
    save_docs([d for d in docs if d["id"] != document_id])
    return {"deleted": True, "id": document_id}

class ProcessingStatus(BaseModel):
    status: str

@app.patch("/api/documents/{document_id}/status")
def set_status(document_id: str, payload: ProcessingStatus):
    allowed = {"Uploading", "Uploaded", "Processing", "Ready", "Failed"}
    if payload.status not in allowed:
        raise HTTPException(400, "Invalid processing status.")
    docs = load_docs()
    for doc in docs:
        if doc["id"] == document_id:
            doc["status"] = payload.status
            save_docs(docs)
            return doc
    raise HTTPException(404, "Document not found.")
