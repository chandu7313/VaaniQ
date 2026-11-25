import { useApi } from '../hooks/useApi';
import { Async, Button, Card, EmptyState, PageHeader, Stat } from '../components/ui';
import { BarList, SENTIMENT_COLOR, DailyActivityChart } from '../components/charts';
import { STATUS_LABEL, humanize, fmtDateTime } from '../lib/format';

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost'];

export default function Analytics() {
  const state = useApi('/analytics/overview');
  return (
    <div>
      <PageHeader title="Analytics" description="Business and agent-quality metrics, aggregated live from leads, messages, appointments and execution logs." actions={<Button variant="secondary" onClick={state.reload}>Refresh</Button>} />
      <Async state={state}>
        {(o) => (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Agent turns logged" value={o.outcomes.reduce((s, r) => s + r.count, 0)} />
              <Stat label="Avg. turn latency" value={`${o.latency.avg_ms} ms`} hint={`p95 ${o.latency.p95_ms} ms (measured on this server, not a load test)`} />
              <Stat label="Lead → visit conversion" value={`${o.kpi.visit_conversion}%`} />
              <Stat label="Escalations to humans" value={o.kpi.escalations} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Lead pipeline by status">
                <BarList rows={STATUS_ORDER.map((s) => ({ label: STATUS_LABEL[s], value: o.leadsByStatus.find((r) => r.status === s)?.count || 0 }))} />
              </Card>
              <Card title="Customer message sentiment" subtitle="Each customer message is classified with confidence and evidence">
                {!o.sentiment.length ? <EmptyState title="No customer messages yet" /> : (
                  <BarList rows={['positive', 'neutral', 'negative'].map((s) => ({ key: s, label: humanize(s), value: o.sentiment.find((r) => r.sentiment === s)?.count || 0 }))} colorFor={(r) => SENTIMENT_COLOR[r.key]} />
                )}
              </Card>
              <Card title="Detected customer intents (primary)">
                {!o.intents.length ? <EmptyState title="No agent turns yet" /> : <BarList rows={o.intents.map((r) => ({ label: humanize(r.intent), value: r.count }))} />}
              </Card>
              <Card title="Turn outcomes">
                {!o.outcomes.length ? <EmptyState title="No agent turns yet" /> : <BarList rows={o.outcomes.map((r) => ({ label: humanize(r.outcome), value: r.count }))} />}
              </Card>
            </div>
            <Card title="Activity, last 14 days"><DailyActivityChart data={o.daily} /></Card>
            <Card title="Tool execution reliability" subtitle="Every business action goes through the validated tool registry">
              {!o.tools.length ? <EmptyState title="No tool executions yet" /> : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500"><tr><th className="pb-2 text-left font-medium">Tool</th><th className="pb-2 text-right font-medium">Calls</th><th className="pb-2 text-right font-medium">Succeeded</th><th className="pb-2 text-right font-medium">Rejected / failed</th><th className="pb-2 text-right font-medium">Success rate</th></tr></thead>
                  <tbody>{o.tools.map((t) => (
                    <tr key={t.tool} className="border-t border-line"><td className="py-2"><code className="text-slate-200">{t.tool}</code></td><td className="text-right tabular-nums">{t.calls}</td><td className="text-right tabular-nums">{t.succeeded}</td><td className="text-right tabular-nums">{t.calls - t.succeeded}</td><td className="text-right tabular-nums">{Math.round((100 * t.succeeded) / t.calls)}%</td></tr>
                  ))}</tbody>
                </table>
              )}
            </Card>
            <p className="text-xs text-slate-500">Generated {fmtDateTime(o.generatedAt)}. Rejected tool calls include intentional safety refusals (for example a booking slot taken by another customer).</p>
          </div>
        )}
      </Async>
    </div>
  );
}
