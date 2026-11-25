import { Link } from 'react-router-dom';
import { RefreshCw, BarChart3, Clock, ShieldAlert, SmilePlus, FileCheck } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import {
  Async,
  Badge,
  Button,
  Card,
  DemoTag,
  EmptyState,
  KpiStrip,
  PageHeader,
  SCORE_TONE,
  SENTIMENT_TONE,
} from '../components/ui';
import { BarList, SENTIMENT_COLOR, SERIES } from '../components/charts';
import { humanize, fmtDateTime } from '../lib/format';

const INTENT_TONE = { high: 'green', medium: 'amber', low: 'slate' };
const OUTCOME_TONE = {
  confirmed: 'green',
  proposed_not_confirmed: 'amber',
  declined_by_customer: 'red',
  none: 'slate',
};

function SummariesTable({ rows }) {
  if (!rows.length) {
    return (
      <EmptyState
        title="No call summaries yet"
        hint="End a call on the AI Voice Agent page to generate one."
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] text-sm">
        <thead className="border-b border-line bg-surface-2/70 text-xs uppercase tracking-wider text-ink-2">
          <tr>
            {[
              'Customer',
              'Requirement',
              'Buying intent',
              'Score',
              'Sentiment',
              'Appointment',
              'Next action',
              'When',
            ].map((h) => (
              <th key={h} className="px-6 py-3.5 text-left font-mono font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(
            ({ id, conversation_id: cid, summary: s, full_name: name, is_demo: demo, created_at: at }) => (
              <tr key={id} className="transition-colors hover:bg-canvas">
                <td className="px-6 py-4">
                  <Link
                    to={`/conversations/${cid}`}
                    className="flex items-center gap-2 font-medium text-ink hover:text-brand"
                  >
                    <span>{name || 'Unnamed caller'}</span>
                    {demo && <DemoTag />}
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink-2">
                  {[s.requirements?.configuration, s.requirements?.location, s.budget?.stated]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
                <td className="px-6 py-4">
                  {s.buyingIntent ? (
                    <Badge
                      tone={INTENT_TONE[s.buyingIntent.level]}
                      title={s.buyingIntent.evidence.join(' · ')}
                    >
                      {s.buyingIntent.level}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-6 py-4">
                  {s.leadScore ? (
                    <Badge tone={SCORE_TONE[s.leadScore.classification]} className="font-mono">
                      {s.leadScore.total}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={SENTIMENT_TONE[s.sentiment?.overall]}>
                    {s.sentiment?.overall} · {s.sentiment?.trend}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {s.appointmentOutcome ? (
                    <Badge tone={OUTCOME_TONE[s.appointmentOutcome] || 'slate'}>
                      {humanize(s.appointmentOutcome)}
                    </Badge>
                  ) : (
                    <Badge>{s.outcome}</Badge>
                  )}
                </td>
                <td className="max-w-72 px-6 py-4 text-[13px] text-ink-2">
                  {s.recommendedNextActions?.[0] || '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-ink-muted">
                  {fmtDateTime(at)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function CallIntelligence() {
  const state = useApi('/analytics/overview');
  const summaries = useApi('/call-summaries');
  const reload = () => {
    state.reload();
    summaries.reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Conversational Business Intelligence"
        title="Analytics & Call Intelligence"
        description="Aggregated live from call summaries, transcript sentiment classifications, appointments, and the validated tool audit log."
        actions={
          <Button variant="secondary" onClick={reload}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      <Async state={state}>
        {(o) => {
          const sentimentTotal = o.sentiment.reduce((n, r) => n + r.count, 0);
          const positive = o.sentiment.find((r) => r.sentiment === 'positive')?.count || 0;

          return (
            <div className="space-y-6">
              <KpiStrip
                items={[
                  {
                    label: 'Calls summarised',
                    value: summaries.data?.length ?? '…',
                    icon: FileCheck,
                  },
                  {
                    label: 'Positive sentiment',
                    value: sentimentTotal ? `${Math.round((100 * positive) / sentimentTotal)}%` : '—',
                    hint: `of ${sentimentTotal} classified turns`,
                    icon: SmilePlus,
                    accent: 'text-success',
                  },
                  {
                    label: 'Human escalations',
                    value: o.kpi.escalations,
                    hint: 'handed off to sales team',
                    icon: ShieldAlert,
                  },
                  {
                    label: 'Avg. agent turn',
                    value: `${o.latency.avg_ms} ms`,
                    hint: `p95 ${o.latency.p95_ms} ms`,
                    icon: Clock,
                  },
                  {
                    label: 'Booked visits',
                    value: o.kpi.booked_appointments,
                    hint: `${o.kpi.visit_conversion}% lead conversion`,
                    icon: BarChart3,
                    dark: true,
                  },
                  {
                    label: 'Total conversations',
                    value: o.kpi.conversations,
                    hint: `${o.kpi.leads} unique leads`,
                  },
                ]}
              />

              <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Customer sentiment" subtitle="Per customer turn from transcript text">
                  {!sentimentTotal ? (
                    <EmptyState title="No customer messages yet" />
                  ) : (
                    <BarList
                      rows={['positive', 'neutral', 'negative'].map((s) => ({
                        key: s,
                        label: humanize(s),
                        value: o.sentiment.find((r) => r.sentiment === s)?.count || 0,
                      }))}
                      colorFor={(r) => SENTIMENT_COLOR[r.key]}
                      format={(v) => `${v} (${Math.round((100 * v) / sentimentTotal)}%)`}
                    />
                  )}
                </Card>

                <Card title="Customer demand intents" subtitle="Primary detected intent per turn">
                  {!o.intents.length ? (
                    <EmptyState title="No agent turns yet" />
                  ) : (
                    <BarList
                      rows={o.intents.map((r) => ({ label: humanize(r.intent), value: r.count }))}
                      color={SERIES.green}
                    />
                  )}
                </Card>

                <Card title="Agent turn outcomes" subtitle="Resolution distribution across sessions">
                  {!o.outcomes.length ? (
                    <EmptyState title="No agent turns yet" />
                  ) : (
                    <BarList
                      rows={o.outcomes.map((r) => ({ label: humanize(r.outcome), value: r.count }))}
                      color={SERIES.terra}
                    />
                  )}
                </Card>
              </div>

              <Card
                title="Call summaries matrix"
                subtitle="Structured post-call insights generated from stored facts"
                padded={false}
              >
                <Async state={summaries}>{(rows) => <SummariesTable rows={rows} />}</Async>
              </Card>

              <Card
                title="Tool execution reliability"
                subtitle="From tool_audit_log: every agent and staff action"
                padded={false}
              >
                {!o.tools.length ? (
                  <div className="p-6">
                    <EmptyState title="No tool executions yet" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead className="border-b border-line bg-surface-2/70 text-xs uppercase tracking-wider text-ink-2">
                        <tr>
                          {[
                            'Tool',
                            'Calls',
                            'Succeeded',
                            'Rejected (validation/consent)',
                            'Failed',
                            'Success rate',
                          ].map((h, i) => (
                            <th
                              key={h}
                              className={`px-6 py-3.5 font-mono font-medium ${i ? 'text-right' : 'text-left'}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {o.tools.map((t) => {
                          const rate = Math.round((100 * t.succeeded) / t.calls);
                          return (
                            <tr key={t.tool} className="hover:bg-canvas">
                              <td className="px-6 py-3.5">
                                <code className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[13px] font-medium text-ink">
                                  {t.tool}
                                </code>
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono tabular-nums text-ink">
                                {t.calls}
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono tabular-nums text-success">
                                {t.succeeded}
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono tabular-nums text-warning">
                                {t.rejected}
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono tabular-nums text-danger">
                                {t.failed}
                              </td>
                              <td className="px-6 py-3.5 text-right font-mono font-semibold tabular-nums text-ink">
                                {rate}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <p className="font-mono text-xs text-ink-muted">
                Generated {fmtDateTime(o.generatedAt)}. Rejections include intentional safety refusals, such as a booking attempted without explicit customer confirmation.
              </p>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
