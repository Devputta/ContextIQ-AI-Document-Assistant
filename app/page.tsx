import Link from "next/link";
import {
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
            })}
          </div>
        </div>
      </section>

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
    </main>
  );
}