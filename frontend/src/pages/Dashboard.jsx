import { Link } from 'react-router-dom';
import { Users, BadgeCheck, CalendarCheck, Percent, MessagesSquare, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Card, DemoTag, EmptyState, PageHeader, Stat, STATUS_TONE, Button } from '../components/ui';
import { DailyActivityChart, BarList, SENTIMENT_COLOR } from '../components/charts';
import { fmtDateTime, fmtSlot, LANG_LABEL, STATUS_LABEL, humanize } from '../lib/format';

const PIPELINE = ['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost'];

export default function Dashboard() {
  const overview = useApi('/analytics/overview');
  const convs = useApi('/conversations');
  return (
    <div>
      <PageHeader title="Executive Dashboard" description="Every figure is computed from PostgreSQL when the page loads. Seeded records are fictional and tagged DEMO."
        actions={<Button variant="secondary" onClick={() => { overview.reload(); convs.reload(); }}>Refresh</Button>} />
      <Async state={overview}>
        {(o) => {
          const sentimentTotal = o.sentiment.reduce((n, r) => n + r.count, 0);
          return (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Stat label="Total leads" value={o.kpi.leads} icon={Users} />
                <Stat label="Qualified leads" value={o.kpi.qualified_leads} hint="score ≥ warm threshold" icon={BadgeCheck} />
                <Stat label="Booked appointments" value={o.kpi.booked_appointments} hint="confirmed or completed" icon={CalendarCheck} />
                <Stat label="Lead conversion" value={`${o.kpi.visit_conversion}%`} hint="leads with a booked visit" icon={Percent} />
                <Stat label="Conversations" value={o.kpi.conversations} icon={MessagesSquare} />
                <Stat label="Escalations" value={o.kpi.escalations} hint="handed to a human" icon={ShieldAlert} />
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <Card title="Sales pipeline" subtitle="Leads by stage. Click a stage to open it" className="lg:col-span-1">
                  <ul className="space-y-2.5">
                    {PIPELINE.map((s) => {
                      const count = o.leadsByStatus.find((r) => r.status === s)?.count || 0;
                      const max = Math.max(1, ...o.leadsByStatus.map((r) => r.count));
                      return (
                        <li key={s}>
                          <Link to={`/leads?status=${s}`} className="group block" title={`${STATUS_LABEL[s]}: ${count}`}>
                            <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300 group-hover:text-indigo-200">{STATUS_LABEL[s]}</span><span className="tabular-nums text-slate-400">{count}</span></div>
                            <div className="h-2 rounded-full bg-slate-800/70"><div className="h-2 rounded-r-[4px] rounded-l-full bg-[#3987e5] transition-opacity group-hover:opacity-80" style={{ width: `${(count / max) * 100}%` }} /></div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
                <Card title="Activity, last 14 days" className="lg:col-span-2"><DailyActivityChart data={o.daily} /></Card>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <Card title="Customer sentiment" subtitle={`${sentimentTotal} customer messages · transcript text`}>
                  {!sentimentTotal ? <EmptyState title="No customer messages yet" /> : (
                    <BarList rows={['positive', 'neutral', 'negative'].map((s) => ({ key: s, label: humanize(s), value: o.sentiment.find((r) => r.sentiment === s)?.count || 0 }))} colorFor={(r) => SENTIMENT_COLOR[r.key]}
                      format={(v) => `${v} (${Math.round((100 * v) / sentimentTotal)}%)`} />
                  )}
                </Card>
                <Card title="Upcoming site visits" action={<Link className="text-xs text-indigo-300 hover:text-indigo-200" to="/appointments">Manage</Link>}>
                  {!o.upcoming.length ? <EmptyState title="No upcoming visits" hint="Visits booked by the agent appear here." /> : (
                    <ul className="divide-y divide-line">{o.upcoming.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm"><span className="flex min-w-0 items-center gap-2 truncate text-slate-200">{a.full_name || 'Unnamed'} {a.is_demo && <DemoTag />}</span><span className="shrink-0 text-xs text-slate-400">{fmtSlot(a.starts_at)}</span></li>
                    ))}</ul>
                  )}
                </Card>
                <Card title="Recent customer interactions" action={<Link className="text-xs text-indigo-300 hover:text-indigo-200" to="/conversations">View all</Link>}>
                  <Async state={convs}>
                    {(list) => (!list.length ? <EmptyState title="No conversations yet" hint="Start one from the AI Voice Agent page." /> : (
                      <ul className="divide-y divide-line">{list.slice(0, 6).map((c) => (
                        <li key={c.id}><Link to={`/conversations/${c.id}`} className="flex items-center gap-2 py-2.5 text-sm hover:text-indigo-200">
                          <span className="min-w-0 flex-1 truncate text-slate-300" title={c.first_message || ''}>{c.full_name || c.first_message || 'No customer message yet'}</span>
                          <Badge>{LANG_LABEL[c.language]}</Badge><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                          <span className="hidden text-xs text-slate-500 2xl:block">{fmtDateTime(c.started_at)}</span><ArrowUpRight className="size-3.5 shrink-0 text-slate-500" />
                        </Link></li>
                      ))}</ul>
                    ))}
                  </Async>
                </Card>
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}
