'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bot,
  Check,
  Copy,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';

import {
  API_BASE_URL,
  getToken,
  apiFetch,
} from '@/lib/api';

type Source = {
  document_id: string;
  document_name: string;
  chunk_id: string;
  page?: number | null;
  section?: string | null;
  text: string;
};

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  createdAt?: string;
};

const DEFAULT_SUGGESTIONS = [
  'What is this document about?',
  'Summarize the main points.',
  'What are the important requirements?',
  'Explain this section in simple terms.',
];

function CitationText({ text }: { text: string }) {
  const parts = text.split(
    /(\[Page \d+\]|\[Source\]|\[[^\]]+\])/g
  );

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^\[Page (\d+)\]$/);

        if (match) {
          const pageNumber = Number(match[1]);

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('contextiq:page', {
                    detail: pageNumber,
                  })
                );
              }}
              className="mx-1 rounded bg-cyan-300/10 px-1 text-cyan-200 underline"
            >
              {part}
            </button>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function DocumentChat({
  documentId,
  conversationId,
  onConversation,
}: {
  documentId: string;
  conversationId?: string;
  onConversation?: (id: string) => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(
    DEFAULT_SUGGESTIONS
  );

  const end = useRef<HTMLDivElement>(null);

  /*
   * Load existing conversation.
   *
   * IMPORTANT:
   * Never make useEffect itself async.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadConversation() {
      if (!conversationId) {
        setMsgs([]);
        return;
      }

      try {
        const data = await apiFetch<any>(
          `/api/conversations/${conversationId}`
        );

        if (!cancelled) {
          setMsgs(data.messages || []);
        }
      } catch {
        if (!cancelled) {
          setMsgs([]);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, documentId]);

  /*
   * Load AI suggestions for this document.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const data = await apiFetch<any>(
          `/api/documents/${documentId}/suggestions`
        );

        if (!cancelled) {
          setSuggestions(
            Array.isArray(data.suggestions) &&
              data.suggestions.length > 0
              ? data.suggestions
              : DEFAULT_SUGGESTIONS
          );
        }
      } catch {
        if (!cancelled) {
          setSuggestions(DEFAULT_SUGGESTIONS);
        }
      }
    }

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  /*
   * Scroll to the newest message.
   */
  useEffect(() => {
    const element = end.current;

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [msgs, loading]);

  async function ask(question = q) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading) {
      return;
    }

    setLastQuestion(cleanQuestion);
    setQ('');
    setErr('');
    setLoading(true);

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    setMsgs((current) => [
      ...current,
      {
        id: userMessageId,
        role: 'user',
        content: cleanQuestion,
        sources: [],
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        sources: [],
      },
    ]);

    let assistant = '';

    try {
      const token = getToken();

      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_id: documentId,
            question: cleanQuestion,
            conversation_id: conversationId || null,
          }),
        }
      );

      if (!response.ok) {
        let message = 'Chat request failed.';

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          const text = await response.text();
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error(
          'Streaming is unavailable from the server.'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split('\n\n');

        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n');

          const eventType =
            lines
              .find((line) => line.startsWith('event:'))
              ?.replace('event:', '')
              .trim() || '';

          const dataLine = lines.find((line) =>
            line.startsWith('data:')
          );

          if (!dataLine) {
            continue;
          }

          const rawData = dataLine
            .replace(/^data:\s*/, '')
            .trim();

          if (!rawData) {
            continue;
          }

          let data: any;

          try {
            data = JSON.parse(rawData);
          } catch {
            continue;
          }

          /*
           * Conversation created/found by backend.
           */
          if (eventType === 'meta') {
            if (data.conversationId) {
              onConversation?.(data.conversationId);
            }
          }

          /*
           * Streaming token.
           */
          else if (eventType === 'token') {
            assistant += data.token || '';

            setMsgs((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: assistant,
                    }
                  : message
              )
            );
          }

          /*
           * Final answer.
           */
          else if (eventType === 'done') {
            const finalAnswer =
              data.answer || assistant;

            assistant = finalAnswer;

            setMsgs((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: finalAnswer,
                      sources: Array.isArray(data.sources)
                        ? data.sources
                        : [],
                    }
                  : message
              )
            );

            if (data.conversationId) {
              onConversation?.(data.conversationId);
            }
          }

          /*
           * Backend error.
           */
          else if (eventType === 'error') {
            throw new Error(
              data.message || 'The AI could not answer.'
            );
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to answer the question.';

      setErr(message);

      /*
       * Remove the temporary user/assistant messages
       * if the request failed.
       */
      setMsgs((current) =>
        current.filter(
          (message) =>
            message.id !== userMessageId &&
            message.id !== assistantMessageId
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function newConversation() {
    setMsgs([]);
    setErr('');
    setQ('');
    setLastQuestion('');

    /*
     * Parent can clear the conversation ID.
     */
    onConversation?.('');
  }

  function clearConversation() {
    setMsgs([]);
    setErr('');
  }

  async function copyMessage(
    id: string,
    content: string
  ) {
    try {
      await navigator.clipboard.writeText(content);

      setCopied(id);

      window.setTimeout(() => {
        setCopied('');
      }, 1200);
    } catch {
      setErr('Unable to copy the answer.');
    }
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-sm font-semibold">
            Ask this document
          </p>

          <p className="text-[11px] text-slate-500">
            Answers are grounded in retrieved source chunks.
          </p>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            title="New conversation"
            onClick={newConversation}
            className="toolbar"
          >
            <MessageSquarePlus size={15} />
          </button>

          <button
            type="button"
            title="Clear conversation"
            onClick={clearConversation}
            className="toolbar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-5">

        {/* Empty state */}
        {msgs.length === 0 && !loading && (
          <div className="py-10">

            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <Bot size={22} />
            </div>

            <h3 className="mt-4 text-center font-medium">
              Start with a question
            </h3>

            <div className="mt-5 space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="w-full rounded-xl border border-white/10 p-3 text-left text-xs text-slate-300 hover:bg-white/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((message) => (
          <div
            key={message.id}
            className={`mb-5 ${
              message.role === 'user'
                ? 'text-right'
                : ''
            }`}
          >

            {/* Message bubble */}
            <div
              className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'bg-cyan-300 text-slate-950'
                  : 'bg-white/[.05] text-slate-200'
              }`}
            >
              {message.content ? (
                <CitationText text={message.content} />
              ) : (
                <Loader2
                  className="animate-spin"
                  size={16}
                />
              )}
            </div>

            {/* Sources */}
            {message.role === 'assistant' &&
              message.sources?.length > 0 && (
                <div className="mt-2 space-y-2 text-left">
                  {message.sources.map(
                    (source, index) => (
                      <button
                        key={source.chunk_id}
                        type="button"
                        onClick={() => {
                          if (source.page) {
                            window.dispatchEvent(
                              new CustomEvent(
                                'contextiq:page',
                                {
                                  detail: source.page,
                                }
                              )
                            );
                          } else if (source.section) {
                            window.dispatchEvent(
                              new CustomEvent(
                                'contextiq:section',
                                {
                                  detail:
                                    source.section,
                                }
                              )
                            );
                          }
                        }}
                        className="block w-full rounded-xl border border-white/10 bg-white/[.02] p-3 text-left hover:bg-white/5"
                      >
                        <p className="text-xs font-medium text-cyan-200">
                          Source {index + 1} ·{' '}
                          {source.page
                            ? `Page ${source.page}`
                            : source.section ||
                              'Document section'}
                        </p>

                        <p className="mt-1 line-clamp-3 text-[11px] leading-5 text-slate-500">
                          {source.text}
                        </p>
                      </button>
                    )
                  )}
                </div>
              )}

            {/* Copy */}
            {message.role === 'assistant' &&
              message.content && (
                <button
                  type="button"
                  onClick={() =>
                    copyMessage(
                      message.id,
                      message.content
                    )
                  }
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-300"
                >
                  {copied === message.id ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}

                  {copied === message.id
                    ? 'Copied'
                    : 'Copy'}
                </button>
              )}
          </div>
        ))}

        <div ref={end} />

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-red-300/10 bg-red-300/5 p-3 text-xs text-red-300">
            <span>{err}</span>

            {lastQuestion && (
              <button
                type="button"
                onClick={() => ask(lastQuestion)}
                disabled={loading}
                className="ml-2 inline-flex items-center gap-1 underline"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
        className="border-t border-white/10 p-4"
      >
        <textarea
          value={q}
          onChange={(event) =>
            setQ(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey
            ) {
              event.preventDefault();
              ask();
            }
          }}
          disabled={loading}
          rows={3}
          placeholder="Ask a question…"
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-300/40"
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">
            Enter to send · Shift + Enter for new line
          </span>

          <button
            type="submit"
            disabled={!q.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-40"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Send size={14} />
            )}

            {loading ? 'Generating…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}