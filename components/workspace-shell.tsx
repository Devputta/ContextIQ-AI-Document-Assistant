<<<<<<< HEAD
'use client';
import Link from 'next/link'; import {usePathname} from 'next/navigation'; import {FileText,FolderOpen,MessageSquare,Settings,Sparkles,LogOut,Menu} from 'lucide-react'; import {useAuth} from './auth-provider';
export function WorkspaceShell({children,active}:{children:React.ReactNode;active?:string}){const{user,loading,logout}=useAuth();const path=usePathname();
 if(loading)return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-400"><div className="animate-pulse">Loading ContextIQ…</div></div>;
 if(!user&&typeof window!=='undefined'){window.location.href=`/auth/login?next=${encodeURIComponent(path)}`;return null}
 return <main className="min-h-screen bg-slate-950 text-white"><div className="flex min-h-screen"><aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950 p-5 md:flex md:flex-col"><Brand/><nav className="mt-10 space-y-2"><Nav href="/dashboard" icon={FolderOpen} label="Dashboard" active={active==='Dashboard'}/><Nav href="/documents" icon={FileText} label="Documents" active={active==='Documents'}/><Nav href="/chat-history" icon={MessageSquare} label="Chat History" active={active==='Chat History'}/><Nav href="/settings" icon={Settings} label="Settings" active={active==='Settings'}/></nav><div className="mt-auto rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="truncate text-sm font-medium">{user?.username}</p><p className="truncate text-xs text-slate-500">{user?.email}</p><button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"><LogOut size={14}/> Logout</button></div></aside><section className="min-w-0 flex-1"><div className="border-b border-white/10 px-4 py-3 md:hidden"><div className="flex items-center justify-between"><Brand/><Menu size={20}/></div><div className="mt-3 flex gap-2 overflow-x-auto"><Nav href="/dashboard" icon={FolderOpen} label="Dashboard" active={active==='Dashboard'}/><Nav href="/documents" icon={FileText} label="Documents" active={active==='Documents'}/><Nav href="/chat-history" icon={MessageSquare} label="History" active={active==='Chat History'}/><Nav href="/settings" icon={Settings} label="Settings" active={active==='Settings'}/></div></div>{children}</section></div></main>}
function Brand(){return <Link href="/" className="flex items-center gap-3 px-2 py-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-950"><Sparkles size={18}/></span>Context<span className="text-cyan-300">IQ</span></Link>}
function Nav({href,icon:Icon,label,active}:{href:string;icon:React.ElementType;label:string;active:boolean}){return <Link href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active?'bg-white/10 text-white':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/>{label}</Link>}
=======
import Link from "next/link";
import { FileText, FolderOpen, MessageSquare, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function WorkspaceShell({ children, active = "Documents" }: { children: ReactNode; active?: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950 p-5 md:block">
          <Link href="/" className="flex items-center gap-3 px-2 py-3 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-950"><Sparkles size={18} /></span>
            Context<span className="text-cyan-300">IQ</span>
          </Link>
          <nav className="mt-10 space-y-2">
            <NavLink href="/dashboard" icon={FolderOpen} label="Dashboard" active={active === "Dashboard"} />
            <NavLink href="/documents" icon={FileText} label="Documents" active={active === "Documents"} />
            <NavLink href="/chat-history" icon={MessageSquare} label="Chat History" active={active === "Chat History"} />
            <NavLink href="/settings" icon={Settings} label="Settings" active={active === "Settings"} />
          </nav>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: React.ElementType; label: string; active: boolean }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</Link>;
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
