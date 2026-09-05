from pathlib import Path
from pypdf import PdfReader

def parse_file(path: str, content_type: str):
    suffix = Path(path).suffix.lower()
    if suffix in {".md", ".markdown"}:
        return Path(path).read_text(encoding="utf-8", errors="replace"), []
    if suffix == ".pdf":
        reader = PdfReader(path)
        pages = [{"page": i, "text": p.extract_text() or ""}
                 for i, p in enumerate(reader.pages, start=1)]
        return "\n\n".join(x["text"] for x in pages), pages
    raise ValueError("Unsupported document type.")
