import { Mic, MicOff, Volume2, ArrowRight, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { ProductBrand } from '../ProductBrand';
import { LANG_LABEL } from '../../lib/format';

export default function WelcomeScreen({
  overview,
  lang,
  onSelectLang,
  onStart,
  starting,
  sttSupported,
  permission,
  error,
}) {
  const tenant = overview?.tenant;
  const units = tenant?.units || [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-6 sm:py-12">
      {/* Editorial Hero */}
      <div className="rounded-2xl border border-[#E2E4DC] bg-white p-7 shadow-[0_1px_3px_rgba(32,41,34,0.05)] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E4DC] pb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#244D3C]">
              {tenant?.companyName || 'ABC Developers'}
            </div>
            <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-[#202922] sm:text-4xl">
              {tenant?.projectName || 'GreenHaven Residences'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#657168]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-[#244D3C]" />
                {tenant?.location || 'Gachibowli, Hyderabad'}
              </span>
              {tenant?.visitingHours && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-[#244D3C]" />
                  Visits {tenant.visitingHours.startHour}:00–{tenant.visitingHours.endHour}:00, Mon–Sat
                </span>
              )}
            </div>
          </div>
          <ProductBrand size="md" surface="light" />
        </div>

        {/* Assistant Introduction */}
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h2 className="font-serif text-2xl font-medium text-[#202922]">
                Meet VaaniQ, your personal residence guide.
              </h2>
              <p className="text-[15px] leading-relaxed text-[#657168]">
                Ask about floor plans, pricing, clubhouse amenities, or schedule an in-person tour at your convenience—by voice or text in the language most comfortable for you.
              </p>
            </div>

            {/* Language Selection */}
            <div>
              <div className="mb-2.5 text-sm font-medium text-[#202922]">
                Choose your preferred language
              </div>
              <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Preferred language">
                {Object.entries(LANG_LABEL).map(([code, label]) => {
                  const active = lang === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelectLang(code)}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium transition-colors ${
                        active
                          ? 'border-[#244D3C] bg-[#DCE9DD] text-[#193B30]'
                          : 'border-[#E2E4DC] bg-[#F7F7F2] text-[#657168] hover:border-[#CFD3C7] hover:text-[#202922]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Microphone Guidance */}
            <div className="rounded-xl border border-[#DCE9DD] bg-[#F7F7F2] p-4 text-sm text-[#657168]">
              <div className="flex items-start gap-3">
                {sttSupported ? (
                  <Mic className="mt-0.5 size-4.5 shrink-0 text-[#244D3C]" />
                ) : (
                  <MicOff className="mt-0.5 size-4.5 shrink-0 text-[#9A6216]" />
                )}
                <div className="space-y-1">
                  <div className="font-medium text-[#202922]">
                    {sttSupported
                      ? permission === 'denied'
                        ? 'Microphone access is blocked in your browser'
                        : 'Speak naturally or type anytime'
                      : 'Text conversation ready (voice input works best in Chrome or Edge)'}
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#657168]">
                    {permission === 'denied'
                      ? 'You can allow microphone access in your browser site settings, or continue comfortably by typing.'
                      : 'When you press the microphone button, your browser may ask for permission. No audio is recorded or stored.'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-[#E7BDBD] bg-[#FAE8E8] px-4 py-3 text-sm text-[#A93B3B]">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={onStart}
                disabled={starting}
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#244D3C] px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#193B30] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{starting ? 'Starting conversation…' : 'Start conversation'}</span>
                <ArrowRight className="size-4.5" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[#657168]">
                <Volume2 className="size-4 text-[#244D3C]" />
                Spoken &amp; visual answers
              </span>
            </div>
          </div>

          {/* Verified Residence Snapshot */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E2E4DC] bg-[#F7F7F2] p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">
                Verified Configurations
              </div>
              <p className="mt-1 text-[13px] text-[#657168]">
                {tenant?.catalogProjectName && tenant.catalogProjectName !== tenant.projectName
                  ? `${tenant.projectName} (${tenant.catalogProjectName}) · Published project inventory`
                  : 'Published project inventory'}
              </p>

              <div className="mt-4 space-y-3">
                {units.map((u) => (
                  <div
                    key={u.type}
                    className="rounded-xl border border-[#E2E4DC] bg-white p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-semibold text-[#202922]">{u.type} Residences</span>
                      <span className="font-mono text-sm font-medium text-[#244D3C]">
                        ₹{u.priceLakh[0]}–{u.priceLakh[1]} Lakh
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] text-[#657168]">
                      {u.sizeSqft[0]} – {u.sizeSqft[1]} sq. ft. · Vastu compliant
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 border-t border-[#E2E4DC] pt-4 text-xs leading-relaxed text-[#657168]">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#244D3C]" />
              <span>
                All figures come directly from ABC Developers’ verified project documents. Demo environment for evaluation.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
