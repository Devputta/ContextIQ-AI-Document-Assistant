<<<<<<< HEAD
'use client';import {useRef,useState} from 'react';import {AlertCircle,CheckCircle2,FileText,RotateCcw,UploadCloud,X} from 'lucide-react';import {apiFetch,getToken} from '@/lib/api';import {ALLOWED_EXTENSIONS,formatBytes,getFileType,DocumentRecord} from '@/lib/documents';
export function DocumentUpload({onUploaded}:{onUploaded?:()=>void}){const ref=useRef<HTMLInputElement>(null);const[items,setItems]=useState<any[]>([]);const[drag,setDrag]=useState(false);const max=Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB||20)*1024*1024;
 const add=(files:FileList|File[])=>Array.from(files).forEach(file=>{const id=crypto.randomUUID(),type=getFileType(file),error=!type?`Unsupported file type. Use ${ALLOWED_EXTENSIONS.join(', ')}.`:file.size>max?`File exceeds ${formatBytes(max)}.`:'';const item={id,file,progress:0,status:error?'Failed':'Uploading',error};setItems(x=>[...x,item]);if(!error)upload(item)});
 const upload=(item:any)=>{const xhr=new XMLHttpRequest();const form=new FormData();form.append('file',item.file);xhr.open('POST',`${process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8000'}/api/documents/upload`);xhr.setRequestHeader('Authorization',`Bearer ${getToken()}`);xhr.upload.onprogress=e=>e.lengthComputable&&setItems(x=>x.map(i=>i.id===item.id?{...i,progress:Math.round(e.loaded/e.total*100)}:i));xhr.onload=()=>{let d:any;try{d=JSON.parse(xhr.responseText)}catch{d={}}if(xhr.status>=200&&xhr.status<300){setItems(x=>x.map(i=>i.id===item.id?{...i,progress:100,status:d.status==='READY'?'Ready':'Failed',error:d.errorMessage,document:d}:i));if(d.status==='READY')onUploaded?.()}else setItems(x=>x.map(i=>i.id===item.id?{...i,status:'Failed',error:d.detail||'Upload failed.'}:i))};xhr.onerror=()=>setItems(x=>x.map(i=>i.id===item.id?{...i,status:'Failed',error:'Network error.'}:i));xhr.onabort=()=>setItems(x=>x.map(i=>i.id===item.id?{...i,status:'Cancelled',error:'Upload cancelled.'}:i));xhr.send(form);setItems(x=>x.map(i=>i.id===item.id?{...i,xhr}:i))};
 return <div><div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files)}} className={`rounded-2xl border border-dashed p-8 text-center ${drag?'border-cyan-300 bg-cyan-300/10':'border-white/15 bg-white/[.025]'}`}><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><UploadCloud size={25}/></div><h2 className="mt-4 text-lg font-semibold">Upload a source document</h2><p className="mt-2 text-sm text-slate-400">PDF, Markdown · max {formatBytes(max)}</p><button onClick={()=>ref.current?.click()} className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950">Browse files</button><input ref={ref} hidden type="file" multiple accept=".pdf,.md,.markdown,application/pdf,text/markdown" onChange={e=>{if(e.target.files)add(e.target.files);e.currentTarget.value=''}}/></div>{items.length>0&&<div className="mt-4 space-y-3">{items.map(i=><div key={i.id} className="rounded-xl border border-white/10 bg-white/[.03] p-4"><div className="flex gap-3"><FileText className="text-cyan-200"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i.file.name}</p><p className="text-xs text-slate-500">{formatBytes(i.file.size)} · {i.status}</p>{i.status==='Uploading'&&<div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{width:`${i.progress}%`}}/></div>}{i.error&&<p className="mt-2 flex gap-2 text-xs text-red-300"><AlertCircle size={14}/>{i.error}</p>}{i.status==='Ready'&&<p className="mt-2 flex gap-2 text-xs text-emerald-300"><CheckCircle2 size={14}/>Indexed and ready for grounded chat.</p>}</div>{i.status==='Uploading'?<button onClick={()=>i.xhr?.abort()}><X size={16}/></button>:i.status==='Failed'||i.status==='Cancelled'?<button onClick={()=>{setItems(x=>x.map(v=>v.id===i.id?{...v,status:'Uploading',error:'',progress:0}:v));upload({...i,status:'Uploading'})}}><RotateCcw size={16}/></button>:null}</div></div>)}</div>}</div>}
