import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  UserRound,
  CalendarSearch,
  CalendarDays,
} from 'lucide-react';
import { Badge, Card, cx } from '../ui';
import { fmtSlot } from '../../lib/format';

/** Derived from the backend's turn result, so the UI never claims a booking the database does not have. */
function deriveStatus(result) {
  if (!result) return { key: 'none' };
  const booked = result.trace?.steps?.find((s) => s.tool === 'bookAppointment' && s.ok);
  if (booked) {
    return {
      key: 'booked',
      at: booked.result?.starts_at,
      ref: booked.result?.id?.slice(0, 8).toUpperCase(),
    };
  }
  if (result.outcome === 'already_booked' || result.lead?.status === 'visit_scheduled') {
    return { key: 'scheduled' };
  }
  if (result.pendingConfirmation) {
    return {
      key: 'awaiting_confirmation',
      at: result.pendingConfirmation.startsAt,
      expiresAt: result.pendingConfirmation.expiresAt,
    };
  }
  if (result.outcome === 'booking_conflict') return { key: 'conflict', slots: result.offeredSlots };
  if (result.outcome === 'awaiting_contact') return { key: 'awaiting_contact' };
  if (result.offeredSlots?.length) return { key: 'offered', slots: result.offeredSlots };
  return { key: 'none' };
}

const VIEW = {
  none: { icon: CalendarDays, tone: 'slate', label: 'No visit requested', box: 'bg-surface-2 border-line text-ink-2' },
  offered: { icon: CalendarSearch, tone: 'sky', label: 'Free slots offered', box: 'bg-info-soft border-info-border text-info' },
  awaiting_contact: { icon: UserRound, tone: 'amber', label: 'Waiting for name and phone', box: 'bg-warning-soft border-warning-border text-warning' },
  awaiting_confirmation: {
    icon: CalendarClock,
    tone: 'amber',
    label: 'Proposed: NOT booked until the customer says yes',
    box: 'bg-warning-soft border-warning-border text-warning',
  },
  conflict: {
    icon: CalendarX,
    tone: 'red',
    label: 'Slot taken by another customer: new slots offered',
    box: 'bg-danger-soft border-danger-border text-danger',
  },
  booked: { icon: CalendarCheck, tone: 'green', label: 'Booked and confirmed', box: 'bg-success-soft border-success-border text-success' },
  scheduled: { icon: CalendarCheck, tone: 'green', label: 'Customer already has a confirmed visit', box: 'bg-success-soft border-success-border text-success' },
};

export default function AppointmentStatus({ result }) {
  const st = deriveStatus(result);
  const v = VIEW[st.key];
  const Icon = v.icon;

  return (
    <Card title="Appointment status">
      <div className="flex items-start gap-3.5">
        <div className={cx('grid size-10 shrink-0 place-items-center rounded-lg border', v.box)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 space-y-2 text-sm">
          <Badge tone={v.tone}>{v.label}</Badge>
          {st.at && (
            <div className="font-medium text-ink">
              {fmtSlot(st.at)}
              {st.ref && <span className="ml-2 font-mono text-[13px] text-ink-muted">Ref {st.ref}</span>}
            </div>
          )}
          {st.expiresAt && (
            <div className="font-mono text-xs text-ink-muted">Proposal expires {fmtSlot(st.expiresAt)}</div>
          )}
          {st.slots?.length > 0 && (
            <ul className="space-y-1 text-[13px] text-ink-2">
              {st.slots.map((s, i) => (
                <li key={s.startsAt}>
                  <span className="font-mono text-ink-muted">{i + 1})</span> {fmtSlot(s.startsAt)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
