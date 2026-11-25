import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Card, EmptyState, PageHeader, cx } from '../components/ui';
import TraceView from '../components/TraceView';
import { fmtDateTime, humanize } from '../lib/format';

const OUTCOME_TONE = {
  appointment_booked: 'green',
  escalated: 'red',
  confirmation_requested: 'amber',
  booking_conflict: 'red',
  booking_failed: 'red',
  info_not_found: 'amber',
};

function TraceDetail({ id }) {
  const state = useApi(`/traces/${id}`);
  return (
    <Async state={state}>
      {(log) => (
        <Card
          title={`Turn ${log.turn_index} · ${humanize(log.outcome)}`}
          subtitle={`${fmtDateTime(log.created_at)} · ${log.provider} · ${log.latency_ms} ms`}
          action={
            <Link
              to={`/conversations/${log.conversation_id}`}
              className="text-[13px] font-medium text-brand hover:underline"
            >
              Open conversation →
            </Link>
          }
        >
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
      <PageHeader
        eyebrow="Workflow Observability"
        title="Agent Intelligence & Decision Trace"
        description="Auditable turn-by-turn execution timeline: intent classification, BM25 retrieval hits, structured action proposals, validation checks, and CRM mutations."
        actions={
          conversationId && (
            <Link to="/traces" className="text-[13px] font-medium text-brand hover:underline">
              Show all conversations →
            </Link>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <Card title="Turn execution log" padded={false} className="overflow-hidden">
          <Async state={list}>
            {(rows) =>
              !rows.length ? (
                <div className="p-6">
                  <EmptyState icon={Workflow} title="No agent turns logged yet" />
                </div>
              ) : (
                <ul className="scrollbar-thin max-h-[calc(100vh-240px)] divide-y divide-line overflow-y-auto">
                  {rows.map((r) => {
                    const active = id === r.id;
                    return (
                      <li key={r.id}>
                        <Link
                          to={`/traces/${r.id}${suffix}`}
                          className={cx(
                            'block border-l-2 px-5 py-4 transition-colors hover:bg-canvas',
                            active ? 'border-l-brand bg-brand-soft/30' : 'border-l-transparent',
                          )}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono font-semibold text-ink">Turn {r.turn_index}</span>
                            <Badge tone="brand">{humanize(r.intent)}</Badge>
                            <Badge tone={OUTCOME_TONE[r.outcome] || 'slate'} className="ml-auto">
                              {humanize(r.outcome)}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-xs text-ink-muted">
                            <span>{fmtDateTime(r.created_at)}</span>
                            <span>·</span>
                            <span>{r.step_count} tools</span>
                            <span>·</span>
                            <span>score {r.score}</span>
                            <span>·</span>
                            <span>{r.latency_ms} ms</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )
            }
          </Async>
        </Card>

        <div className="min-w-0">
          {id ? (
            <TraceDetail key={id} id={id} />
          ) : (
            <Card>
              <EmptyState
                icon={Workflow}
                title="Select an agent turn"
                hint="Inspect each customer turn to view retrieved sources, tool validation checks, JSON arguments, and business outcomes."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
