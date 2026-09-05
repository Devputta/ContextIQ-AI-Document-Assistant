<<<<<<< HEAD
'use client';import Link from 'next/link';import {useEffect,useState} from 'react';import {Database,FileText,MessageSquare,Sparkles,Upload,ArrowRight} from 'lucide-react';import {WorkspaceShell} from '@/components/workspace-shell';import {apiFetch} from '@/lib/api';import {formatBytes} from '@/lib/documents';
export default function Dashboard(){const[docs,setDocs]=useState<any[]>([]),[convs,setConvs]=useState<any[]>([]);useEffect(()=>{Promise.all([apiFetch<any[]>('/api/documents'),apiFetch<any[]>('/api/conversations')]).then(([d,c])=>{setDocs(d);setConvs(c)}).catch(()=>{})},[]);const storage=docs.reduce((n,d)=>n+d.sizeBytes,0);return <WorkspaceShell active="Dashboard"><div className="mx-auto max-w-7xl px-5 py-10"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs tracking-widest text-cyan-300">WORKSPACE</p><h1 className="mt-2 text-4xl font-semibold">Your document intelligence workspace</h1><p className="mt-3 max-w-2xl text-slate-400">Upload → Retrieve → Ask → Cite. ContextIQ keeps answers tied to the sources you provide.</p></div><Link href="/documents#upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"><Upload size={17}/> Upload document</Link></div><div className="mt-10 grid gap-4 md:grid-cols-3"><Stat icon={FileText} title="Documents" value={String(docs.length)} note="Private to your account"/><Stat icon={MessageSquare} title="Conversations" value={String(convs.length)} note="Persistent chat history"/><Stat icon={Database} title="Storage" value={formatBytes(storage)} note="Original uploads"/></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent documents</h2><Link href="/documents" className="text-xs text-cyan-200">View all <ArrowRight className="inline" size={12}/></Link></div><div className="mt-5 space-y-2">{docs.slice(0,5).map(d=><Link key={d.id} href={`/documents/${d.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5"><FileText size={16} className="text-cyan-200"/><span className="min-w-0 flex-1 truncate text-sm">{d.name}</span><span className="text-xs text-slate-500">{d.status}</span></Link>)}{!docs.length&&<Empty text="No documents yet. Upload a PDF or Markdown source to begin."/>}</div></section><section className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent conversations</h2><Link href="/chat-history" className="text-xs text-cyan-200">History <ArrowRight className="inline" size={12}/></Link></div><div className="mt-5 space-y-2">{convs.slice(0,5).map(c=><Link key={c.id} href={`/documents/${c.documentId}`} className="block rounded-xl p-3 hover:bg-white/5"><p className="truncate text-sm">{c.title}</p><p className="mt-1 text-xs text-slate-500">{c.documentName} · {c.messageCount} messages</p></Link>)}{!convs.length&&<Empty text="No conversations yet. Open a ready document and ask a question."/>}</div></section></div><div className="mt-6 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.03] p-6"><div className="flex items-center gap-3"><Sparkles size={18} className="text-cyan-200"/><h2 className="font-semibold">Grounded RAG pipeline</h2></div><p className="mt-2 text-sm text-slate-400">Text extraction → chunking → embeddings → ChromaDB → semantic retrieval → context construction → LLM → cited answer → source navigation.</p></div></div></WorkspaceShell>}
function Stat({icon:Icon,title,value,note}:{icon:React.ElementType;title:string;value:string;note:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><Icon size={17} className="text-cyan-200"/><p className="mt-5 text-3xl font-semibold">{value}</p><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>}function Empty({text}:{text:string}){return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">{text}</div>}
=======
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
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
