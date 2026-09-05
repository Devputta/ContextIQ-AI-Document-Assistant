<<<<<<< HEAD
'use client';import Link from 'next/link';import {useEffect,useMemo,useState} from 'react';import {ArrowUpDown,CalendarDays,Download,FileText,MessageSquare,PenLine,Search,Trash2} from 'lucide-react';import {apiBlob,apiFetch} from '@/lib/api';import {DocumentRecord,formatBytes} from '@/lib/documents';
export function DocumentList({refreshKey=0,onCount}:{refreshKey?:number;onCount?:(n:number)=>void}){const[docs,setDocs]=useState<any[]>([]),[q,setQ]=useState(''),[type,setType]=useState('all'),[sort,setSort]=useState('newest'),[error,setError]=useState('');const load=async()=>{try{const d=await apiFetch<any[]>('/api/documents');setDocs(d);onCount?.(d.length)}catch(e){setError(e instanceof Error?e.message:'Could not load documents.')}};useEffect(()=>{load()},[refreshKey]);const visible=useMemo(()=>docs.filter(d=>(!q||d.name.toLowerCase().includes(q.toLowerCase()))&&(type==='all'||d.type===type)).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='oldest'?+new Date(a.createdAt)-+new Date(b.createdAt):+new Date(b.createdAt)-+new Date(a.createdAt)),[docs,q,type,sort]);async function remove(id:string){if(!confirm('Delete this document and its conversations, chunks, file and vectors?'))return;try{await apiFetch(`/api/documents/${id}`,{method:'DELETE'});setDocs(x=>x.filter(d=>d.id!==id));onCount?.(docs.length-1)}catch(e){setError(e instanceof Error?e.message:'Delete failed.')}}async function rename(d:any){const n=prompt('New filename',d.name);if(!n||n===d.name)return;try{const updated=await apiFetch<any>(`/api/documents/${d.id}`,{method:'PATCH',body:JSON.stringify({name:n})});setDocs(x=>x.map(v=>v.id===d.id?updated:v))}catch(e){setError(e instanceof Error?e.message:'Rename failed.')}}async function download(d:any){const blob=await apiBlob(`/api/documents/${d.id}/download`);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=d.name;a.click();URL.revokeObjectURL(a.href)}return <div><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search filename…" className="w-full rounded-xl border border-white/10 bg-white/[.03] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-300/40"/></label><select value={type} onChange={e=>setType(e.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm"><option value="all">All types</option><option>PDF</option><option>MARKDOWN</option></select><button onClick={()=>setSort(s=>s==='newest'?'oldest':s==='oldest'?'name':'newest')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm"><ArrowUpDown size={15}/> {sort}</button></div>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<div className="mt-5 space-y-3">{visible.length===0?<div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-slate-500">No search results.</div>:visible.map(d=><article key={d.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-cyan-200"><FileText size={21}/></div><div className="min-w-0"><h3 className="truncate font-medium">{d.name}</h3><p className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500"><span>{d.type}</span><span>{formatBytes(d.sizeBytes)}</span><span><CalendarDays size={12} className="mr-1 inline"/>{new Date(d.createdAt).toLocaleString()}</span></p></div></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{d.status}</span><div className="flex flex-wrap gap-2"><Link href={`/documents/${d.id}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Open</Link><Link href={`/documents/${d.id}?chat=1`} className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/20 px-3 py-2 text-xs text-cyan-200"><MessageSquare size={13}/>Chat</Link><button onClick={()=>rename(d)} title="Rename" className="rounded-lg border border-white/10 px-3 py-2"><PenLine size={13}/></button><button onClick={()=>download(d)} title="Download" className="rounded-lg border border-white/10 px-3 py-2"><Download size={13}/></button><button onClick={()=>remove(d.id)} title="Delete" className="rounded-lg border border-red-300/10 px-3 py-2 text-red-300"><Trash2 size={13}/></button></div></div>{d.errorMessage&&<p className="mt-3 text-xs text-red-300">{d.errorMessage}</p>}</article>)}</div></div>}
=======
use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Bot, CalendarDays, FileText, MessageSquare, Search, Trash2 } from "lucide-react";
import { formatBytes, type DocumentRecord } from "@/lib/documents";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function DocumentList({ refreshKey = 0, onCount }: { refreshKey?: number; onCount?: (count: number) => void }) {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/documents`, { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load documents.");
      const data = await res.json();
      setDocs(data);
      onCount?.(data.length);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load documents."); }
  }
  useEffect(() => { load(); }, [refreshKey]);

  const visible = useMemo(() => docs.filter(d => {
    const q = query.toLowerCase();
    return (!q || d.name.toLowerCase().includes(q)) && (type === "all" || d.fileType === type);
  }).sort((a,b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "newest" ? +new Date(b.uploadedAt) - +new Date(a.uploadedAt) : +new Date(a.uploadedAt) - +new Date(b.uploadedAt)), [docs, query, type, sort]);

  async function remove(id: string) {
    if (!window.confirm("Delete this document? This is designed to remove the original, extracted text, embeddings/vector records, and document-specific chat history when those stores are connected.")) return;
    const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) { setError("Delete failed."); return; }
    setDocs(prev => prev.filter(d => d.id !== id));
    onCount?.(docs.length - 1);
  }

  return <div>
    <div className="flex flex-col gap-3 lg:flex-row">
      <label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documents..." className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-300/40"/></label>
      <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none"><option value="all">All types</option><option>PDF</option><option>Markdown</option></select>
      <button onClick={() => setSort(s => s === "newest" ? "oldest" : s === "oldest" ? "name" : "newest")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5"><ArrowUpDown size={15}/>Sort: {sort}</button>
    </div>
    {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    <div className="mt-5 space-y-3">
      {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-slate-500">No documents match your filters.</div> : visible.map(doc => <DocumentCard key={doc.id} doc={doc} onDelete={() => remove(doc.id)} />)}
    </div>
  </div>;
}

function DocumentCard({ doc, onDelete }: { doc: DocumentRecord; onDelete: () => void }) {
  const statusClass = doc.status === "Ready" ? "text-emerald-300 bg-emerald-300/10" : doc.status === "Failed" ? "text-red-300 bg-red-300/10" : doc.status === "Processing" ? "text-amber-300 bg-amber-300/10" : "text-slate-300 bg-white/10";
  return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-cyan-200"><FileText size={21}/></div>
        <div className="min-w-0"><h3 className="truncate font-medium">{doc.name}</h3><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span>{doc.fileType}</span><span>{formatBytes(doc.size)}</span><span className="inline-flex items-center gap-1"><CalendarDays size={12}/>{new Date(doc.uploadedAt).toLocaleString()}</span></div></div>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>{doc.status}</span>
      <div className="flex flex-wrap gap-2">
        <Link href={`/documents/${doc.id}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium hover:bg-white/5">Open</Link>
        <Link href={`/documents/${doc.id}?chat=1`} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-300/10"><MessageSquare size={13}/>Chat</Link>
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-300/10"><Trash2 size={13}/>Delete</button>
      </div>
    </div>
    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Bot size={14}/>Processing status is reported by the backend; this Day 3 backend intentionally does not claim RAG indexing yet.</p>
  </article>;
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
