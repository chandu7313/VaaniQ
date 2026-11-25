import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Button, Card, DemoTag, EmptyState, PageHeader, Stat, SCORE_TONE, SENTIMENT_TONE } from '../components/ui';
import { BarList, SENTIMENT_COLOR } from '../components/charts';
import { humanize, fmtDateTime } from '../lib/format';

const INTENT_TONE = { high: 'green', medium: 'amber', low: 'slate' };
const OUTCOME_TONE = { confirmed: 'green', proposed_not_confirmed: 'amber', declined_by_customer: 'red', none: 'slate' };

function SummariesTable({ rows }) {
  if (!rows.length) return <EmptyState title="No call summaries yet" hint="End a call on the AI Voice Agent page to generate one." />;
  return (
    <div className="-m-5 overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-line text-xs text-slate-500"><tr>{['Customer', 'Requirement', 'Buying intent', 'Score', 'Sentiment', 'Appointment', 'Next action', 'When'].map((h) => <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map(({ id, conversation_id: cid, summary: s, full_name: name, is_demo: demo, created_at: at }) => (
          <tr key={id} className="border-b border-line/60 transition-colors hover:bg-panel-2">
            <td className="px-5 py-3"><Link to={`/conversations/${cid}`} className="flex items-center gap-2 font-medium text-slate-100 hover:text-indigo-200">{name || 'Unnamed caller'}{demo && <DemoTag />}</Link></td>
            <td className="px-5 py-3 text-slate-300">{[s.requirements?.configuration, s.requirements?.location, s.budget?.stated].filter(Boolean).join(' · ') || '—'}</td>
            <td className="px-5 py-3">{s.buyingIntent ? <Badge tone={INTENT_TONE[s.buyingIntent.level]} title={s.buyingIntent.evidence.join(' · ')}>{s.buyingIntent.level}</Badge> : '—'}</td>
            <td className="px-5 py-3">{s.leadScore ? <Badge tone={SCORE_TONE[s.leadScore.classification]}>{s.leadScore.total}</Badge> : '—'}</td>
            <td className="px-5 py-3"><Badge tone={SENTIMENT_TONE[s.sentiment?.overall]}>{s.sentiment?.overall} · {s.sentiment?.trend}</Badge></td>
            <td className="px-5 py-3">{s.appointmentOutcome ? <Badge tone={OUTCOME_TONE[s.appointmentOutcome] || 'slate'}>{humanize(s.appointmentOutcome)}</Badge> : <Badge>{s.outcome}</Badge>}</td>
            <td className="max-w-64 px-5 py-3 text-xs text-slate-400">{s.recommendedNextActions?.[0] || '—'}</td>
            <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{fmtDateTime(at)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export default function CallIntelligence() {
  const state = useApi('/analytics/overview');
  const summaries = useApi('/call-summaries');
  const reload = () => { state.reload(); summaries.reload(); };
  return (
    <div>
      <PageHeader title="Call Intelligence" description="What customers want, how they feel and what happened, aggregated live from summaries, messages, appointments and the tool audit log." actions={<Button variant="secondary" onClick={reload}>Refresh</Button>} />
      <Async state={state}>
        {(o) => {
          const sentimentTotal = o.sentiment.reduce((n, r) => n + r.count, 0);
          const positive = o.sentiment.find((r) => r.sentiment === 'positive')?.count || 0;
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Calls summarised" value={summaries.data?.length ?? '…'} />
                <Stat label="Positive customer messages" value={sentimentTotal ? `${Math.round((100 * positive) / sentimentTotal)}%` : '—'} hint={`of ${sentimentTotal} classified (transcript text)`} />
                <Stat label="Escalations to humans" value={o.kpi.escalations} />
                <Stat label="Avg. agent turn" value={`${o.latency.avg_ms} ms`} hint={`p95 ${o.latency.p95_ms} ms on this server (not a load test)`} />
              </div>
              <Card title="Call summaries" subtitle="Generated from stored facts when a call ends">
                <Async state={summaries}>{(rows) => <SummariesTable rows={rows} />}</Async>
              </Card>
              <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Customer sentiment" subtitle="Per message, from transcript text">
                  {!sentimentTotal ? <EmptyState title="No customer messages yet" /> : (
                    <BarList rows={['positive', 'neutral', 'negative'].map((s) => ({ key: s, label: humanize(s), value: o.sentiment.find((r) => r.sentiment === s)?.count || 0 }))} colorFor={(r) => SENTIMENT_COLOR[r.key]} />
                  )}
                </Card>
                <Card title="What customers asked for" subtitle="Primary intent per turn">
                  {!o.intents.length ? <EmptyState title="No agent turns yet" /> : <BarList rows={o.intents.map((r) => ({ label: humanize(r.intent), value: r.count }))} />}
                </Card>
                <Card title="Turn outcomes">
                  {!o.outcomes.length ? <EmptyState title="No agent turns yet" /> : <BarList rows={o.outcomes.map((r) => ({ label: humanize(r.outcome), value: r.count }))} />}
                </Card>
              </div>
              <Card title="Tool execution reliability" subtitle="From tool_audit_log: every agent and staff action">
                {!o.tools.length ? <EmptyState title="No tool executions yet" /> : (
                  <div className="-m-5 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="border-b border-line text-xs text-slate-500"><tr>{['Tool', 'Calls', 'Succeeded', 'Rejected by validation/consent', 'Failed (business or error)', 'Success rate'].map((h, i) => <th key={h} className={`px-5 py-3 font-medium ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
                      <tbody>{o.tools.map((t) => (
                        <tr key={t.tool} className="border-b border-line/60"><td className="px-5 py-2.5"><code className="text-slate-200">{t.tool}</code></td>
                          <td className="px-5 text-right tabular-nums">{t.calls}</td><td className="px-5 text-right tabular-nums">{t.succeeded}</td>
                          <td className="px-5 text-right tabular-nums">{t.rejected}</td><td className="px-5 text-right tabular-nums">{t.failed}</td>
                          <td className="px-5 text-right tabular-nums">{Math.round((100 * t.succeeded) / t.calls)}%</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </Card>
              <p className="text-xs text-slate-500">Generated {fmtDateTime(o.generatedAt)}. Rejections include intentional safety refusals, such as a booking attempted without the customer's confirmation.</p>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
