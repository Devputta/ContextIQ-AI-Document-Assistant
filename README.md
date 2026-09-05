# ContextIQ — Context-Aware AI Document Assistant

**Your Documents. Your Context. Intelligent Answers.**

ContextIQ is a portfolio-ready RAG application for asking grounded questions about PDFs and Markdown files. It extracts source text, creates semantic chunks, embeds them into ChromaDB, retrieves relevant passages, sends only retrieved context to an LLM, and returns source-aware answers with page/section navigation.

## Problem

Generic chatbots can answer confidently without showing where information came from. ContextIQ is designed around traceability: every answer is grounded in retrieved document chunks and the UI exposes the exact source metadata returned by the backend.

## Features

- Real account registration/login with password hashing and bearer sessions
- User-scoped documents, vectors, conversations and messages
- PDF and Markdown upload with size/type validation and progress
- Real text extraction, chunking, embeddings and ChromaDB indexing
- Semantic retrieval constrained by document + user ID
- Ollama-backed grounded RAG chat with streaming SSE responses
- Backend-generated citations; no frontend-generated fake page numbers
- PDF viewer with page navigation, zoom, search action and fullscreen
- Markdown section citations and safe escaped rendering
- Persistent conversations, automatic titles, search, rename and delete
- Global document search, rename, download and delete
- Settings, storage dashboard, password change and logout-all-sessions
- Friendly empty/loading/error states
- Request IDs, structured logging, CORS configuration and rate-limit preparation
- Dockerfiles, Compose and FastAPI OpenAPI/Swagger

## Architecture

```mermaid
flowchart LR
  A[Next.js + TypeScript] -->|Bearer API| B[FastAPI]
  B --> C[Auth + PostgreSQL/SQLite]
  B --> D[PDF/Markdown extraction]
  D --> E[Chunking]
  E --> F[Embeddings]
  F --> G[ChromaDB]
  H[User question] --> B
  B --> G
  G --> I[Semantic retrieval]
  I --> J[Context construction]
  J --> K[Ollama LLM]
  K --> L[Grounded answer + source metadata]
  L --> A
```

## RAG workflow

`Document → Text Extraction → Chunking → Embeddings → ChromaDB → Semantic Retrieval → Context Construction → LLM → Grounded Answer → Source Citation → Document Navigation`

Retrieved document content is explicitly treated as **untrusted data** in the LLM prompt so instructions embedded in uploaded documents are not treated as system commands.

## Stack

**Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, Lucide

**Backend:** Python 3.12, FastAPI, SQLAlchemy, LangChain, pypdf

**AI/Data:** sentence-transformers embeddings, ChromaDB, Ollama

**Storage:** SQLite by default; PostgreSQL-compatible SQLAlchemy configuration

## Project structure

```text
ContextIQ/
├── app/                 # Next.js pages
├── components/          # Workspace, upload, viewer and chat UI
├── lib/                 # API/auth/document helpers
├── public/              # Favicon/logo
├── backend/
│   ├── app/
│   │   ├── routers/     # auth, documents, chat
│   │   ├── services/    # parsing, RAG, LLM
│   │   ├── models.py
│   │   └── main.py
│   ├── storage/         # runtime files (ignored by Git)
│   └── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Installation

### 1. Frontend

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### 2. Backend

```cmd
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

FastAPI docs: `http://localhost:8000/docs`

Health: `http://localhost:8000/health`

### 3. Ollama

Install Ollama separately and pull a local model:

```bash
ollama pull llama3.2:3b
```

Keep Ollama running before asking ContextIQ questions.

## Environment variables

Backend:

```text
DATABASE_URL=sqlite:///./contextiq.db
UPLOAD_DIR=./storage/uploads
CHROMA_PERSIST_DIRECTORY=./storage/chroma
MAX_UPLOAD_MB=20
CORS_ORIGINS=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-secret
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2:3b
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CHROMA_HOST=
CHROMA_PORT=
```

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MAX_UPLOAD_MB=20
```

Never commit real secrets.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Authenticate |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/logout-all` | Invalidate sessions |
| POST | `/api/documents/upload` | Upload + index |
| GET | `/api/documents` | List own documents |
| GET | `/api/documents/{id}` | Document metadata |
| GET | `/api/documents/{id}/content` | Markdown content |
| GET | `/api/documents/{id}/download` | Download source |
| PATCH | `/api/documents/{id}` | Rename |
| DELETE | `/api/documents/{id}` | Delete file/chunks/vectors/chats |
| GET | `/api/documents/{id}/suggestions` | Source-aware suggestions |
| POST | `/api/chat` | Non-streaming chat |
| POST | `/api/chat/stream` | SSE streaming chat |
| GET | `/api/conversations` | History |
| GET | `/api/conversations/{id}` | Conversation + messages |
| PATCH | `/api/conversations/{id}` | Rename |
| DELETE | `/api/conversations/{id}` | Delete |
| GET | `/health` | Service health |

## Docker

```bash
copy backend\.env.example backend\.env
docker compose up --build
```

The frontend is available on port 3000 and FastAPI on port 8000. For production, put a reverse proxy/TLS layer in front and use managed PostgreSQL plus a production vector service where appropriate.

## Security considerations

- All document/conversation/vector access is scoped to the authenticated user.
- Passwords are PBKDF2-SHA256 hashed; plaintext passwords are never stored.
- Upload paths use generated UUID filenames rather than user-controlled paths.
- File type and size are validated server-side.
- Markdown output is escaped before HTML rendering.
- Retrieved content is marked untrusted in the prompt to reduce prompt-injection risk.
- Backend errors avoid returning stack traces.
- CORS is configurable.
- In-memory request rate limiting is included as preparation; use a shared Redis-backed limiter for multi-instance production.
- Use a strong random `AUTH_SECRET` in production.

## Screenshots

Add screenshots here after deployment:

```text
screenshots/
├── landing.png
├── dashboard.png
├── document-viewer.png
├── chat-citations.png
└── chat-history.png
```

## Future improvements

- Managed PostgreSQL + migrations with Alembic
- Pinecone/managed Chroma for scalable vector storage
- Redis rate limiting and background job queue
- True Google OAuth callback flow and transactional password-reset email
- Better PDF text highlighting using PDF.js text-layer coordinates
- Token streaming through a production reverse proxy
- Observability with OpenTelemetry and centralized logs
- Multi-document chat and workspace sharing
