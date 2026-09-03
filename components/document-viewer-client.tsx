"use client";

import { FileText } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function DocumentPreview({ id, fileType }: { id: string; fileType: "PDF" | "Markdown" }) {
  if (fileType === "PDF") return <iframe title="PDF document preview" src={`${API_BASE}/api/documents/${id}/content`} className="h-[620px] w-full bg-slate-900" />;
  return <div className="h-[620px] overflow-auto p-7"><MarkdownViewer id={id} /></div>;
}
