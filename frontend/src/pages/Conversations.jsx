import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Button, Card, DemoTag, EmptyState, ErrorState, PageHeader, STATUS_TONE, cx } from '../components/ui';
import ChatTranscript from '../components/agent/ChatTranscript';
import SummaryCard from '../components/SummaryCard';
import { fmtDateTime, LANG_LABEL } from '../lib/format';

function Detail({ id, onChanged }) {
  const state = useApi(`/conversations/${id}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const summarise = async () => {
    setBusy(true); setError(null);
    try { await api(`/conversations/${id}/end`, { method: 'POST' }); state.reload(); onChanged(); }
    catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Async state={state}>
      {(c) => (
        <div className="space-y-4">
          <Card title={c.lead?.full_name || 'Unnamed caller'} subtitle={`${LANG_LABEL[c.language]} · ${c.channel} · started ${fmtDateTime(c.started_at)}`}
            action={(
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                <Link to={`/traces?conversationId=${c.id}`} className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200"><Workflow className="size-3.5" />Decision traces</Link>
              </div>
            )}>
            {c.escalation_reason && <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">Escalated: {c.escalation_reason}</p>}
            <div className="-m-5 flex max-h-[520px] flex-col">
              <ChatTranscript messages={c.messages.map((m) => ({ ...m, sentiment: m.sentiment ? { label: m.sentiment, confidence: m.sentiment_confidence, evidence: m.sentiment_evidence } : null }))} />
            </div>
          </Card>
          <Card title="Call summary" action={<Button size="sm" variant="secondary" loading={busy} onClick={summarise}>{c.summary ? 'Regenerate' : c.status === 'active' ? 'End & summarise' : 'Generate summary'}</Button>}>
            {error && <ErrorState error={error} />}
            {c.summary ? <SummaryCard summary={c.summary.summary} /> : <p className="text-sm text-slate-500">No summary yet. Summaries are generated automatically when a call is ended.</p>}
          </Card>
        </div>
      )}
    </Async>
  );
}

export default function Conversations() {
  const { id } = useParams();
  const list = useApi('/conversations');
  return (
    <div>
      <PageHeader title="Conversation History" description="Every message is persisted with per-message sentiment, evidence and RAG source citations." />
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <Async state={list}>
            {(rows) => (!rows.length ? <EmptyState title="No conversations yet" /> : (
              <ul className="scrollbar-thin -m-5 max-h-[calc(100vh-200px)] divide-y divide-line overflow-y-auto">{rows.map((c) => (
                <li key={c.id}><Link to={`/conversations/${c.id}`} className={cx('block px-4 py-3 hover:bg-panel-2', id === c.id && 'bg-indigo-500/10')}>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">{c.full_name || 'Unnamed caller'}{c.is_demo && <DemoTag />}<Badge tone={STATUS_TONE[c.status]} className="ml-auto">{c.status}</Badge></div>
                  <div className="mt-0.5 truncate text-xs text-slate-400">{c.first_message || 'No customer message'}</div>
                  <div className="mt-1 flex gap-2 text-[11px] text-slate-500">{fmtDateTime(c.started_at)} · {c.message_count} msgs · {LANG_LABEL[c.language]}{c.score != null && ` · score ${c.score}`}{c.has_summary && ' · summary'}</div>
                </Link></li>
              ))}</ul>
            ))}
          </Async>
        </Card>
        <div>{id ? <Detail key={id} id={id} onChanged={list.reload} /> : <Card><EmptyState title="Select a conversation" hint="Pick one on the left to see the transcript, sentiment and summary." /></Card>}</div>
      </div>
    </div>
  );
}
