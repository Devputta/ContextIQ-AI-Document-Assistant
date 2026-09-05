import Link from "next/link";
export default function AuthLayout({children}:{children:React.ReactNode}) {
  return <main className="min-h-screen bg-slate-950 text-white"><div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10"><div className="w-full max-w-md"><Link href="/" className="mb-8 block text-center text-xl font-semibold">ContextIQ</Link>{children}</div></div></main>;
}
