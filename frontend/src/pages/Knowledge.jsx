import { useState } from 'react';
import { Trash2, Upload, Search, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { Async, Badge, Button, Card, DemoTag, EmptyState, Field, PageHeader, Toast, inputCls, cx } from '../components/ui';
import { fmtDateTime } from '../lib/format';
import { useAuth } from '../context/AuthContext';

function AddDocument({ onAdded, notify }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(txt|md)$/i.test(f.name)) {
      notify('Only .txt and .md files are supported in the MVP', 'error');
      return;
    }
    setContent(await f.text());
    if (!title) setTitle(f.name.replace(/\.(txt|md)$/i, ''));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await api('/knowledge', { method: 'POST', body: { title, content, sourceType: 'markdown' } });
      notify(
        `Ingested “${d.title}”: ${d.chunkCount} chunks${
          d.flaggedChunks ? `, ${d.flaggedChunks} flagged as possible prompt injection and excluded` : ''
        }`,
      );
      setTitle('');
      setContent('');
      onAdded();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Ingest new document"
      subtitle="Markdown headings (#, ##) become citation sections. Text is chunked (~110 words) and indexed for BM25."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-5 text-center transition-colors hover:border-brand hover:bg-surface-2/60">
          <Upload className="size-5 text-brand" />
          <span className="text-sm font-medium text-ink">Load a .txt or .md file from disk</span>
          <span className="text-xs text-ink-muted">Or paste structured Markdown below</span>
          <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={onFile} />
        </label>

        <Field label="Document title">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Horizon Towers — Floor Plans & Pricing"
            required
            minLength={3}
            maxLength={150}
          />
        </Field>

        <Field label="Markdown content">
          <textarea
            className={`${inputCls} h-40 font-mono text-[13px] leading-relaxed`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={20}
            placeholder={'# Project Overview\n## Pricing\nVerified facts only…'}
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Ingest &amp; index document
          </Button>
        </div>
      </form>
    </Card>
  );
}

function RetrievalTester() {
  const [q, setQ] = useState('What is the price of a 3BHK?');
  const [state, setState] = useState({ hits: null, loading: false, error: null });

  const run = async (e) => {
    e.preventDefault();
    setState({ hits: null, loading: true, error: null });
    try {
      setState({
        hits: await api('/knowledge/search', { method: 'POST', body: { query: q, k: 5 } }),
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({ hits: null, loading: false, error });
    }
  };

  return (
    <Card
      title="RAG retrieval testing console"
      subtitle="Runs the exact BM25 retriever used by VaaniQ. Hits below 0.20 relevance are ignored."
    >
      <form onSubmit={run} className="flex gap-2.5">
        <input
          className={inputCls}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          minLength={2}
          required
          aria-label="Test retrieval query"
        />
        <Button type="submit" loading={state.loading}>
          <Search className="size-4" />
          Search
        </Button>
      </form>

      {state.error && <p className="mt-3 text-[13px] text-danger">{state.error.message}</p>}

      {state.hits &&
        (state.hits.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No matching chunks found in the index.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {state.hits.map((h) => (
              <li key={h.chunkId} className="rounded-lg border border-line bg-canvas p-3.5">
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="font-semibold text-ink">{h.title}</span>
                  <span className="text-ink-muted">› {h.section}</span>
                  <Badge tone={h.relevance >= 0.2 ? 'green' : 'slate'} className="ml-auto font-mono">
                    rel {h.relevance.toFixed(2)} · BM25 {h.score}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-2">{h.content}</p>
              </li>
            ))}
          </ol>
        ))}
    </Card>
  );
}

export default function Knowledge() {
  const docs = useApi('/knowledge');
  const { user } = useAuth();
  const [viewing, setViewing] = useState(null);
  const { toast, notify, clear } = useToast();

  const view = async (id) => {
    try {
      setViewing(await api(`/knowledge/${id}`));
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete “${d.title}” and its ${d.chunk_count} chunks? The agent will no longer use it.`))
      return;
    try {
      await api(`/knowledge/${d.id}`, { method: 'DELETE' });
      notify('Document deleted');
      if (viewing?.id === d.id) setViewing(null);
      docs.reload();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Verified Grounding Store"
        title="Knowledge Base"
        description="Verified company facts indexed for retrieval-augmented generation. Retrieved text is strictly isolated as data and checked for prompt injection."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-7">
          <Card
            title="Document library"
            subtitle="Click any document to inspect indexed chunks and section metadata"
            padded={false}
          >
            <Async state={docs}>
              {(list) =>
                !list.length ? (
                  <div className="p-6">
                    <EmptyState title="No documents indexed" />
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {list.map((d) => {
                      const active = viewing?.id === d.id;
                      return (
                        <li
                          key={d.id}
                          className={cx(
                            'flex items-center gap-3.5 px-6 py-4 transition-colors hover:bg-canvas',
                            active && 'bg-brand-soft/35',
                          )}
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-brand">
                            <FileText className="size-4.5" />
                          </div>
                          <button type="button" onClick={() => view(d.id)} className="min-w-0 flex-1 cursor-pointer text-left">
                            <div className="flex items-center gap-2 truncate text-[15px] font-medium text-ink">
                              <span className="truncate">{d.title}</span>
                              {d.is_demo && <DemoTag />}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-muted">
                              <span>{d.chunk_count} chunks</span>
                              <span>·</span>
                              <span>{fmtDateTime(d.created_at)}</span>
                            </div>
                          </button>
                          <Badge tone="green">
                            <CheckCircle2 className="size-3.5" />
                            Indexed
                          </Badge>
                          {d.flagged_chunks > 0 && (
                            <Badge
                              tone="red"
                              title="Chunks that look like prompt-injection attempts are excluded from retrieval"
                            >
                              <ShieldAlert className="size-3.5" />
                              {d.flagged_chunks} flagged
                            </Badge>
                          )}
                          {user?.role === 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(d)}
                              aria-label={`Delete ${d.title}`}
                            >
                              <Trash2 className="size-4 text-ink-2 hover:text-danger" />
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )
              }
            </Async>
          </Card>

          {viewing && (
            <Card
              title={viewing.title}
              subtitle={`${viewing.chunks.length} indexed chunks`}
              action={
                <Button size="sm" variant="secondary" onClick={() => setViewing(null)}>
                  Close preview
                </Button>
              }
            >
              <ol className="space-y-3">
                {viewing.chunks.map((c) => (
                  <li key={c.chunk_index} className="rounded-lg border border-line bg-canvas p-4 text-sm">
                    <div className="mb-1.5 flex items-center gap-2 font-mono text-xs text-ink-muted">
                      <span className="font-semibold text-brand">#{c.chunk_index}</span>
                      <span>› {c.section}</span>
                      {c.flagged && <Badge tone="red">flagged</Badge>}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-ink">{c.content}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6 xl:col-span-5">
          <RetrievalTester />
          <AddDocument onAdded={docs.reload} notify={notify} />
        </div>
      </div>

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
