import Link from "next/link";
import {
<<<<<<< HEAD
  ArrowRight,
  Brain,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

export default function Home() {
  const workflow = [
    {
      title: "Upload",
      icon: Upload,
      description: "PDF + Markdown",
    },
    {
      title: "Retrieve",
      icon: Search,
      description: "Semantic chunks",
    },
    {
      title: "Ask",
      icon: Brain,
      description: "Grounded LLM",
    },
    {
      title: "Cite",
      icon: CheckCircle2,
      description: "Source navigation",
    },
  ];

  const features = [
    {
      title: "RAG, not guessing",
      description:
        "Retrieval is constrained to your document and the prompt explicitly treats retrieved text as untrusted data.",
    },
    {
      title: "Private workspace",
      description:
        "API authorization scopes documents, vectors, conversations and messages to the authenticated user.",
    },
    {
      title: "Real engineering stack",
      description:
        "Python · FastAPI · LangChain · ChromaDB · embeddings · Next.js · TypeScript",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-950">
            <Sparkles size={18} />
          </span>

          Context<span className="text-cyan-300">IQ</span>
        </Link>

        <div className="flex gap-2">
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-200">
            <Zap size={13} />
            Grounded RAG document intelligence
          </p>

          <h1 className="mt-7 text-5xl font-semibold tracking-tight sm:text-7xl">
            Your Documents.
            <br />
            <span className="text-cyan-300">Your Context.</span>
            <br />
            Intelligent Answers.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            Upload PDFs or Markdown, retrieve the most relevant passages, ask
            questions and trace answers back to the source.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950"
            >
              Start with a document
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/auth/login"
              className="rounded-xl border border-white/10 px-6 py-3 font-medium"
            >
              Open workspace
            </Link>
          </div>
        </div>

        {/* Workflow */}
        <div className="mx-auto mt-20 max-w-5xl rounded-3xl border border-white/10 bg-white/[.03] p-5 text-left shadow-2xl">
          <div className="grid gap-3 md:grid-cols-4">
            {workflow.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <Icon
                    className="text-cyan-200"
                    size={20}
                  />

                  <p className="mt-5 font-semibold">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
=======
  ArrowRight, BookOpen, Brain, CheckCircle2, FileText, LockKeyhole,
  MessageSquareText, Search, Sparkles, Upload, Zap
} from "lucide-react";

const features = [
  ["Semantic Search", "Find meaning, not just exact keywords.", Search],
  ["RAG-powered Answers", "Ground answers in your uploaded content.", Brain],
  ["Source Citations", "Know exactly where every answer came from.", CheckCircle2],
  ["PDF & Markdown", "Work with technical manuals, textbooks and notes.", FileText],
  ["Document Chat", "Keep conversations tied to the right document.", MessageSquareText],
  ["Secure Management", "Keep documents and future user data isolated.", LockKeyhole],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950">
            <Sparkles size={20} />
          </span>
          <span className="text-lg">Context<span className="text-cyan-300">IQ</span></span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#technology" className="hover:text-white">Technology</a>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10">
          Open Dashboard
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-sm text-cyan-200">
            <Zap size={15} /> Context-aware document intelligence
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Chat With Your Documents. <span className="text-cyan-300">Understand Them Instantly.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Upload technical manuals, textbooks, research papers, and Markdown files.
            Ask questions and get AI-powered answers grounded in your documents.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#how" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/10">
              View Demo
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-500">Day 1 foundation • No document or AI data is processed yet</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-950"><FileText size={21}/></div>
                  <div><p className="font-medium">Technical Manual.pdf</p><p className="text-xs text-slate-500">50 pages • Ready for analysis</p></div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Indexed</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Question</p>
                <p className="mt-2 font-medium">What is the warranty policy?</p>
                <div className="my-5 h-px bg-white/10" />
                <p className="text-sm leading-6 text-slate-300">
                  The warranty covers manufacturing defects for the stated warranty period.
                </p>
                <button className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs text-cyan-200">Source · Page 12</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-cyan-300">BUILT FOR REAL DOCUMENTS</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">More than a chatbot.</h2>
            <p className="mt-4 text-slate-400">A foundation for semantic retrieval, grounded answers and verifiable sources.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, desc, Icon]) => {
              const I = Icon as React.ElementType;
              return <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-300"><I size={20}/></div>
                <h3 className="mt-5 font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{desc as string}</p>
              </div>;
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
            })}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Features */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-semibold">
            Built for traceable answers
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 p-6"
              >
                <ShieldCheck
                  className="text-cyan-200"
                  size={19}
                />

                <h3 className="mt-4 font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
=======
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-medium text-cyan-300">HOW IT WORKS</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Upload → Process → Ask → Cite</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ["01", "Upload", "Add a PDF or Markdown document."],
            ["02", "Process", "Future versions will chunk and index the content."],
            ["03", "Ask", "Ask questions using natural language."],
            ["04", "Get cited answers", "See the exact source behind the answer."],
          ].map(([n, t, d]) => <div key={n} className="rounded-2xl border border-white/10 p-6">
            <span className="text-sm text-cyan-300">{n}</span><h3 className="mt-6 font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{d}</p>
          </div>)}
        </div>
      </section>

      <section id="technology" className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap gap-3">
            {["Python", "FastAPI", "LangChain", "ChromaDB", "Vector Embeddings", "React / Next.js", "LLM"].map(x =>
              <span key={x} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{x}</span>
            )}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 ContextIQ — Context-Aware AI Document Assistant</span>
        <div className="flex gap-5"><a href="#" className="hover:text-white">GitHub</a><a href="#" className="hover:text-white">Documentation</a><a href="#" className="hover:text-white">About</a><a href="#" className="hover:text-white">Privacy</a></div>
      </footer>
>>>>>>> 96caef8b5731e0359bc665a7d85c03e5a003a67a
    </main>
  );
}