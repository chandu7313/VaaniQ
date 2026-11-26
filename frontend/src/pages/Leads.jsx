import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X, Plus, Search } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import {
  Async,
  Badge,
  Button,
  Card,
  DemoTag,
  EmptyState,
  Field,
  PageHeader,
  STATUS_TONE,
  SCORE_TONE,
  Toast,
  inputCls,
  cx,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { STATUS_LABEL, fmtDateTime, fmtRupees, fmtSlot, scoreClass, humanize } from '../lib/format';

/** Manual lead entry by staff (goes through the saveLead tool: validated, deduplicated by phone, scored). */
function NewLeadForm({ onCreated, onCancel, notify }) {
  const [f, setF] = useState({ fullName: '', phone: '', email: '', bedrooms: '', budgetLakh: '', timelineMonths: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const profile = {
      ...(f.bedrooms ? { bedrooms: Number(f.bedrooms) } : {}),
      ...(f.budgetLakh ? { budgetMax: Math.round(Number(f.budgetLakh) * 1e5) } : {}),
      ...(f.timelineMonths ? { timelineMonths: Number(f.timelineMonths) } : {}),
    };
    const digits = f.phone.replace(/\D/g, '').slice(-10);
    setSaving(true);
    try {
      const r = await api('/leads', {
        method: 'POST',
        body: {
          ...(f.fullName.trim() ? { fullName: f.fullName.trim() } : {}),
          ...(digits ? { phone: `+91${digits}` } : {}),
          ...(f.email.trim() ? { email: f.email.trim() } : {}),
          profile,
        },
      });
      notify(
        r.created
          ? `Lead created (score ${r.score.total})`
          : 'A lead with this phone already exists: details merged into it',
      );
      onCreated(r.leadId);
    } catch (err) {
      notify(err.details?.[0]?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="New lead"
      subtitle="Only enter facts stated by the customer; unknown fields score 0."
      className="mb-6"
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Name">
          <input className={inputCls} value={f.fullName} onChange={set('fullName')} maxLength={80} />
        </Field>
        <Field label="Mobile (10 digits)">
          <input className={inputCls} value={f.phone} onChange={set('phone')} inputMode="tel" />
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={f.email} onChange={set('email')} placeholder="customer@example.com" />
        </Field>
        <Field label="BHK">
          <select className={inputCls} value={f.bedrooms} onChange={set('bedrooms')}>
            <option value="">Not stated</option>
            <option value="2">2BHK</option>
            <option value="3">3BHK</option>
          </select>
        </Field>
        <Field label="Budget (₹ lakh)">
          <input
            className={inputCls}
            type="number"
            min="10"
            max="5000"
            value={f.budgetLakh}
            onChange={set('budgetLakh')}
          />
        </Field>
        <Field label="Timeline (months)">
          <input
            className={inputCls}
            type="number"
            min="1"
            max="120"
            value={f.timelineMonths}
            onChange={set('timelineMonths')}
          />
        </Field>
        <div className="flex items-end gap-2">
          <Button type="submit" loading={saving}>
            Save
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ScheduleVisitPicker({ lead, onBooked, notify }) {
  const slots = useApi('/appointments/availability?limit=18');
  const [busy, setBusy] = useState(null);

  if (!lead.full_name || !lead.phone) {
    return (
      <p className="mt-3 rounded-lg border border-warn-border bg-warn-soft px-3 py-2 text-xs text-warn">
        Name and mobile number are required before a site visit slot can be booked.
      </p>
    );
  }

  const pick = async (startsAt) => {
    setBusy(startsAt);
    try {
      const res = await api('/appointments', { method: 'POST', body: { leadId: lead.id, startsAt } });
      const info = res.result?.emailNotification;
      if (info?.sent) notify(`Visit scheduled & confirmation email sent to ${info.to}`);
      else if (info?.skipped) notify(`Visit scheduled for ${fmtSlot(startsAt)} (${info.reason})`);
      else notify(`Visit scheduled for ${fmtSlot(startsAt)}`);
      onBooked();
    } catch (err) {
      notify(err.details?.[0]?.message || err.message, 'error');
      slots.reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-line bg-canvas p-3.5">
      <div className="mb-2 text-xs font-medium text-ink-2">
        Select an open slot to book &amp; show on the Appointments page:
      </div>
      <Async state={slots}>
        {(list) =>
          !list.length ? (
            <p className="text-xs text-ink-muted">No open slots in the booking window.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {list.map((s) => (
                <Button
                  key={s.startsAt}
                  size="sm"
                  variant="secondary"
                  loading={busy === s.startsAt}
                  onClick={() => pick(s.startsAt)}
                >
                  {fmtSlot(s.startsAt)}
                </Button>
              ))}
            </div>
          )
        }
      </Async>
    </div>
  );
}

function LeadDetail({ id, onClose, onChanged, notify }) {
  const state = useApi(`/leads/${id}`);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);

  const remove = async (l) => {
    if (
      !window.confirm(
        `Permanently delete ${l.full_name || 'this lead'}? Their appointments are deleted too; conversations stay without a lead. This cannot be undone.`,
      )
    )
      return;
    try {
      await api(`/leads/${id}`, { method: 'DELETE' });
      notify('Lead deleted');
      onChanged();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const setStatus = async (status, currentLead) => {
    setSaving(true);
    try {
      await api(`/leads/${id}`, { method: 'PATCH', body: { status } });
      const hasConfirmed = currentLead?.appointments?.some((a) => a.status === 'confirmed');
      if (status === 'visit_scheduled' && !hasConfirmed) {
        setShowScheduler(true);
        notify('Stage set to Visit scheduled — pick a slot below to add it to Appointments');
      } else {
        notify('Lead status updated');
      }
      state.reload();
      onChanged();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="scrollbar-thin fixed inset-y-0 right-0 z-40 w-full max-w-2xl overflow-y-auto border-l border-line bg-surface p-7 shadow-[var(--shadow-drawer)]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 cursor-pointer rounded-lg p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      <Async state={state}>
        {(l) => (
          <div className="space-y-6 pr-2">
            <div className="border-b border-line pb-5">
              <div className="flex flex-wrap items-center gap-2.5 pr-10">
                <h2 className="font-serif text-3xl font-medium text-ink">
                  {l.full_name || 'Unnamed caller'}
                </h2>
                {l.is_demo && <DemoTag />}
              </div>
              <div className="mt-1.5 font-mono text-[13px] text-ink-2">
                {l.phone || 'No phone yet'} · {l.email || 'No email yet'} · created {fmtDateTime(l.created_at)}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  value={emailDraft ?? l.email ?? ''}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="Customer email (for visit confirmation)"
                  className={`${inputCls} max-w-xs py-1.5 text-sm`}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={saving}
                  disabled={!((emailDraft ?? '').trim()) || (emailDraft ?? '').trim() === (l.email || '')}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await api(`/leads/${id}`, { method: 'PATCH', body: { email: emailDraft.trim() } });
                      setEmailDraft(null);
                      notify('Customer email updated');
                      state.reload();
                      onChanged();
                    } catch (err) {
                      notify(err.details?.[0]?.message || err.message, 'error');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Save email
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink-2">
                  <span>Pipeline stage</span>
                  <select
                    className={`${inputCls} w-48 py-1.5 text-sm`}
                    value={l.status}
                    disabled={saving}
                    onChange={(e) => setStatus(e.target.value, l)}
                  >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                {user?.role === 'admin' && (
                  <Button variant="danger" size="sm" onClick={() => remove(l)}>
                    Delete lead
                  </Button>
                )}
              </div>
            </div>

            <Card title="Customer requirements (stated only)">
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                {[
                  ['Configuration', l.profile.bedrooms && `${l.profile.bedrooms}BHK`],
                  ['Location', l.profile.location],
                  ['Budget', l.profile.budgetMax && fmtRupees(l.profile.budgetMax)],
                  [
                    'Timeline',
                    l.profile.timelineMonths &&
                      `${l.profile.timelineMonths} month${l.profile.timelineMonths === 1 ? '' : 's'}`,
                  ],
                  ['Decision-maker', l.profile.decisionMaker && humanize(l.profile.decisionMaker)],
                  ['Purpose', l.profile.purpose && humanize(l.profile.purpose)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-ink-muted">{k}</dt>
                    <dd className={v ? 'mt-0.5 font-medium text-ink' : 'mt-0.5 text-ink-muted'}>
                      {v || 'Not stated'}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="Qualification score">
              <ScoreBreakdown score={l.score_breakdown?.factors ? l.score_breakdown : null} />
            </Card>

            <Card
              title={`Appointments (${l.appointments.length})`}
              actions={
                <Button size="sm" variant="secondary" onClick={() => setShowScheduler((v) => !v)}>
                  {showScheduler ? 'Close slots' : 'Schedule visit'}
                </Button>
              }
            >
              {!l.appointments.length ? (
                <p className="text-sm text-ink-muted">
                  {l.status === 'visit_scheduled'
                    ? 'Stage is "Visit scheduled", but no slot is booked yet. Click "Schedule visit" or pick a slot below so it appears on the Appointments page.'
                    : 'No scheduled visits.'}
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {l.appointments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-mono text-ink">{fmtSlot(a.starts_at)}</span>
                      <Badge tone={STATUS_TONE[a.status]}>{humanize(a.status)}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {(showScheduler || (l.status === 'visit_scheduled' && !l.appointments.some((a) => a.status === 'confirmed'))) && (
                <ScheduleVisitPicker
                  lead={l}
                  notify={notify}
                  onBooked={() => {
                    setShowScheduler(false);
                    state.reload();
                    onChanged();
                  }}
                />
              )}
            </Card>

            <Card title={`Conversations (${l.conversations.length})`}>
              {!l.conversations.length ? (
                <p className="text-sm text-ink-muted">No conversations recorded.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {l.conversations.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/conversations/${c.id}`}
                        className="flex items-center justify-between py-2.5 text-sm text-ink transition-colors hover:text-brand"
                      >
                        <span className="font-mono">{fmtDateTime(c.started_at)}</span>
                        <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {l.summaries[0] && (
              <Card title="Latest call summary">
                <p className="text-sm leading-relaxed text-ink">{l.summaries[0].summary.narrative}</p>
                {l.summaries[0].summary.recommendedNextActions?.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-[13px] text-ink-2">
                    {l.summaries[0].summary.recommendedNextActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        )}
      </Async>
    </aside>
  );
}

export default function Leads() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState(params.get('status') || '');
  const [search, setSearch] = useState('');
  const qs = new URLSearchParams({
    ...(status && { status }),
    ...(search.trim() && { search: search.trim() }),
  }).toString();
  const state = useApi(`/leads${qs ? `?${qs}` : ''}`);
  const { toast, notify, clear } = useToast();
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Customer Relationship Management"
        title="Leads & CRM"
        description="Leads are created, deduplicated by phone, and scored automatically through validated saveLead / updateLead tools on every turn."
        actions={
          !adding && (
            <Button onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              Add lead
            </Button>
          )
        }
      />

      {adding && (
        <NewLeadForm
          notify={notify}
          onCancel={() => setAdding(false)}
          onCreated={(leadId) => {
            setAdding(false);
            state.reload();
            navigate(`/leads/${leadId}`);
          }}
        />
      )}

      {/* Filter & Search Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setStatus('')}
            className={cx(
              'cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              status === ''
                ? 'bg-surface text-ink shadow-[var(--shadow-card)]'
                : 'text-ink-2 hover:text-ink',
            )}
          >
            All
          </button>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStatus(k)}
              className={cx(
                'cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                status === k
                  ? 'bg-surface text-brand-deep shadow-[var(--shadow-card)]'
                  : 'text-ink-2 hover:text-ink',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>
      </div>

      <Card padded={false}>
        <Async state={state}>
          {(leads) =>
            !leads.length ? (
              <div className="p-6">
                <EmptyState
                  title="No leads match"
                  hint="Run a conversation in the AI Voice Agent to create one, or adjust your filter."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-b border-line bg-surface-2/70 text-xs uppercase tracking-wider text-ink-2">
                    <tr>
                      {['Lead', 'Requirement', 'Budget', 'Timeline', 'Qualification Score', 'Status', 'Updated'].map(
                        (h) => (
                          <th key={h} className="px-6 py-3.5 text-left font-mono font-medium">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {leads.map((l) => (
                      <tr
                        key={l.id}
                        onClick={() => navigate(`/leads/${l.id}`)}
                        className={cx(
                          'cursor-pointer transition-colors hover:bg-canvas',
                          id === l.id && 'bg-brand-soft/35',
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-ink">
                            <span>{l.full_name || 'Unnamed caller'}</span>
                            {l.is_demo && <DemoTag />}
                          </div>
                          <div className="mt-0.5 font-mono text-xs text-ink-muted">{l.phone || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-ink-2">
                          {[l.profile.bedrooms && `${l.profile.bedrooms}BHK`, l.profile.location]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[13px] text-ink">
                          {fmtRupees(l.profile.budgetMax)}
                        </td>
                        <td className="px-6 py-4 font-mono text-[13px] text-ink-2">
                          {l.profile.timelineMonths ? `${l.profile.timelineMonths} mo` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-section">
                              <div
                                className="h-2 rounded-full bg-brand"
                                style={{ width: `${Math.min(100, l.score || 0)}%` }}
                              />
                            </div>
                            <span className="w-7 font-mono text-[13px] font-semibold tabular-nums text-ink">
                              {l.score}
                            </span>
                            <Badge tone={SCORE_TONE[scoreClass(l.score)]}>{scoreClass(l.score)}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-ink-muted">
                          {fmtDateTime(l.updated_at)}
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

      {id && (
        <>
          <div className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px]" onClick={() => navigate('/leads')} />
          <LeadDetail
            id={id}
            onClose={() => navigate('/leads')}
            onChanged={state.reload}
            notify={notify}
          />
        </>
      )}

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
