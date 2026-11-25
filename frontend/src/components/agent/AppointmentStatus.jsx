import { CalendarCheck, CalendarClock, CalendarX, UserRound, CalendarSearch, CalendarDays } from 'lucide-react';
import { Badge, Card } from '../ui';
import { fmtSlot } from '../../lib/format';

/** Derived from the backend's turn result, so the UI never claims a booking the database does not have. */
function deriveStatus(result) {
  if (!result) return { key: 'none' };
  const booked = result.trace?.steps?.find((s) => s.tool === 'bookAppointment' && s.ok);
  if (booked) return { key: 'booked', at: booked.result?.starts_at, ref: booked.result?.id?.slice(0, 8).toUpperCase() };
  if (result.outcome === 'already_booked' || result.lead?.status === 'visit_scheduled') return { key: 'scheduled' };
  if (result.pendingConfirmation) return { key: 'awaiting_confirmation', at: result.pendingConfirmation.startsAt, expiresAt: result.pendingConfirmation.expiresAt };
  if (result.outcome === 'booking_conflict') return { key: 'conflict', slots: result.offeredSlots };
  if (result.outcome === 'awaiting_contact') return { key: 'awaiting_contact' };
  if (result.offeredSlots?.length) return { key: 'offered', slots: result.offeredSlots };
  return { key: 'none' };
}

const VIEW = {
  none: { icon: CalendarDays, tone: 'slate', label: 'No visit requested' },
  offered: { icon: CalendarSearch, tone: 'sky', label: 'Free slots offered' },
  awaiting_contact: { icon: UserRound, tone: 'amber', label: 'Waiting for name and phone' },
  awaiting_confirmation: { icon: CalendarClock, tone: 'amber', label: 'Proposed: NOT booked until the customer says yes' },
  conflict: { icon: CalendarX, tone: 'red', label: 'Slot taken by another customer: new slots offered' },
  booked: { icon: CalendarCheck, tone: 'green', label: 'Booked and confirmed' },
  scheduled: { icon: CalendarCheck, tone: 'green', label: 'Customer already has a confirmed visit' },
};

export default function AppointmentStatus({ result }) {
  const st = deriveStatus(result);
  const v = VIEW[st.key];
  const Icon = v.icon;
  return (
    <Card title="Appointment status">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-panel-2"><Icon className="size-4.5 text-slate-300" /></div>
        <div className="min-w-0 space-y-1.5 text-sm">
          <Badge tone={v.tone}>{v.label}</Badge>
          {st.at && <div className="text-slate-200">{fmtSlot(st.at)}{st.ref && <span className="ml-2 text-xs text-slate-500">Ref {st.ref}</span>}</div>}
          {st.expiresAt && <div className="text-xs text-slate-500">Proposal expires {fmtSlot(st.expiresAt)}</div>}
          {st.slots?.length > 0 && <ul className="text-xs text-slate-400">{st.slots.map((s, i) => <li key={s.startsAt}>{i + 1}) {fmtSlot(s.startsAt)}</li>)}</ul>}
        </div>
      </div>
    </Card>
  );
}
