'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import PDFViewer from './pdf-viewer';
import MarkdownViewer from './markdown-viewer';
import DocumentChat from './document-chat';

type DocumentData = {
  id: string;
  name: string;
  type: 'PDF' | 'MARKDOWN' | string;
  status: string;
  errorMessage?: string | null;
};

export default function DocumentViewerClient({
  id,
}: {
  id: string;
}) {
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [error, setError] = useState('');
  const [conversation, setConversation] =
    useState<string | undefined>();
  const [mobile, setMobile] =
    useState<'document' | 'chat'>('chat');
  const [page, setPage] = useState(1);

  /*
   * Load document.
   *
   * Do NOT make useEffect async.
   * The async function lives inside the effect.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      try {
        setError('');
        setDoc(null);

        const data = await apiFetch<DocumentData>(
          `/api/documents/${id}`
        );

        if (!cancelled) {
          setDoc(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load document.'
          );
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-300/10 bg-red-300/5 p-6">
          <h2 className="font-semibold text-red-300">
            Unable to load document
          </h2>

          <p className="mt-2 text-sm text-red-200/70">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Loading state
   */
  if (!doc) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-white/10 bg-white/[.02] p-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-300" />

          <p className="mt-4 text-sm text-slate-500">
            Loading document…
          </p>
        </div>
      </div>
    );
  }

  /*
   * Processing / failed document
   */
  if (doc.status !== 'READY') {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-amber-300/10 bg-amber-300/5 p-8">
          <h2 className="font-semibold">
            Document {doc.status.toLowerCase()}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {doc.errorMessage ||
              'The document is not ready for chat yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-130px)] min-h-[650px]">

      {/* Mobile tabs */}
      <div className="flex h-11 border-b border-white/10 lg:hidden">
        <button
          type="button"
          onClick={() => setMobile('document')}
          className={`flex-1 text-xs ${
            mobile === 'document'
              ? 'bg-white/10'
              : ''
          }`}
        >
          Document
        </button>

        <button
          type="button"
          onClick={() => setMobile('chat')}
          className={`flex-1 text-xs ${
            mobile === 'chat'
              ? 'bg-white/10'
              : ''
          }`}
        >
          AI Chat
        </button>
      </div>

      {/* Main workspace */}
      <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_440px]">

        {/* Document panel */}
        <section
          className={`${
            mobile === 'document'
              ? 'block'
              : 'hidden'
          } min-w-0 border-r border-white/10 lg:block`}
        >
          {/* Document header */}
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm">
            <FileText
              size={16}
              className="text-cyan-200"
            />

            <span className="truncate">
              {doc.name}
            </span>

            <span className="ml-auto text-xs text-slate-500">
              {doc.type}

              {doc.type === 'PDF' &&
                ` · page ${page}`}
            </span>
          </div>

          {/* Viewer */}
          {doc.type === 'PDF' ? (
            <PDFViewer
              id={id}
              onPageChange={setPage}
            />
          ) : (
            <MarkdownViewer id={id} />
          )}
        </section>

        {/* Chat panel */}
        <aside
          className={`${
            mobile === 'chat'
              ? 'block'
              : 'hidden'
          } min-w-0 lg:block`}
        >
          <DocumentChat
            documentId={id}
            conversationId={conversation}
            onConversation={(conversationId) => {
              setConversation(
                conversationId || undefined
              );
            }}
          />
        </aside>

      </div>
    </div>
  );
}