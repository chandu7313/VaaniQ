import { useState } from 'react';
import { Trash2, Upload, Search, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { Async, Badge, Button, Card, DemoTag, EmptyState, Field, PageHeader, Toast, inputCls } from '../components/ui';
import { fmtDateTime } from '../lib/format';

function AddDocument({ onAdded, notify }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(txt|md)$/i.test(f.name)) { notify('Only .txt and .md files are supported in the MVP', 'error'); return; }
    setContent(await f.text());
    if (!title) setTitle(f.name.replace(/\.(txt|md)$/i, ''));
  };
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await api('/knowledge', { method: 'POST', body: { title, content, sourceType: 'markdown' } });
      notify(`Ingested “${d.title}”: ${d.chunkCount} chunks${d.flaggedChunks ? `, ${d.flaggedChunks} flagged as possible prompt injection and excluded` : ''}`);
      setTitle(''); setContent(''); onAdded();
    } catch (err) { notify(err.message, 'error'); } finally { setSaving(false); }
  };
  return (
    <Card title="Add document" subtitle="Markdown headings (#, ##) become citation sections. Text is chunked (~110 words) and indexed for BM25.">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={150} /></Field>
        <Field label="Content"><textarea className={`${inputCls} h-40 font-mono text-xs`} value={content} onChange={(e) => setContent(e.target.value)} required minLength={20} placeholder={'# Title\n## Section\nFacts…'} /></Field>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"><Upload className="size-4" />Load .txt / .md<input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={onFile} /></label>
          <Button type="submit" loading={saving}>Ingest document</Button>
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
    try { setState({ hits: await api('/knowledge/search', { method: 'POST', body: { query: q, k: 5 } }), loading: false, error: null }); }
    catch (error) { setState({ hits: null, loading: false, error }); }
  };
  return (
    <Card title="Retrieval tester" subtitle="Runs the same BM25 retriever the agent uses. The agent ignores hits below 0.20 relevance.">
      <form onSubmit={run} className="flex gap-2"><input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} minLength={2} required /><Button type="submit" loading={state.loading}><Search className="size-4" />Search</Button></form>
      {state.error && <p className="mt-2 text-xs text-rose-300">{state.error.message}</p>}
      {state.hits && (state.hits.length === 0 ? <p className="mt-3 text-sm text-slate-500">No matching chunks.</p> : (
        <ol className="mt-3 space-y-2">{state.hits.map((h) => (
          <li key={h.chunkId} className="rounded-lg border border-line bg-panel-2 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-medium text-slate-200">{h.title}</span><span className="text-slate-500">› {h.section}</span><Badge tone={h.relevance >= 0.2 ? 'green' : 'slate'} className="ml-auto">relevance {h.relevance.toFixed(2)} · BM25 {h.score}</Badge></div>
            <p className="mt-1.5 line-clamp-3 text-xs text-slate-400">{h.content}</p>
          </li>
        ))}</ol>
      ))}
    </Card>
  );
}

export default function Knowledge() {
  const docs = useApi('/knowledge');
  const [viewing, setViewing] = useState(null);
  const { toast, notify, clear } = useToast();
  const view = async (id) => { try { setViewing(await api(`/knowledge/${id}`)); } catch (err) { notify(err.message, 'error'); } };
  const remove = async (d) => {
    if (!window.confirm(`Delete “${d.title}” and its ${d.chunk_count} chunks? The agent will no longer use it.`)) return;
    try { await api(`/knowledge/${d.id}`, { method: 'DELETE' }); notify('Document deleted'); if (viewing?.id === d.id) setViewing(null); docs.reload(); }
    catch (err) { notify(err.message, 'error'); }
  };
  return (
    <div>
      <PageHeader title="Knowledge Base" description="Verified company information the agent is allowed to answer from. Retrieved text is treated as data, never as instructions." />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <Card title="Documents">
            <Async state={docs}>
              {(list) => (!list.length ? <EmptyState title="No documents" /> : (
                <ul className="-my-2 divide-y divide-line">{list.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2.5">
                    <button type="button" onClick={() => view(d.id)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 truncate text-sm text-slate-200 hover:text-indigo-200">{d.title}{d.is_demo && <DemoTag />}</div>
                      <div className="text-xs text-slate-500">{d.chunk_count} chunks · {fmtDateTime(d.created_at)}</div>
                    </button>
                    {d.flagged_chunks > 0 && <Badge tone="red" title="Chunks that look like prompt-injection attempts are excluded from retrieval"><ShieldAlert className="size-3" />{d.flagged_chunks} flagged</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => remove(d)} aria-label={`Delete ${d.title}`}><Trash2 className="size-4" /></Button>
                  </li>
                ))}</ul>
              ))}
            </Async>
          </Card>
          {viewing && (
            <Card title={viewing.title} action={<Button size="sm" variant="ghost" onClick={() => setViewing(null)}>Close</Button>}>
              <ol className="space-y-2">{viewing.chunks.map((c) => (
                <li key={c.chunk_index} className="rounded-lg bg-surface p-3 text-xs"><div className="mb-1 flex gap-2 text-slate-500">#{c.chunk_index} · {c.section}{c.flagged && <Badge tone="red">flagged</Badge>}</div><p className="whitespace-pre-wrap text-slate-300">{c.content}</p></li>
              ))}</ol>
            </Card>
          )}
        </div>
        <div className="min-w-0 space-y-5"><RetrievalTester /><AddDocument onAdded={docs.reload} notify={notify} /></div>
      </div>
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
