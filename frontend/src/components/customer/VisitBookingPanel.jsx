import { useState } from 'react';
import { CalendarDays, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export default function VisitBookingPanel({
  slots,
  loadingSlots,
  daypart,
  onChangeDaypart,
  onSelectSlot,
  selectingSlot,
  pendingConfirmation,
  onConfirmPending,
  onDeclinePending,
  needsContact,
  contactSaved,
  onSubmitContact,
  savingContact,
  sending,
}) {
  const [fullName, setFullName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [consent, setConsent] = useState(false);
  const [contactError, setContactError] = useState(null);

  const handleContactSubmit = async (e) => {
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
      setContactError('Please check the consent box so we may coordinate your site visit.');
      return;
    }
    try {
      await onSubmitContact({ fullName: fullName.trim(), phone: `+91${digits}`, consent: true });
    } catch (err) {
      setContactError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 5B: Explicit Confirmation Card */}
      {pendingConfirmation && (
        <div className="rounded-xl border border-[#244D3C] bg-[#DCE9DD]/55 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#244D3C]" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#193B30]">Confirm your site visit</div>
              <div className="text-sm text-[#202922]">
                Selected time: <span className="font-mono font-semibold">{pendingConfirmation.label}</span>
              </div>
              <p className="text-xs text-[#657168]">
                Your visit will only be reserved once you confirm below.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={sending}
              onClick={onConfirmPending}
              className="cursor-pointer rounded-lg bg-[#244D3C] px-4 py-2 text-sm font-medium text-white hover:bg-[#193B30] disabled:opacity-50"
            >
              Confirm booking
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={onDeclinePending}
              className="cursor-pointer rounded-lg border border-[#CFD3C7] bg-white px-4 py-2 text-sm font-medium text-[#202922] hover:bg-[#F7F7F2] disabled:opacity-50"
            >
              Pick another time
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Consent-Gated Contact Form (Shown ONLY when needed for booking) */}
      {needsContact && !contactSaved && (
        <div className="rounded-xl border border-[#E8D1A1] bg-[#FAF0DC]/65 p-5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#244D3C]" />
            <div>
              <div className="text-sm font-semibold text-[#202922]">Your contact details for this visit</div>
              <p className="mt-1 text-[13px] leading-relaxed text-[#657168]">
                We request your name and mobile number solely to reserve your tour slot and send your visit confirmation reference.
              </p>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#202922]">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                maxLength={80}
                required
                className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-2 text-sm text-[#202922] focus:border-[#244D3C] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#202922]">Mobile number (10 digits)</label>
              <input
                type="tel"
                inputMode="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="98765 43210"
                required
                className="w-full rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-2 text-sm text-[#202922] focus:border-[#244D3C] focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#E2E4DC] bg-white p-3 text-xs leading-relaxed text-[#202922]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 rounded border-[#CFD3C7] accent-[#244D3C]"
              />
              <span>
                I consent to ABC Developers storing my name and mobile number to coordinate my requested site visit.
              </span>
            </label>

            {contactError && <p className="text-xs font-medium text-[#A93B3B]">{contactError}</p>}

            <button
              type="submit"
              disabled={savingContact || !consent}
              className="w-full cursor-pointer rounded-lg bg-[#244D3C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#193B30] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {savingContact ? 'Saving…' : 'Save & proceed to confirmation'}
            </button>
          </form>
        </div>
      )}

      {/* Step 5A: Available Visit Slots */}
      {!pendingConfirmation && (
        <div className="rounded-xl border border-[#E2E4DC] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#202922]">
              <CalendarDays className="size-4 text-[#244D3C]" />
              <span>Available Site Visit Slots</span>
            </div>
            <div className="flex rounded-lg border border-[#E2E4DC] bg-[#F7F7F2] p-0.5 text-xs">
              {[
                ['', 'All'],
                ['morning', 'Morning'],
                ['afternoon', 'Afternoon'],
                ['evening', 'Evening'],
              ].map(([key, label]) => (
                <button
                  key={key || 'all'}
                  type="button"
                  onClick={() => onChangeDaypart(key)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors ${
                    daypart === key
                      ? 'bg-white text-[#244D3C] shadow-xs'
                      : 'text-[#657168] hover:text-[#202922]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-1.5 text-xs text-[#657168]">
            Select any open 1-hour guided visit slot (Mon–Sat, 10 AM – 6 PM IST).
          </p>

          {loadingSlots ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#657168]">
              <Clock className="size-3.5 animate-spin" />
              Checking calendar availability…
            </div>
          ) : !slots?.length ? (
            <p className="mt-4 text-xs text-[#657168]">No free slots match this time window.</p>
          ) : (
            <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {slots.slice(0, 8).map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  disabled={Boolean(selectingSlot) || sending}
                  onClick={() => onSelectSlot(s.startsAt)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-[#E2E4DC] bg-[#F7F7F2] px-3 py-2.5 text-left text-[13px] font-medium text-[#202922] transition-colors hover:border-[#244D3C] hover:bg-[#DCE9DD]/45 disabled:opacity-50"
                >
                  <span>{s.label}</span>
                  <span className="text-xs text-[#244D3C]">
                    {selectingSlot === s.startsAt ? 'Selecting…' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
