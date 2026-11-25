import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { Async, Badge, Button, Card, DemoTag, EmptyState, PageHeader, STATUS_TONE, Toast, cx } from '../components/ui';
import { fmtSlot, humanize } from '../lib/format';

function Reschedule({ appt, onDone, notify }) {
  const slots = useApi('/appointments/availability?limit=24');
  const [busy, setBusy] = useState(null);
  const pick = async (startsAt) => {
    setBusy(startsAt);
    try { await api(`/appointments/${appt.id}/reschedule`, { method: 'PATCH', body: { startsAt } }); notify('Visit rescheduled'); onDone(); }
    catch (err) { notify(err.message, 'error'); slots.reload(); } finally { setBusy(null); }
  };
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface p-3">
      <div className="mb-2 text-xs text-slate-400">Pick a free slot (read live from the calendar):</div>
      <Async state={slots}>
        {(list) => (!list.length ? <p className="text-xs text-slate-500">No free slots in the booking window.</p> : (
          <div className="flex flex-wrap gap-1.5">{list.map((s) => <Button key={s.startsAt} size="sm" variant="secondary" loading={busy === s.startsAt} onClick={() => pick(s.startsAt)}>{fmtSlot(s.startsAt)}</Button>)}</div>
        ))}
      </Async>
    </div>
  );
}

export default function Appointments() {
  const [view, setView] = useState('upcoming');
  // Rounded to the hour so the request path is stable across renders.
  const from = useMemo(() => { const d = new Date(); d.setMinutes(0, 0, 0); return d.toISOString(); }, []);
  const path = view === 'upcoming' ? `/appointments?status=confirmed&from=${encodeURIComponent(from)}` : '/appointments';
  const state = useApi(path);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const { toast, notify, clear } = useToast();

  const setStatus = async (a, status) => {
    if (status === 'cancelled' && !window.confirm(`Cancel the visit for ${a.full_name || 'this lead'} on ${fmtSlot(a.starts_at)}?`)) return;
    setBusy(a.id + status);
    try { await api(`/appointments/${a.id}/status`, { method: 'PATCH', body: { status } }); notify(`Marked ${humanize(status).toLowerCase()}`); state.reload(); }
    catch (err) { notify(err.message, 'error'); } finally { setBusy(null); }
  };

  return (
    <div>
      <PageHeader title="Appointment Management" description="Site visits booked by the agent after explicit customer confirmation. A database constraint prevents double-booking a slot."
        actions={<div className="flex rounded-lg border border-line bg-panel p-0.5">{['upcoming', 'all'].map((v) => <button key={v} type="button" onClick={() => setView(v)} className={cx('rounded-md px-3 py-1.5 text-xs font-medium capitalize', view === v ? 'bg-indigo-500 text-white' : 'text-slate-400')}>{v}</button>)}</div>} />
      <Card>
        <Async state={state}>
          {(list) => (!list.length ? <EmptyState title={view === 'upcoming' ? 'No upcoming visits' : 'No appointments yet'} hint="Book one by completing a call in the AI Voice Agent." /> : (
            <ul className="-my-2 divide-y divide-line">{list.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-48 text-sm font-medium text-slate-100">{fmtSlot(a.starts_at)}</div>
                  <Link to={`/leads/${a.lead_id}`} className="flex min-w-40 flex-1 items-center gap-2 text-sm text-slate-300 hover:text-indigo-200">{a.full_name || 'Unnamed'} {a.is_demo && <DemoTag />}<span className="text-xs text-slate-500">score {a.score}</span></Link>
                  <Badge tone={STATUS_TONE[a.status]}>{humanize(a.status)}</Badge>
                  {a.status === 'confirmed' && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => setOpen(open === a.id ? null : a.id)}>Reschedule</Button>
                      <Button size="sm" variant="secondary" loading={busy === `${a.id}completed`} onClick={() => setStatus(a, 'completed')}>Completed</Button>
                      <Button size="sm" variant="secondary" loading={busy === `${a.id}no_show`} onClick={() => setStatus(a, 'no_show')}>No-show</Button>
                      <Button size="sm" variant="danger" loading={busy === `${a.id}cancelled`} onClick={() => setStatus(a, 'cancelled')}>Cancel</Button>
                    </div>
                  )}
                </div>
                {a.notes && <div className="mt-1 text-xs text-slate-500">{a.notes}</div>}
                {open === a.id && <Reschedule appt={a} notify={notify} onDone={() => { setOpen(null); state.reload(); }} />}
              </li>
            ))}</ul>
          ))}
        </Async>
      </Card>
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
