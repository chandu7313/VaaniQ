import { CheckCircle2, MapPin, CalendarCheck, FileCheck2, RotateCcw } from 'lucide-react';

export default function CompletionCard({ appointment, tenant, ended, onStartNew }) {
  return (
    <div className="rounded-2xl border border-[#BDD4C0] bg-white p-6 shadow-[0_1px_3px_rgba(32,41,34,0.05)]">
      <div className="flex items-start gap-3.5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#DCE9DD] text-[#193B30]">
          <CheckCircle2 className="size-6" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">
            {appointment ? 'Site Visit Confirmed' : 'Conversation Completed'}
          </div>
          <h3 className="mt-1 font-serif text-2xl font-medium text-[#202922]">
            {appointment ? 'We look forward to welcoming you' : 'Thank you for speaking with us'}
          </h3>
        </div>
      </div>

      {appointment && (
        <div className="mt-5 space-y-3 rounded-xl border border-[#E2E4DC] bg-[#F7F7F2] p-4 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#E2E4DC] pb-2.5">
            <span className="flex items-center gap-2 text-[#657168]">
              <FileCheck2 className="size-4 text-[#244D3C]" />
              Confirmation Reference
            </span>
            <span className="font-mono text-base font-semibold tracking-wider text-[#193B30]">
              {appointment.reference}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-[#E2E4DC] pb-2.5">
            <span className="flex items-center gap-2 text-[#657168]">
              <CalendarCheck className="size-4 text-[#244D3C]" />
              Visit Date &amp; Time
            </span>
            <span className="font-medium text-[#202922]">{appointment.label}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[#657168]">
              <MapPin className="size-4 text-[#244D3C]" />
              Site Location
            </span>
            <span className="text-right font-medium text-[#202922]">
              {tenant?.projectName || 'GreenHaven Residences'}, {tenant?.location || 'Gachibowli, Hyderabad'}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#657168]">What happens next</div>
        <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-[#202922]">
          {appointment ? (
            <>
              <li>A dedicated sales advisor will greet you at the site office for a 1-hour guided sample flat tour.</li>
              <li>Please carry a valid photo ID when visiting the property.</li>
              <li>Family members and co-decision makers are welcome to join.</li>
              <li>Visits can be rescheduled or cancelled up to 4 hours before your scheduled slot.</li>
            </>
          ) : (
            <li>
              If you would like to tour the sample residence or ask more questions anytime, you can start a new session below.
            </li>
          )}
        </ul>
      </div>

      {(ended || appointment) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E4DC] pt-4">
          <span className="text-xs text-[#657168]">
            {ended ? 'This conversation has concluded.' : 'You can continue asking questions in the chat.'}
          </span>
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-2 text-[13px] font-medium text-[#202922] hover:bg-[#F7F7F2]"
          >
            <RotateCcw className="size-3.5" />
            Start a new conversation
          </button>
        </div>
      )}
    </div>
  );
}
