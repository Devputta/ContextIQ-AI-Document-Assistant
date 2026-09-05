<<<<<<< HEAD
'use client';import Link from 'next/link';import {ArrowLeft,Download} from 'lucide-react';import {useParams} from 'next/navigation';import {WorkspaceShell} from '@/components/workspace-shell';import DocumentViewerClient from '@/components/document-viewer-client';import {apiBlob} from '@/lib/api';
export default function Page(){const p=useParams<{id:string}>();return <WorkspaceShell active="Documents"><header className="flex items-center justify-between border-b border-white/10 px-5 py-4"><Link href="/documents" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Documents</Link><button onClick={async()=>{const b=await apiBlob(`/api/documents/${p.id}/download`);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='document';a.click()}} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs"><Download size={14}/> Download</button></header><DocumentViewerClient id={p.id}/></WorkspaceShell>}
=======
import Link from "next/link";
import { ArrowLeft, Bot, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { DocumentPreview } from "@/components/document-viewer-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getDocument(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/documents/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function DocumentViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  return <WorkspaceShell active="Documents">
    <header className="border-b border-white/10 px-6 py-5"><Link href="/documents" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to documents</Link></header>
    <div className="mx-auto max-w-7xl px-6 py-8">
      {!doc ? <div className="rounded-2xl border border-red-300/10 bg-red-300/5 p-8"><h1 className="text-xl font-semibold">Document not found</h1><p className="mt-2 text-sm text-slate-400">The document may have been deleted or the FastAPI service may be unavailable.</p></div> :
      <><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-sm text-cyan-300">DOCUMENT VIEWER</p><h1 className="mt-2 truncate text-2xl font-semibold">{doc.name}</h1><p className="mt-1 text-sm text-slate-500">{doc.fileType} · {doc.status}</p></div><Link href={`/documents/${id}?chat=1`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 px-4 py-2.5 text-sm text-cyan-200"><MessageSquare size={16}/> Open chat</Link></div>
      <div className="mt-7 grid min-h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-h-[600px] border-b border-white/10 lg:border-b-0 lg:border-r"><div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-medium"><FileText size={17} className="text-cyan-200"/> Document preview</div><DocumentPreview id={id} fileType={doc.fileType} /></div>
        <aside className="flex flex-col"><div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-medium"><Bot size={17} className="text-cyan-200"/> Document chat</div><div className="flex-1 p-5"><div className="rounded-xl border border-amber-300/10 bg-amber-300/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-amber-200"><ShieldCheck size={15}/> Chat is intentionally not enabled yet</p><p className="mt-2 text-xs leading-5 text-slate-500">Day 3 stores and manages documents only. No answer is generated and no processing/indexing is implied.</p></div></div><div className="border-t border-white/10 p-4"><input disabled placeholder="Ask about this document (Day 5)" className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-slate-500"/></div></aside>
      </div></>}
    </div>
  </WorkspaceShell>;
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
