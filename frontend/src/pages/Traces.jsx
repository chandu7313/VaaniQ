import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Card, EmptyState, PageHeader, cx } from '../components/ui';
import TraceView from '../components/TraceView';
import { fmtDateTime, humanize } from '../lib/format';

const OUTCOME_TONE = { appointment_booked: 'green', escalated: 'red', confirmation_requested: 'amber', booking_conflict: 'red', booking_failed: 'red', info_not_found: 'amber' };

function TraceDetail({ id }) {
  const state = useApi(`/traces/${id}`);
  return (
    <Async state={state}>
      {(log) => (
        <Card title={`Turn ${log.turn_index} · ${humanize(log.outcome)}`} subtitle={`${fmtDateTime(log.created_at)} · ${log.provider} · ${log.latency_ms} ms`}
          action={<Link to={`/conversations/${log.conversation_id}`} className="text-xs text-indigo-300 hover:text-indigo-200">Open conversation</Link>}>
          <TraceView trace={log.trace} />
        </Card>
      )}
    </Async>
  );
}

export default function Traces() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const conversationId = params.get('conversationId');
  const list = useApi(`/traces?limit=100${conversationId ? `&conversationId=${conversationId}` : ''}`);
  const suffix = conversationId ? `?conversationId=${conversationId}` : '';
  return (
    <div>
      <PageHeader title="Agent Execution Trace" description="Auditable record of every agent turn: intent, entities, retrieval scores, action proposals, validation, tool results and outcome. No hidden model reasoning is stored or shown."
        actions={conversationId && <Link to="/traces" className="text-xs text-indigo-300 hover:text-indigo-200">Show all conversations</Link>} />
      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <Async state={list}>
            {(rows) => (!rows.length ? <EmptyState title="No agent turns logged yet" /> : (
              <ul className="scrollbar-thin -m-5 max-h-[calc(100vh-200px)] divide-y divide-line overflow-y-auto">{rows.map((r) => (
                <li key={r.id}><Link to={`/traces/${r.id}${suffix}`} className={cx('block px-4 py-3 hover:bg-panel-2', id === r.id && 'bg-indigo-500/10')}>
                  <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">Turn {r.turn_index}</span><Badge tone="indigo">{humanize(r.intent)}</Badge><Badge tone={OUTCOME_TONE[r.outcome] || 'slate'} className="ml-auto">{humanize(r.outcome)}</Badge></div>
                  <div className="mt-1 text-[11px] text-slate-500">{fmtDateTime(r.created_at)} · {r.step_count} tool calls · score {r.score} · {r.latency_ms} ms</div>
                </Link></li>
              ))}</ul>
            ))}
          </Async>
        </Card>
        <div className="min-w-0">{id ? <TraceDetail key={id} id={id} /> : <Card><EmptyState title="Select a turn" hint="Each entry is one customer message and everything the agent decided and executed in response." /></Card>}</div>
      </div>
    </div>
  );
}
