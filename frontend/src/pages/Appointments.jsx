import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { Async, Badge, Button, Card, DemoTag, EmptyState, PageHeader, STATUS_TONE, Toast, cx } from '../components/ui';
import { fmtSlot, humanize } from '../lib/format';

function isoDayKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function Reschedule({ appt, onDone, notify }) {
  const slots = useApi('/appointments/availability?limit=24');
  const [busy, setBusy] = useState(null);

  const pick = async (startsAt) => {
    setBusy(startsAt);
    try {
      await api(`/appointments/${appt.id}/reschedule`, { method: 'PATCH', body: { startsAt } });
      notify('Visit rescheduled');
      onDone();
    } catch (err) {
      notify(err.message, 'error');
      slots.reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-3.5 rounded-lg border border-line bg-canvas p-4">
      <div className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <Clock className="size-4 text-brand" />
        Pick an available slot (read live from calendar availability):
      </div>
      <Async state={slots}>
        {(list) =>
          !list.length ? (
            <p className="text-[13px] text-ink-muted">No free slots in the booking window.</p>
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

/** 7-day calendar overview built directly from live appointments + open availability slots. */
function WeeklyScheduleOverview({ appointments, availability }) {
  const days = useMemo(() => {
    const out = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const key = isoDayKey(d);
      const dayAppts = (appointments || []).filter((a) => isoDayKey(a.starts_at) === key);
      const freeSlots = (availability || []).filter((s) => isoDayKey(s.startsAt) === key);
      out.push({
        key,
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateNum: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        isToday: i === 0,
        appointments: dayAppts,
        freeCount: freeSlots.length,
      });
    }
    return out;
  }, [appointments, availability]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((d) => (
        <div
          key={d.key}
          className={cx(
            'flex flex-col rounded-xl border p-3.5',
            d.isToday ? 'border-brand bg-brand-soft/30' : 'border-line bg-surface',
          )}
        >
          <div className="flex items-baseline justify-between border-b border-line pb-2.5">
            <span className={cx('text-sm font-semibold', d.isToday ? 'text-brand-deep' : 'text-ink')}>
              {d.weekday}
            </span>
            <span className="font-mono text-xs text-ink-muted">{d.dateNum}</span>
          </div>
          <div className="mt-3 flex-1 space-y-2">
            {d.appointments.length === 0 ? (
              <div className="text-xs text-ink-muted">No visits</div>
            ) : (
              d.appointments.map((a) => (
                <Link
                  key={a.id}
                  to={`/leads/${a.lead_id}`}
                  className={cx(
                    'block rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:border-brand',
                    a.status === 'confirmed'
                      ? 'border-success-border bg-success-soft text-success'
                      : 'border-line bg-surface-2 text-ink-2',
                  )}
                >
                  <div className="truncate font-medium text-ink">{a.full_name || 'Unnamed'}</div>
                  <div className="font-mono text-[11px] opacity-85">
                    {new Date(a.starts_at).toLocaleTimeString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-3 border-t border-line pt-2 font-mono text-xs text-ink-2">
            {d.freeCount} open slot{d.freeCount === 1 ? '' : 's'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Appointments() {
  const [view, setView] = useState('upcoming');
  const from = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }, []);
  const path =
    view === 'upcoming' ? `/appointments?status=confirmed&from=${encodeURIComponent(from)}` : '/appointments';
  const state = useApi(path);
  const availability = useApi('/appointments/availability?limit=48');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const { toast, notify, clear } = useToast();

  const setStatus = async (a, status) => {
    if (
      status === 'cancelled' &&
      !window.confirm(`Cancel the visit for ${a.full_name || 'this lead'} on ${fmtSlot(a.starts_at)}?`)
    )
      return;
    setBusy(a.id + status);
    try {
      await api(`/appointments/${a.id}/status`, { method: 'PATCH', body: { status } });
      notify(`Marked ${humanize(status).toLowerCase()}`);
      state.reload();
      availability.reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const confirmAndEmail = async (a) => {
    setBusy(`${a.id}confirm`);
    try {
      const res = await api(`/appointments/${a.id}/confirm`, { method: 'POST' });
      const info = res.emailNotification;
      if (info?.sent) notify(`Visit confirmed — confirmation email sent to ${info.to}`);
      else if (info?.skipped) notify(`Visit confirmed (${info.reason})`, 'warn');
      else notify(`Visit confirmed, but email failed: ${info?.error || 'unknown error'}`, 'error');
      state.reload();
      availability.reload();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Site Visit Scheduling"
        title="Appointment Management"
        description="Site visits booked by VaaniQ only after explicit customer confirmation. Database constraints enforce single-booking slot integrity."
        actions={
          <div className="flex rounded-lg border border-line bg-surface-2 p-1">
            {['upcoming', 'all'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cx(
                  'cursor-pointer rounded-md px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors',
                  view === v
                    ? 'bg-surface text-brand-deep shadow-[var(--shadow-card)]'
                    : 'text-ink-2 hover:text-ink',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <Card
        title="7-day schedule overview"
        subtitle="Confirmed bookings vs remaining bookable slots across the upcoming week"
      >
        <WeeklyScheduleOverview appointments={state.data} availability={availability.data} />
      </Card>

      <Card
        title={view === 'upcoming' ? 'Confirmed upcoming visits' : 'All scheduled & historical visits'}
        subtitle="Manage attendance status or reschedule into another open slot"
        padded={false}
      >
        <Async state={state}>
          {(list) =>
            !list.length ? (
              <div className="p-6">
                <EmptyState
                  icon={CalendarDays}
                  title={view === 'upcoming' ? 'No upcoming visits' : 'No appointments yet'}
                  hint="Complete a booking conversation in the AI Voice Agent to schedule a site visit."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {list.map((a) => (
                  <li key={a.id} className="px-6 py-4.5 transition-colors hover:bg-canvas/50">
                    <div className="flex flex-wrap items-center gap-3.5">
                      <div className="w-56 font-mono text-[13px] font-medium text-ink">
                        {fmtSlot(a.starts_at)}
                      </div>

                      <Link
                        to={`/leads/${a.lead_id}`}
                        className="flex min-w-48 flex-1 flex-col gap-0.5 text-[15px] font-medium text-ink hover:text-brand"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span>{a.full_name || 'Unnamed'}</span>
                          {a.is_demo && <DemoTag />}
                          <span className="font-mono text-[13px] font-normal text-ink-muted">
                            score {a.score}
                          </span>
                        </span>
                        <span className="font-mono text-xs font-normal text-ink-muted">
                          {a.email ? a.email : 'No email on lead'}
                          {a.confirmation_email_sent_at ? ` · Confirmation emailed` : ''}
                        </span>
                      </Link>

                      <Badge tone={STATUS_TONE[a.status]}>
                        {a.status === 'confirmed' && <CheckCircle2 className="size-3.5" />}
                        {a.status === 'cancelled' && <XCircle className="size-3.5" />}
                        {a.status === 'no_show' && <AlertCircle className="size-3.5" />}
                        {humanize(a.status)}
                      </Badge>

                      {a.status === 'confirmed' && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={a.confirmation_email_sent_at ? 'secondary' : 'primary'}
                            loading={busy === `${a.id}confirm`}
                            onClick={() => confirmAndEmail(a)}
                          >
                            <Mail className="size-3.5" />
                            {a.confirmation_email_sent_at ? 'Resend Email' : 'Confirm & Email'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setOpen(open === a.id ? null : a.id)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busy === `${a.id}completed`}
                            onClick={() => setStatus(a, 'completed')}
                          >
                            Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busy === `${a.id}no_show`}
                            onClick={() => setStatus(a, 'no_show')}
                          >
                            No-show
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={busy === `${a.id}cancelled`}
                            onClick={() => setStatus(a, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    {a.notes && <div className="mt-2 text-[13px] text-ink-2">{a.notes}</div>}
                    {open === a.id && (
                      <Reschedule
                        appt={a}
                        notify={notify}
                        onDone={() => {
                          setOpen(null);
                          state.reload();
                          availability.reload();
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )
          }
        </Async>
      </Card>

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
