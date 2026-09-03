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
