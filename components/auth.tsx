<<<<<<< HEAD
import Link from 'next/link';import {LockKeyhole} from 'lucide-react';
export function AuthCard({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl"><div className="mb-6 text-center"><div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800"><LockKeyhole size={20}/></div><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-slate-400">{subtitle}</p></div>{children}</section>}
export function GoogleButton(){return <button type="button" disabled title="Google OAuth can be enabled with GOOGLE_CLIENT_ID/SECRET" className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-500">Google OAuth — configure provider to enable</button>}
export function Field({label,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:string}){return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">{label}</span><input {...props} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50"/></label>}
export function AuthFooter({children}:{children:React.ReactNode}){return <p className="mt-6 text-center text-sm text-slate-400">{children}</p>}
=======
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function AuthCard({title, subtitle, children}: {title:string; subtitle:string; children:React.ReactNode}) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800"><LockKeyhole size={20}/></div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>{children}
  </section>;
}
export function GoogleButton() {
  return <button type="button" className="flex w-full items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800">
    <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">G</span>Continue with Google
  </button>;
}
export function Field({label, ...props}: React.InputHTMLAttributes<HTMLInputElement> & {label:string}) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <input {...props} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-400"/>
  </label>;
}
export function AuthFooter({children}:{children:React.ReactNode}) {
  return <p className="mt-6 text-center text-sm text-slate-400">{children}</p>;
}
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
