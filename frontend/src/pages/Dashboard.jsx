import { Link } from 'react-router-dom';
import {
  Users,
  BadgeCheck,
  CalendarCheck,
  Percent,
  MessagesSquare,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Mic,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import {
  Async,
  Badge,
  Card,
  DemoTag,
  EmptyState,
  KpiStrip,
  PageHeader,
  STATUS_TONE,
  SCORE_TONE,
  Button,
} from '../components/ui';
import { DailyActivityChart, BarList, SENTIMENT_COLOR } from '../components/charts';
import { fmtDateTime, fmtSlot, fmtRupees, LANG_LABEL, STATUS_LABEL, humanize, scoreClass } from '../lib/format';

const PIPELINE = [
  ['new', '#899188'],
  ['contacted', '#2E5D88'],
  ['qualified', '#244D3C'],
  ['visit_scheduled', '#2C6E49'],
  ['nurture', '#C77B5B'],
  ['lost', '#A93B3B'],
];

export default function Dashboard() {
  const overview = useApi('/analytics/overview');
  const convs = useApi('/conversations');
  const leads = useApi('/leads');

  const reloadAll = () => {
    overview.reload();
    convs.reload();
    leads.reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations Overview"
        title="Executive Dashboard"
        description="Live operational metrics computed directly from PostgreSQL on page load. Seeded company and customer records are tagged DEMO."
        actions={
          <>
            <Button variant="secondary" onClick={reloadAll}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Link to="/agent">
              <Button>
                <Mic className="size-4" />
                Open Voice Agent
              </Button>
            </Link>
          </>
        }
      />

      <Async state={overview}>
        {(o) => {
          const sentimentTotal = o.sentiment.reduce((n, r) => n + r.count, 0);
          const maxPipeline = Math.max(1, ...o.leadsByStatus.map((r) => r.count));

          return (
            <div className="space-y-6">
              <KpiStrip
                items={[
                  { label: 'Total leads', value: o.kpi.leads, icon: Users },
                  {
                    label: 'Qualified leads',
                    value: o.kpi.qualified_leads,
                    hint: 'score ≥ warm threshold',
                    icon: BadgeCheck,
                    accent: 'text-brand',
                  },
                  {
                    label: 'Booked visits',
                    value: o.kpi.booked_appointments,
                    hint: 'confirmed or completed',
                    icon: CalendarCheck,
                  },
                  {
                    label: 'Visit conversion',
                    value: `${o.kpi.visit_conversion}%`,
                    hint: 'leads with a booked visit',
                    icon: Percent,
                    dark: true,
                  },
                  { label: 'Conversations', value: o.kpi.conversations, icon: MessagesSquare },
                  {
                    label: 'Human escalations',
                    value: o.kpi.escalations,
                    hint: 'handed to sales rep',
                    icon: ShieldAlert,
                    accent: o.kpi.escalations > 0 ? 'text-warning' : undefined,
                  },
                ]}
              />

              <div className="grid gap-6 lg:grid-cols-12">
                <Card
                  title="Conversation & booking velocity"
                  subtitle="Daily volume over the last 14 days"
                  className="lg:col-span-8"
                >
                  <DailyActivityChart data={o.daily} />
                </Card>

                <Card
                  title="Sales pipeline"
                  subtitle="Click any stage to filter CRM"
                  className="lg:col-span-4"
                  action={
                    <Link to="/leads" className="text-[13px] font-medium text-brand hover:underline">
                      All leads
                    </Link>
                  }
                >
                  <ul className="space-y-3.5">
                    {PIPELINE.map(([s, color]) => {
                      const count = o.leadsByStatus.find((r) => r.status === s)?.count || 0;
                      return (
                        <li key={s}>
                          <Link
                            to={`/leads?status=${s}`}
                            className="group block rounded-lg px-1.5 py-1 transition-colors hover:bg-canvas"
                            title={`${STATUS_LABEL[s]}: ${count}`}
                          >
                            <div className="mb-1.5 flex items-baseline justify-between text-sm">
                              <span className="font-medium text-ink group-hover:text-brand">
                                {STATUS_LABEL[s]}
                              </span>
                              <span className="font-mono text-[13px] tabular-nums text-ink-2">{count}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-section">
                              <div
                                className="h-2.5 rounded-full transition-all duration-300 group-hover:opacity-85"
                                style={{
                                  width: `${Math.max(count > 0 ? 4 : 0, (count / maxPipeline) * 100)}%`,
                                  background: color,
                                }}
                              />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <Card
                  title="Recent qualified & active leads"
                  subtitle="Latest CRM records updated by the AI agent or staff"
                  className="lg:col-span-7"
                  padded={false}
                  action={
                    <Link to="/leads" className="text-[13px] font-medium text-brand hover:underline">
                      Open CRM →
                    </Link>
                  }
                >
                  <Async state={leads}>
                    {(list) =>
                      !list.length ? (
                        <div className="p-6">
                          <EmptyState title="No leads yet" hint="Run a call in AI Voice Agent to capture a lead." />
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[580px] text-sm">
                            <thead className="border-b border-line bg-surface-2/60 text-xs text-ink-2">
                              <tr>
                                <th className="px-6 py-3 text-left font-medium">Customer</th>
                                <th className="px-4 py-3 text-left font-medium">Requirement</th>
                                <th className="px-4 py-3 text-left font-medium">Budget</th>
                                <th className="px-4 py-3 text-left font-medium">Score</th>
                                <th className="px-6 py-3 text-left font-medium">Stage</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {list.slice(0, 6).map((l) => (
                                <tr key={l.id} className="transition-colors hover:bg-canvas">
                                  <td className="px-6 py-3.5">
                                    <Link
                                      to={`/leads/${l.id}`}
                                      className="flex items-center gap-2 font-medium text-ink hover:text-brand"
                                    >
                                      <span className="truncate">{l.full_name || 'Unnamed caller'}</span>
                                      {l.is_demo && <DemoTag />}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3.5 text-ink-2">
                                    {[l.profile?.bedrooms && `${l.profile.bedrooms}BHK`, l.profile?.location]
                                      .filter(Boolean)
                                      .join(' · ') || '—'}
                                  </td>
                                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-2">
                                    {fmtRupees(l.profile?.budgetMax)}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <Badge tone={SCORE_TONE[scoreClass(l.score)]}>
                                      <span className="font-mono">{l.score}</span> · {scoreClass(l.score)}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                  </Async>
                </Card>

                <div className="space-y-6 lg:col-span-5">
                  <Card
                    title="Upcoming site visits"
                    action={
                      <Link className="text-[13px] font-medium text-brand hover:underline" to="/appointments">
                        Schedule →
                      </Link>
                    }
                  >
                    {!o.upcoming.length ? (
                      <EmptyState title="No upcoming visits" hint="Visits booked by the agent appear here." />
                    ) : (
                      <ul className="divide-y divide-line">
                        {o.upcoming.map((a) => (
                          <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <Link
                              to={`/leads/${a.lead_id}`}
                              className="flex min-w-0 items-center gap-2 font-medium text-ink hover:text-brand"
                            >
                              <span className="truncate">{a.full_name || 'Unnamed'}</span>
                              {a.is_demo && <DemoTag />}
                            </Link>
                            <span className="shrink-0 font-mono text-xs text-ink-2">
                              {fmtSlot(a.starts_at)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>

                  <Card
                    title="Customer sentiment"
                    subtitle={`${sentimentTotal} classified customer messages`}
                  >
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
                </div>
              </div>

              <Card
                title="Recent customer interactions"
                subtitle="Latest voice and text transcripts with RAG & CRM synchronization"
                padded={false}
                action={
                  <Link className="text-[13px] font-medium text-brand hover:underline" to="/conversations">
                    View all →
                  </Link>
                }
              >
                <Async state={convs}>
                  {(list) =>
                    !list.length ? (
                      <div className="p-6">
                        <EmptyState
                          title="No conversations yet"
                          hint="Start one from the AI Voice Agent page."
                        />
                      </div>
                    ) : (
                      <ul className="divide-y divide-line">
                        {list.slice(0, 5).map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`/conversations/${c.id}`}
                              className="flex items-center gap-3.5 px-6 py-3.5 text-sm transition-colors hover:bg-canvas"
                            >
                              <span className="min-w-44 font-medium text-ink">
                                {c.full_name || 'Unnamed caller'}
                              </span>
                              <span
                                className="min-w-0 flex-1 truncate text-ink-2"
                                title={c.first_message || ''}
                              >
                                {c.first_message || 'No customer message yet'}
                              </span>
                              <Badge>{LANG_LABEL[c.language]}</Badge>
                              <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                              <span className="hidden font-mono text-xs text-ink-muted md:block">
                                {fmtDateTime(c.started_at)}
                              </span>
                              <ArrowUpRight className="size-4 shrink-0 text-ink-muted" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )
                  }
                </Async>
              </Card>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
