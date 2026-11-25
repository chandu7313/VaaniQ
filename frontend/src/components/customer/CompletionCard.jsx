import { CalendarCheck, CalendarPlus, ArrowUpRight, MapPin, Clock, Calendar, Info, MessageSquareText } from 'lucide-react';

function downloadIcs(appointment, tenant) {
  if (!appointment?.startsAt) return;
  const start = new Date(appointment.startsAt);
  const end = new Date(start.getTime() + 60 * 60000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const location = `${tenant?.projectName || 'GreenHaven Residences'}, ${tenant?.location || 'Gachibowli, Hyderabad'}`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VaaniQ//ABC Developers//EN',
    'BEGIN:VEVENT',
    `UID:${appointment.reference}@vaaniq.demo`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Site Visit - ${tenant?.projectName || 'GreenHaven Residences'} (Ref ${appointment.reference})`,
    `LOCATION:${location}`,
    `DESCRIPTION:Guided 1-hour site visit with ${tenant?.companyName || 'ABC Developers'}. Confirmation Reference: ${appointment.reference}. Please carry a photo ID.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `site-visit-${appointment.reference}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CompletionCard({ appointment, tenant, onExploreMore, onViewTranscript }) {
  const start = appointment?.startsAt ? new Date(appointment.startsAt) : null;
  const dateStr = start
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(start)
    : null;
  const timeStr = start
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
        .format(start)
        .toUpperCase()
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="relative w-full overflow-hidden rounded-3xl border border-[#E2E4DC] bg-gradient-to-b from-[#FAFBF8] to-[#F4F6F0] p-7 text-center shadow-[0_10px_32px_rgba(32,41,34,0.06)] sm:p-11">
        {/* Subtle decorative celebration marks */}
        <svg
          className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full opacity-65"
          viewBox="0 0 600 100"
          fill="none"
          aria-hidden="true"
        >
          <path d="M55 28L63 34" stroke="#E5B05A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="115" cy="48" r="3" fill="#BBDAC6" />
          <path d="M195 16L202 25" stroke="#E5B05A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="385" cy="36" r="2.5" fill="#BBDAC6" />
          <path d="M412 22L420 16" stroke="#E5B05A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="475" cy="40" r="3" fill="#95AB7B" />
          <path d="M542 26L535 33" stroke="#244D3C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M556 58C560 56 565 57 568 61" stroke="#E5B05A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Subtle botanical corner leaves */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 text-[#82966B] opacity-20"
          viewBox="0 0 120 120"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 120V48c18 6 32 22 36 42 12-10 26-14 42-10-12 18-30 32-52 40H0z" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 -scale-x-100 text-[#82966B] opacity-20"
          viewBox="0 0 120 120"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 120V48c18 6 32 22 36 42 12-10 26-14 42-10-12 18-30 32-52 40H0z" />
        </svg>

        {/* Top Sage Icon */}
        <div className="relative mx-auto grid size-16 place-items-center rounded-full bg-[#DCE9DD]/85 text-[#193B30]">
          <CalendarCheck className="size-7.5" />
        </div>

        <h1 className="relative mt-5 font-serif text-3xl font-medium tracking-tight text-[#202922] sm:text-[38px]">
          {appointment ? 'Site Visit Booked Successfully!' : 'Thank You for Speaking With Us'}
        </h1>
        <p className="relative mt-2 text-base text-[#5A665D]">
          Thank you for your interest in {tenant?.projectName || 'GreenHaven Residences'}.
        </p>

        {/* Details Summary Card */}
        {appointment && (
          <div className="relative mx-auto mt-7 grid max-w-2xl items-center gap-5 rounded-2xl border border-[#E2E4DC] bg-white p-5 text-left shadow-[0_2px_10px_rgba(32,41,34,0.04)] sm:grid-cols-[1fr_200px]">
            <div className="divide-y divide-[#E2E4DC] text-sm">
              <div className="flex items-center gap-3 pb-2.5">
                <Calendar className="size-4 shrink-0 text-[#657168]" />
                <span className="w-20 shrink-0 text-[#657168]">Date</span>
                <span className="font-semibold text-[#202922]">{dateStr}</span>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <Clock className="size-4 shrink-0 text-[#657168]" />
                <span className="w-20 shrink-0 text-[#657168]">Time</span>
                <span className="font-semibold text-[#202922]">{timeStr}</span>
              </div>
              <div className="flex items-start gap-3 pt-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#657168]" />
                <span className="w-20 shrink-0 text-[#657168]">Location</span>
                <span className="font-semibold leading-snug text-[#202922]">
                  {tenant?.projectName || 'GreenHaven Residences'},{' '}
                  {tenant?.location || 'Gachibowli, Hyderabad'}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E2E4DC]">
              <img
                src="/images/greenhaven-hero.jpg"
                alt="GreenHaven Residences"
                className="h-32 w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Next Steps & Reference Banner */}
        <div className="relative mx-auto mt-5 flex max-w-2xl items-start gap-3 rounded-xl border border-[#DCE9DD] bg-[#EBF2EC] px-5 py-3.5 text-left text-[13.5px] leading-relaxed text-[#202922]">
          <Info className="mt-0.5 size-4.5 shrink-0 text-[#244D3C]" />
          <span>
            {appointment ? (
              <>
                Confirmation Reference:{' '}
                <strong className="font-mono font-semibold text-[#193B30]">#{appointment.reference}</strong>.
                Please carry a photo ID for your 1-hour guided visit. Our sales representative will also reach out to you shortly.
              </>
            ) : (
              'Your conversation has been saved. You may explore the residence details or start a new conversation anytime.'
            )}
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3.5">
          {appointment && (
            <button
              type="button"
              onClick={() => downloadIcs(appointment, tenant)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#244D3C] px-6 py-3 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#193B30]"
            >
              <CalendarPlus className="size-4" />
              <span>Add to Calendar</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExploreMore}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CFD3C7] bg-white px-6 py-3 text-sm font-medium text-[#202922] shadow-2xs transition-colors hover:bg-[#F7F7F2]"
          >
            <ArrowUpRight className="size-4 text-[#244D3C]" />
            <span>Explore More Projects</span>
          </button>
          {onViewTranscript && (
            <button
              type="button"
              onClick={onViewTranscript}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-[#657168] hover:text-[#202922]"
            >
              <MessageSquareText className="size-4" />
              <span>View Transcript</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
