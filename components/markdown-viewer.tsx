<<<<<<< HEAD
'use client';import {useEffect,useMemo,useRef,useState} from 'react';import {apiFetch} from '@/lib/api';
function slug(s:string){return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')}
function render(md:string){return md.split(/\r?\n/).map((line,i)=>{const h=/^(#{1,6})\s+(.+)$/.exec(line);if(h){const n=h[1].length;const title=h[2].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return `<h${n} id="section-${slug(h[2])}">${title}</h${n}>`}if(!line.trim())return '<br/>';return `<p>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`}).join('')}
export default function MarkdownViewer({id,onSection}:{id:string;onSection?:(s:string)=>void}){const[content,setContent]=useState('');const ref=useRef<HTMLDivElement>(null);useEffect(()=>{apiFetch<string>(`/api/documents/${id}/content`).then(setContent).catch(()=>setContent(''))},[id]);useEffect(()=>{const h=(e:any)=>{const el=document.getElementById('section-'+slug(String(e.detail||'')));el?.scrollIntoView({behavior:'smooth',block:'start'})};window.addEventListener('contextiq:section',h);return()=>window.removeEventListener('contextiq:section',h)},[]);return <div ref={ref} className="markdown-content h-full overflow-auto p-7" dangerouslySetInnerHTML={{__html:render(content)}}/>}
=======
"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!));
}
function inline(value: string) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(md: string) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0, inCode = false, code: string[] = [], lang = "";
  let list: "ul" | "ol" | null = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCode) { closeList(); inCode = true; lang = line.slice(3).trim(); code = []; }
      else { out.push(`<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(code.join("\n"))}</code></pre>`); inCode = false; }
      i++; continue;
    }
    if (inCode) { code.push(line); i++; continue; }
    if (!line.trim()) { closeList(); i++; continue; }

    const tableSep = i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1]);
    if (line.includes("|") && tableSep) {
      closeList();
      const cells = (s: string) => s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(x => x.trim());
      const head = cells(line);
      i += 2;
      const rows: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(`<tr>${cells(lines[i]).map(c => `<td>${inline(c)}</td>`).join("")}</tr>`); i++;
      }
      out.push(`<div class="overflow-x-auto"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`);
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) { closeList(); const n = heading[1].length; out.push(`<h${n}>${inline(heading[2])}</h${n}>`); i++; continue; }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) { closeList(); const q = [quote[1]]; while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) { i++; q.push(lines[i].replace(/^>\s?/, "")); } out.push(`<blockquote>${q.map(inline).join("<br/>")}</blockquote>`); i++; continue; }
    const ul = /^[-*+]\s+(.+)$/.exec(line);
    const ol = /^\d+\.\s+(.+)$/.exec(line);
    if (ul || ol) {
      const wanted = ul ? "ul" : "ol";
      if (list !== wanted) { closeList(); out.push(`<${wanted}>`); list = wanted; }
      out.push(`<li>${inline((ul || ol)![1])}</li>`); i++; continue;
    }
    if (/^---+$/.test(line.trim())) { closeList(); out.push("<hr/>"); i++; continue; }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  if (inCode) out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  closeList();
  return out.join("");
}

export function MarkdownViewer({ id }: { id: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${API_BASE}/api/documents/${id}/content`).then(async r => {
      if (!r.ok) throw new Error("Could not load Markdown content.");
      return r.text();
    }).then(setContent).catch(e => setError(e.message));
  }, [id]);
  if (error) return <div className="p-8 text-sm text-red-300"><AlertCircle className="mb-2" size={18}/>{error}</div>;
  if (!content) return <div className="p-8 text-sm text-slate-500">Loading Markdown…</div>;
  return <article className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
