"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Database, FileText, FolderOpen, MessageSquare, Settings, Sparkles, Upload } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { formatBytes, type DocumentRecord } from "@/lib/documents";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Dashboard() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  useEffect(() => { fetch(`${API_BASE}/api/documents`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).then(setDocs).catch(() => setDocs([])); }, []);
  const storage = docs.reduce((n, d) => n + d.size, 0);
  return <WorkspaceShell active="Dashboard">
    <header className="border-b border-white/10 px-6 py-5"><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to home</Link></header>
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><p className="text-sm text-cyan-300">WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold">Welcome to ContextIQ</h1><p className="mt-2 text-slate-400">Your document intelligence workspace.</p></div>
        <Link href="/documents#upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-slate-950 hover:bg-slate-200"><Upload size={18}/> Upload Document</Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat icon={FileText} title="Documents" value={String(docs.length)} note={docs.length ? "Uploaded documents" : "No documents yet"} />
        <Stat icon={MessageSquare} title="Conversations" value="0" note="Chat enabled in a later day" />
        <Stat icon={Database} title="Storage" value={formatBytes(storage)} note="Original uploads stored" />
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><FileText size={18} className="text-cyan-300"/><h2 className="font-semibold">Recent Documents</h2></div><Link href="/documents" className="text-sm text-cyan-200 hover:underline">View all</Link></div>
        {docs.length === 0 ? <div className="py-14 text-center"><p className="text-sm text-slate-400">Your uploaded documents will appear here.</p></div> :
          <div className="mt-5 space-y-3">{docs.slice(-5).reverse().map(d => <Link key={d.id} href={`/documents/${d.id}`} className="flex items-center gap-3 rounded-xl border border-white/5 p-4 hover:bg-white/5"><FileText size={18} className="text-cyan-200"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{d.name}</p><p className="text-xs text-slate-500">{d.fileType} · {formatBytes(d.size)}</p></div><span className="text-xs text-slate-400">{d.status}</span></Link>)}</div>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Empty title="Recent Conversations" icon={Clock3} text="Questions and answers will appear here once chat is enabled." />
        <Empty title="Processing Pipeline" icon={Sparkles} text="Day 3 stops after durable upload. Extraction, chunking, embeddings and RAG will be added without changing this document model." />
      </div>
    </div>
  </WorkspaceShell>;
}
function Stat({icon: Icon, title, value, note}: {icon: React.ElementType; title:string; value:string; note:string}) { return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-3 text-slate-400"><Icon size={17}/>{title}</div><p className="mt-5 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>; }
function Empty({title, icon: Icon, text}: {title:string; icon:React.ElementType; text:string}) { return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center gap-3"><Icon size={18} className="text-cyan-300"/><h2 className="font-semibold">{title}</h2></div><div className="py-14 text-center"><p className="text-sm text-slate-400">{text}</p></div></div>; }
