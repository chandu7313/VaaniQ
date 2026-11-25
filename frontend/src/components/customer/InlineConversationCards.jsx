import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Check,
  FileText,
  Building2,
  Wallet,
  MapPin,
  CalendarDays,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
  BedDouble,
  Maximize2,
  Car,
} from 'lucide-react';
import { WaveformIcon } from './BrandHeader';

/** Screen 3: Verified Residence Cards inline inside the conversation stream */
export function InlineResidenceCards({ units = [], budgetLakh, sources = [] }) {
  if (!units.length) return null;

  return (
    <div className="mt-3.5 space-y-2.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        {units.map((u, idx) => {
          const fitsBudget = budgetLakh != null && budgetLakh >= u.priceLakh[0];
          const parkingSlots = u.bedrooms >= 3 ? '2 Covered Parking' : '1 Covered Parking';
          return (
            <div
              key={u.type}
              className="overflow-hidden rounded-2xl border border-[#E2E4DC] bg-white shadow-[0_2px_8px_rgba(32,41,34,0.04)]"
            >
              <img
                src={idx === 0 ? '/images/greenhaven-hero.jpg' : '/images/greenhaven-amenities.jpg'}
                alt={`${u.type} at GreenHaven Residences`}
                className="h-32 w-full object-cover"
              />
              <div className="p-4">
                <div className="text-base font-semibold text-[#202922]">
                  {u.type} — Residence
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#657168]">
                  <span className="inline-flex items-center gap-1">
                    <Maximize2 className="size-3.5 text-[#244D3C]" />
                    {u.sizeSqft[0]}–{u.sizeSqft[1]} sq.ft.
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="size-3.5 text-[#244D3C]" />
                    {u.bedrooms} Bedrooms
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Car className="size-3.5 text-[#244D3C]" />
                    {parkingSlots}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E4DC] pt-3">
                  <span className="font-mono text-base font-bold text-[#202922]">
                    ₹{u.priceLakh[0]}–{u.priceLakh[1]} Lakhs*
                  </span>
                  {fitsBudget && (
                    <span className="rounded-full bg-[#DCE9DD] px-2.5 py-0.5 text-[11px] font-semibold text-[#193B30]">
                      Within your budget
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-[#657168]">
          <FileText className="size-3.5 text-[#244D3C]" />
          <span>
            Source:{' '}
            {sources
              .map((s) => `${s.title.replace(/^ABC (Heights|Developers) - /, '')} › ${s.section}`)
              .join(' · ')}
          </span>
        </div>
      )}
    </div>
  );
}

/** Screen 4: Clean "Your Requirements" confirmation card inline in the conversation */
export function InlineRequirementsCard({ requirements, onUpdateRequirements, disabled }) {
  const [editing, setEditing] = useState(false);
  const [bhk, setBhk] = useState(String(requirements?.bedrooms || '3'));
  const [budget, setBudget] = useState(String(requirements?.budgetLakh || '90'));
  const [area, setArea] = useState(requirements?.location || 'Gachibowli');
  const [timeline, setTimeline] = useState(String(requirements?.timelineMonths || '1'));

  if (!requirements) return null;
  const rows = [
    {
      icon: Building2,
      label: 'Property Type',
      value: requirements.bedrooms ? `${requirements.bedrooms} BHK` : null,
    },
    {
      icon: Wallet,
      label: 'Budget',
      value: requirements.budgetLakh ? `₹${requirements.budgetLakh} Lakhs` : null,
    },
    {
      icon: MapPin,
      label: 'Preferred Location',
      value: requirements.location || null,
    },
    {
      icon: CalendarDays,
      label: 'Purchase Timeline',
      value: requirements.timelineMonths
        ? `Within ${requirements.timelineMonths} Month${requirements.timelineMonths === 1 ? '' : 's'}`
        : null,
    },
  ].filter((r) => r.value);

  if (!rows.length) return null;

  const saveEdit = (e) => {
    e.preventDefault();
    setEditing(false);
    const parts = [
      bhk && `${bhk}BHK apartment`,
      area && `in ${area}`,
      budget && `budget around ₹${budget} lakhs`,
      timeline && `timeline ${timeline} month${timeline === '1' ? '' : 's'}`,
    ]
      .filter(Boolean)
      .join(', ');
    onUpdateRequirements(`Update my preferences: ${parts}.`);
  };

  return (
    <div className="mt-3 rounded-2xl border border-[#E2E4DC] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(32,41,34,0.04)]">
      <h3 className="mb-3 text-[15px] font-semibold text-[#202922]">Your Requirements</h3>

      {!editing ? (
        <>
          <div className="divide-y divide-[#F0F1EA]">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3.5 py-2.5 text-sm">
                <Icon className="size-4.5 shrink-0 text-[#526558]" />
                <span className="w-40 shrink-0 font-medium text-[#4D5A51]">{label}</span>
                <span className="flex-1 font-semibold text-[#202922]">{value}</span>
                <CheckCircle2 className="size-4.5 shrink-0 text-[#2C6E49]" />
              </div>
            ))}
          </div>

          <div className="mt-2 border-t border-[#EAECE4] pt-3 text-center">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[#4D5A51] transition-colors hover:text-[#244D3C]"
            >
              <Pencil className="size-3.5" />
              <span>Edit details</span>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={saveEdit} className="grid gap-3 rounded-xl border border-[#E2E4DC] bg-[#F7F7F2] p-4 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#657168]">Property Type</span>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3 py-2 text-sm text-[#202922]"
            >
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#657168]">Budget (₹ Lakhs)</span>
            <input
              type="number"
              min="20"
              max="500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3 py-2 text-sm text-[#202922]"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#657168]">Preferred Location</span>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3 py-2 text-sm text-[#202922]"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#657168]">Purchase Timeline (months)</span>
            <input
              type="number"
              min="1"
              max="60"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3 py-2 text-sm text-[#202922]"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={disabled}
              className="cursor-pointer rounded-lg bg-[#244D3C] px-4 py-2 text-xs font-medium text-white hover:bg-[#193B30]"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="cursor-pointer rounded-lg border border-[#CFD3C7] bg-white px-4 py-2 text-xs font-medium text-[#657168]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function isoDateKey(d) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(d));
}

function slotTimeOnly(iso) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(iso))
    .toUpperCase();
}

function dayLongLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
}

/** Screen 5: Month Calendar + Available Slots Picker + Consent Contact + Confirmation Buttons */
export function InlineBookingCard({
  slots = [],
  selectingSlot,
  onSelectSlot,
  pendingConfirmation,
  onConfirmPending,
  onDeclinePending,
  needsContact,
  contactSaved,
  onSubmitContact,
  savingContact,
  sending,
}) {
  const slotsByDate = useMemo(() => {
    const map = new Map();
    for (const s of slots) {
      const k = isoDateKey(s.startsAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    }
    return map;
  }, [slots]);

  const availableDates = useMemo(() => Array.from(slotsByDate.keys()).sort(), [slotsByDate]);
  const [pickedDate, setPickedDate] = useState(null);
  const activeDate = pickedDate && slotsByDate.has(pickedDate) ? pickedDate : availableDates[0] || isoDateKey(new Date());

  const [monthOffset, setMonthOffset] = useState(0);
  const calendarMeta = useMemo(() => {
    const [y, m] = activeDate.split('-').map(Number);
    const ref = new Date(Date.UTC(y, m - 1 + monthOffset, 1, 12, 0, 0));
    const year = ref.getUTCFullYear();
    const month = ref.getUTCMonth();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(ref);
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, key, hasSlots: slotsByDate.has(key) });
    }
    return { label, cells };
  }, [activeDate, monthOffset, slotsByDate]);

  const daySlots = slotsByDate.get(activeDate) || [];

  const [fullName, setFullName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [consent, setConsent] = useState(false);
  const [contactError, setContactError] = useState(null);

  const handleContact = async (e) => {
    e.preventDefault();
    setContactError(null);
    const digits = phoneInput.replace(/\D/g, '').slice(-10);
    if (!fullName.trim()) {
      setContactError('Please enter your name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setContactError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!consent) {
      setContactError('Please confirm consent so we may reserve your site visit.');
      return;
    }
    try {
      await onSubmitContact({ fullName: fullName.trim(), phone: `+91${digits}`, consent: true });
    } catch (err) {
      setContactError(err.message);
    }
  };

  return (
    <div className="mt-3 space-y-4">
      {/* Screen 5: Two-Card Calendar + Available Slots */}
      {slots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
          {/* Left Month Calendar Card */}
          <div className="rounded-2xl border border-[#E2E4DC] bg-white p-5 shadow-[0_2px_8px_rgba(32,41,34,0.04)]">
            <div className="mb-3.5 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setMonthOffset((v) => v - 1)}
                className="cursor-pointer rounded-md p-1 text-[#657168] hover:bg-[#F7F7F2]"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold text-[#202922]">{calendarMeta.label}</span>
              <button
                type="button"
                onClick={() => setMonthOffset((v) => v + 1)}
                className="cursor-pointer rounded-md p-1 text-[#657168] hover:bg-[#F7F7F2]"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#657168]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1.5">
                  {d}
                </div>
              ))}
              {calendarMeta.cells.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} />;
                const pendingDate = pendingConfirmation ? isoDateKey(pendingConfirmation.startsAt) : null;
                const selected = cell.key === (pendingDate && !pickedDate ? pendingDate : activeDate);
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!cell.hasSlots}
                    onClick={() => setPickedDate(cell.key)}
                    className={`mx-auto grid size-8.5 place-items-center rounded-full text-xs transition-colors ${
                      selected
                        ? 'bg-[#244D3C] font-semibold text-white'
                        : cell.hasSlots
                          ? 'cursor-pointer font-medium text-[#202922] hover:bg-[#DCE9DD]'
                          : 'cursor-default text-[#B8BEB4]'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Available Slots Radio Card */}
          <div className="rounded-2xl border border-[#E2E4DC] bg-white p-5 shadow-[0_2px_8px_rgba(32,41,34,0.04)]">
            <div className="mb-3 text-[13px] font-semibold text-[#202922]">
              Available Slots – {dayLongLabel(pendingConfirmation && !pickedDate ? isoDateKey(pendingConfirmation.startsAt) : activeDate)}
            </div>
            {daySlots.length === 0 ? (
              <p className="text-xs text-[#657168]">No slots on this date. Pick a highlighted date.</p>
            ) : (
              <div className="scrollbar-thin max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {daySlots.map((s) => {
                  const isPending =
                    pendingConfirmation &&
                    new Date(pendingConfirmation.startsAt).getTime() === new Date(s.startsAt).getTime();
                  const isSelected = selectingSlot === s.startsAt || isPending;
                  return (
                    <button
                      key={s.startsAt}
                      type="button"
                      disabled={Boolean(selectingSlot) || sending}
                      onClick={() => onSelectSlot(s.startsAt)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-50 ${
                        isSelected
                          ? 'bg-[#DCE9DD]/65 font-semibold text-[#193B30]'
                          : 'font-medium text-[#202922] hover:bg-[#F7F7F2]'
                      }`}
                    >
                      <span
                        className={`grid size-4.5 shrink-0 place-items-center rounded-full border ${
                          isSelected
                            ? 'border-[#244D3C] bg-[#244D3C] text-white'
                            : 'border-[#899188] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="size-3 stroke-[2.5]" />}
                      </span>
                      <span className="font-mono">{slotTimeOnly(s.startsAt)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consent-Gated Contact Form */}
      {needsContact && !contactSaved && (
        <div className="rounded-2xl border border-[#E8D1A1] bg-[#FAF0DC]/60 p-5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#244D3C]" />
            <div>
              <h4 className="text-sm font-semibold text-[#202922]">
                Contact details for your site visit
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#657168]">
                Used solely to reserve your tour slot and generate your confirmation reference.
              </p>
            </div>
          </div>
          <form onSubmit={handleContact} className="mt-3.5 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              required
              className="rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-2 text-sm text-[#202922] focus:border-[#244D3C] focus:outline-none"
            />
            <input
              type="tel"
              inputMode="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="10-digit mobile number"
              required
              className="rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-2 text-sm text-[#202922] focus:border-[#244D3C] focus:outline-none"
            />
            <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E2E4DC] bg-white p-2.5 text-xs text-[#202922] sm:col-span-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 rounded accent-[#244D3C]"
              />
              <span>
                I consent to ABC Developers storing my name and mobile number to confirm and coordinate my site visit.
              </span>
            </label>
            {contactError && <p className="text-xs font-medium text-[#A93B3B] sm:col-span-2">{contactError}</p>}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingContact || !consent}
                className="cursor-pointer rounded-lg bg-[#244D3C] px-4 py-2 text-sm font-medium text-white hover:bg-[#193B30] disabled:opacity-45"
              >
                {savingContact ? 'Saving…' : 'Save & Continue to Confirmation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Screen 5 Bottom Explicit Confirmation Bubble + Action Pair */}
      {pendingConfirmation && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <WaveformIcon size="md" light />
            <div className="rounded-2xl border border-[#E2E4DC] bg-white px-4.5 py-3 text-[15px] text-[#202922] shadow-[0_1px_2px_rgba(32,41,34,0.04)]">
              Shall I book the site visit for{' '}
              <span className="font-semibold text-[#202922]">{pendingConfirmation.label}</span>?
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={sending}
              onClick={onConfirmPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#244D3C] px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#193B30] disabled:opacity-50"
            >
              <Check className="size-4" />
              <span>Yes, Book Now</span>
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={onDeclinePending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CFD3C7] bg-white px-5 py-2.5 text-sm font-medium text-[#202922] shadow-2xs transition-colors hover:bg-[#F7F7F2] disabled:opacity-50"
            >
              <Calendar className="size-4 text-[#244D3C]" />
              <span>Choose Another Slot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
