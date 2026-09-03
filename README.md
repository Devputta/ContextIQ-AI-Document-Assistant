# ContextIQ — Day 3

ContextIQ is a context-aware AI document assistant built incrementally across a 7-day plan.

## Included in this Day 3 package

Day 3 extends the Day 1 + Day 2 codebase without removing authentication UI or the existing landing page.

### Document management
- PDF, `.md`, and `.markdown` uploads
- Configurable maximum upload size
- Drag-and-drop and browse
- Upload progress using `XMLHttpRequest`
- Client-side file type/size validation
- Cancel, retry, success and error states
- Documents page with search, type filter and sort
- Upload date, size and processing status
- Open, Chat and Delete actions
- Delete confirmation

### Viewer preparation
- `/documents/[id]` two-pane document viewer
- PDF preview through the FastAPI content endpoint
- Safe Markdown rendering with headings, lists, tables, code blocks, links and blockquotes
- Chat placeholder on the right
- Layout leaves room for future page/anchor citation navigation

### FastAPI preparation
Implemented:
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/{id}`
- `DELETE /api/documents/{id}`
- `GET /api/documents/{id}/content`
- `PATCH /api/documents/{id}/status` for development/testing of lifecycle states
- `GET /health`

The Day 3 backend deliberately stops at durable upload. It returns `Uploaded` and does **not** claim extraction, chunking, embeddings, vector indexing, or `Ready` until those systems actually exist.

The deletion model uses a stable `document_id` and a single delete boundary so future stores can cascade:
1. original document
2. extracted text
3. embeddings
4. Chroma/vector records
5. document-specific chat history

## Project structure

```text
ContextIQ-Day3/
├── app/
│   ├── auth/                 # Day 2 authentication UI
│   ├── dashboard/
│   ├── documents/
│   │   └── [id]/
│   └── page.tsx              # Day 1 landing page
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── components/
│   ├── auth.tsx
│   ├── document-list.tsx
│   ├── document-upload.tsx
│   ├── document-viewer-client.tsx
│   ├── markdown-viewer.tsx
│   └── workspace-shell.tsx
└── lib/
    └── documents.ts
```

## Run frontend

From the project root:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`

Copy `.env.example` to `.env.local` and adjust:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MAX_UPLOAD_BYTES=26214400
```

`NEXT_PUBLIC_MAX_UPLOAD_BYTES` is the browser validation limit. The backend has its own authoritative limit.

## Run FastAPI

From the project root:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Then:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Optional backend environment:

```env
MAX_UPLOAD_BYTES=26214400
DOCUMENT_STORAGE_DIR=./backend/storage
CORS_ORIGINS=http://localhost:3000
```

The storage directory is intentionally ignored by Git.

## Important Day 3 processing boundary

An uploaded file is stored and reported as:

`Uploaded`

It is **not** automatically changed to:

`Processing` → `Ready`

because Day 3 does not yet have the real parser/chunking/embedding/RAG pipeline. This prevents the UI from misleading users.

The status model already supports:

`Uploading | Uploaded | Processing | Ready | Failed`

## Seven-day architecture

```text
Frontend
Next.js / React
      │
      │ REST API / SSE
      ▼
FastAPI Backend
      │
      ├── PDF / Markdown Parser       ← next stage
      ├── Text Chunking               ← next stage
      ├── Embedding Generation       ← next stage
      ├── RAG Retrieval              ← next stage
      ├── LLM                        ← next stage
      └── Citation Generator         ← next stage
      │
      ├───────────────┐
      ▼               ▼
ChromaDB        Metadata Database
Vectors         Users/Documents/Chats
```

## Day 1 + Day 2 preserved

The landing page, responsive UI, reusable components, authentication screens, password policy and protected-route architecture remain in the project. Day 3 adds the document layer rather than replacing those features.
