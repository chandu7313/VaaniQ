import { Link } from 'react-router-dom';
import { Users, Flame, Gauge, MessagesSquare, CalendarCheck, Percent, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Card, DemoTag, EmptyState, PageHeader, Stat, STATUS_TONE, Button } from '../components/ui';
import { DailyActivityChart, BarList } from '../components/charts';
import { fmtDateTime, fmtSlot, LANG_LABEL } from '../lib/format';

export default function Dashboard() {
  const overview = useApi('/analytics/overview');
  const convs = useApi('/conversations');
  return (
    <div>
      <PageHeader title="Dashboard" description="Live figures computed from PostgreSQL on every load. Seeded records are fictional and tagged DEMO."
        actions={<Button variant="secondary" onClick={() => { overview.reload(); convs.reload(); }}>Refresh</Button>} />
      <Async state={overview}>
        {(o) => (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              <Stat label="Leads" value={o.kpi.leads} icon={Users} />
              <Stat label="Hot leads (75+)" value={o.kpi.hot_leads} icon={Flame} />
              <Stat label="Avg. lead score" value={o.kpi.avg_score} icon={Gauge} />
              <Stat label="Conversations" value={o.kpi.conversations} icon={MessagesSquare} />
              <Stat label="Confirmed visits" value={o.kpi.confirmed_visits} icon={CalendarCheck} />
              <Stat label="Lead → visit" value={`${o.kpi.visit_conversion}%`} hint="leads with a booked visit" icon={Percent} />
              <Stat label="Escalations" value={o.kpi.escalations} icon={ShieldAlert} />
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Card title="Activity, last 14 days" className="lg:col-span-2"><DailyActivityChart data={o.daily} /></Card>
              <Card title="Lead quality">
                {o.scoreBuckets.length ? <BarList rows={['Hot (75+)', 'Warm (50-74)', 'Cold (<50)'].map((b) => ({ label: b, value: o.scoreBuckets.find((x) => x.bucket === b)?.count || 0 }))} /> : <EmptyState title="No leads yet" />}
              </Card>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Card title="Upcoming site visits" action={<Link className="text-xs text-indigo-300 hover:text-indigo-200" to="/appointments">Manage</Link>}>
                {!o.upcoming.length ? <EmptyState title="No upcoming visits" hint="Visits booked by the agent appear here." /> : (
                  <ul className="divide-y divide-line">{o.upcoming.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2.5 text-sm"><span className="flex items-center gap-2 text-slate-200">{a.full_name || 'Unnamed'} {a.is_demo && <DemoTag />}</span><span className="text-xs text-slate-400">{fmtSlot(a.starts_at)}</span></li>
                  ))}</ul>
                )}
              </Card>
              <Card title="Recent conversations" action={<Link className="text-xs text-indigo-300 hover:text-indigo-200" to="/conversations">View all</Link>}>
                <Async state={convs}>
                  {(list) => (!list.length ? <EmptyState title="No conversations yet" hint="Start one from the AI Voice Agent page." /> : (
                    <ul className="divide-y divide-line">{list.slice(0, 6).map((c) => (
                      <li key={c.id}><Link to={`/conversations/${c.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:text-indigo-200">
                        <span className="min-w-0 flex-1 truncate text-slate-300">{c.first_message || 'No customer message yet'}</span>
                        <Badge>{LANG_LABEL[c.language]}</Badge><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                        <span className="hidden text-xs text-slate-500 sm:block">{fmtDateTime(c.started_at)}</span><ArrowUpRight className="size-3.5 text-slate-500" />
                      </Link></li>
                    ))}</ul>
                  ))}
                </Async>
              </Card>
            </div>
          </>
        )}
      </Async>
    </div>
  );
}
