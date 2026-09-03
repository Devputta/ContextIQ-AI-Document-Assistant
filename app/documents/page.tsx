"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentList } from "@/components/document-list";

export default function DocumentsPage() {
  const [refresh, setRefresh] = useState(0);
  return <WorkspaceShell active="Documents">
    <header className="border-b border-white/10 px-6 py-5"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to dashboard</Link></header>
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm text-cyan-300">DOCUMENT LIBRARY</p><h1 className="mt-2 text-3xl font-semibold">Documents</h1><p className="mt-2 text-slate-400">Upload, organize and inspect your source material.</p></div>
        <a href="#upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"><FilePlus2 size={17}/> Upload document</a>
      </div>
      <section id="upload" className="mt-8"><DocumentUpload onUploaded={() => setRefresh(x => x + 1)} /></section>
      <section className="mt-10"><div className="mb-4"><h2 className="text-lg font-semibold">Your documents</h2><p className="text-sm text-slate-500">Search, sort and filter your uploads.</p></div><DocumentList refreshKey={refresh}/></section>
    </div>
  </WorkspaceShell>;
}
