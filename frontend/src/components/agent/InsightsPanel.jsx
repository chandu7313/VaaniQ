import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, UserCheck } from 'lucide-react';
import { Badge, Card, DemoTag, SENTIMENT_TONE, STATUS_TONE, cx } from '../ui';
import ScoreBreakdown from '../ScoreBreakdown';
import TraceView from '../TraceView';
import AppointmentStatus from './AppointmentStatus';
import { STATUS_LABEL, fmtRupees, humanize } from '../../lib/format';

const PROFILE_FIELDS = [
  ['bedrooms', 'Configuration', (v) => `${v}BHK`],
  ['location', 'Location'],
  ['budgetMax', 'Budget', fmtRupees],
  ['timelineMonths', 'Timeline', (v) => `${v} month${v === 1 ? '' : 's'}`],
  ['decisionMaker', 'Decision', humanize],
  ['purpose', 'Purpose', humanize],
  ['preferences', 'Preferences', (v) => v.join(', ')],
  ['visitIntent', 'Visit', humanize],
];

/** Live view of what the agent has learned and done: CRM record, score, sentiment trend, last decision trace. */
export default function InsightsPanel({ result, sentiments, conversationId }) {
  const [tab, setTab] = useState('crm');
  const lead = result?.lead;
  const stepCount = result?.trace?.steps?.length || 0;

  return (
    <div className="space-y-5">
      <div
        className="flex rounded-xl border border-line bg-surface-2 p-1"
        role="tablist"
        aria-label="Live call inspector"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'crm'}
          onClick={() => setTab('crm')}
          className={cx(
            'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
            tab === 'crm'
              ? 'bg-surface text-ink shadow-[var(--shadow-card)]'
              : 'text-ink-2 hover:text-ink',
          )}
        >
          <UserCheck className="size-4" />
          CRM &amp; Qualification
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'trace'}
          onClick={() => setTab('trace')}
          className={cx(
            'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
            tab === 'trace'
              ? 'bg-surface text-ink shadow-[var(--shadow-card)]'
              : 'text-ink-2 hover:text-ink',
          )}
        >
          <Activity className="size-4" />
          Decision Trace
          {result?.trace && (
            <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand-deep">
              {stepCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'crm' ? (
        <>
          <Card
            title="Customer profile (CRM)"
            action={
              lead && (
                <div className="flex gap-1.5">
                  {lead.is_demo && <DemoTag />}
                  <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
                </div>
              )
            }
          >
            {!lead ? (
              <p className="text-sm leading-relaxed text-ink-muted">
                Extracted requirements will appear here as the customer speaks. Nothing is filled in unless the customer states it.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="text-base font-semibold text-ink">{lead.full_name || 'Unnamed caller'}</div>
                  <Link
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
                    to={`/leads/${lead.id}`}
                  >
                    Open CRM <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
                  {PROFILE_FIELDS.map(([k, label, f]) => (
                    <div key={k}>
                      <dt className="text-xs text-ink-muted">{label}</dt>
                      <dd className={lead.profile?.[k] !== undefined ? 'mt-0.5 font-medium text-ink' : 'mt-0.5 text-ink-muted'}>
                        {lead.profile?.[k] !== undefined
                          ? f
                            ? f(lead.profile[k])
                            : lead.profile[k]
                          : 'Not stated'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Card>

          <AppointmentStatus result={result} />

          <Card
            title="Lead qualification score"
            subtitle="Budget 25 · Requirements 25 · Timeline 20 · Authority 15 · Appointment 15"
          >
            <ScoreBreakdown score={result?.score} />
          </Card>

          <Card
            title="Conversation sentiment"
            subtitle="Classified from transcript text, not acoustic voice tone"
          >
            {!sentiments.length ? (
              <p className="text-sm text-ink-muted">No customer messages yet.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {sentiments.map((s, i) => (
                  <Badge
                    key={i}
                    tone={SENTIMENT_TONE[s.label]}
                    title={s.evidence?.map((e) => e.phrase).join(', ') || 'no cues'}
                  >
                    <span className="font-mono">T{i + 1}</span> {s.label}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card
          title="Latest agent decision trace"
          action={
            conversationId && (
              <Link
                to={`/traces?conversationId=${conversationId}`}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
              >
                <Activity className="size-4" />
                All turns
              </Link>
            )
          }
        >
          {result?.trace ? (
            <TraceView trace={result.trace} />
          ) : (
            <p className="text-sm leading-relaxed text-ink-muted">
              After each turn you will see the detected intent, retrieved documents, action proposals, validated tool calls, and the business outcome.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