=======
use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, RotateCcw, UploadCloud, X } from "lucide-react";
import { ALLOWED_EXTENSIONS, formatBytes, getFileType, type DocumentRecord } from "@/lib/documents";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "Uploading" | "Uploaded" | "Failed" | "Cancelled";
  error?: string;
  xhr?: XMLHttpRequest;
  document?: DocumentRecord;
};

export function DocumentUpload({ onUploaded }: { onUploaded?: (doc: DocumentRecord) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  function validate(file: File) {
    const type = getFileType(file);
    const maxBytes = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES || 25 * 1024 * 1024);
    if (!type) return `Unsupported file type. Use ${ALLOWED_EXTENSIONS.join(", ")}.`;
    if (file.size > maxBytes) return `File exceeds the ${formatBytes(maxBytes)} upload limit.`;
    return null;
  }

  function addFiles(files: FileList | File[]) {
    Array.from(files).forEach(file => {
      const error = validate(file);
      const id = crypto.randomUUID();
      if (error) {
        setItems(prev => [...prev, { id, file, progress: 0, status: "Failed", error }]);
        return;
      }
      const item = { id, file, progress: 0, status: "Uploading" as const };
      setItems(prev => [...prev, item]);
      upload(item);
    });
  }

  function upload(item: UploadItem) {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", item.file);
    xhr.open("POST", `${API_BASE}/api/documents/upload`);
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: Math.round(event.loaded / event.total * 100) } : x));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: 100, status: "Uploaded", document: data } : x));
          onUploaded?.(data);
        } else throw new Error(data.detail || "Upload failed.");
      } catch (e) {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: "Failed", error: e instanceof Error ? e.message : "Upload failed." } : x));
      }
    };
    xhr.onerror = () => setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: "Failed", error: "Could not connect to the FastAPI server." } : x));
    xhr.onabort = () => setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: "Cancelled", error: "Upload cancelled." } : x));
    xhr.send(form);
    setItems(prev => prev.map(x => x.id === item.id ? { ...x, xhr } : x));
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`rounded-2xl border border-dashed p-8 text-center transition ${dragging ? "border-cyan-300 bg-cyan-300/10" : "border-white/15 bg-white/[0.025] hover:border-white/25"}`}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><UploadCloud size={25} /></div>
        <h2 className="mt-4 text-lg font-semibold">Drop documents here</h2>
        <p className="mt-2 text-sm text-slate-400">PDF, Markdown (.md) or .markdown</p>
        <button onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200">Browse files</button>
        <input ref={inputRef} type="file" multiple accept=".pdf,.md,.markdown,application/pdf,text/markdown" className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = ""; }} />
      </div>

      {items.length > 0 && <div className="mt-4 space-y-3">
        {items.map(item => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/5 text-cyan-200"><FileText size={19} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate font-medium">{item.file.name}</p>
                  <span className="text-xs text-slate-500">{formatBytes(item.file.size)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{getFileType(item.file) || "Invalid type"} · {item.status}</p>
                {item.status === "Uploading" && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300 transition-all" style={{ width: `${item.progress}%` }} /></div>}
                {item.error && <p className="mt-3 flex items-center gap-2 text-xs text-red-300"><AlertCircle size={14} />{item.error}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                {item.status === "Uploading" && <button title="Cancel" onClick={() => item.xhr?.abort()} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={16} /></button>}
                {(item.status === "Failed" || item.status === "Cancelled") && <button title="Retry" onClick={() => { setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: "Uploading", progress: 0, error: undefined } : x)); upload({ ...item, status: "Uploading", progress: 0, error: undefined }); }} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><RotateCcw size={16} /></button>}
              </div>
            </div>
            {item.status === "Uploaded" && <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={14} /> Stored successfully. Processing has not been claimed by the backend.</p>}
          </div>
        ))}
      </div>}
    </div>
  );
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
