import { useState } from 'react';
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
  Mic,
  MicOff,
  X,
} from 'lucide-react';
import { LANG_LABEL, fmtArea } from '../../lib/format';
import { DeveloperMark, WaveformIcon } from './BrandHeader';

const NAV_TOPICS = [
  { key: 'projects', label: 'Projects' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'location', label: 'Location' },
  { key: 'about', label: 'About' },
];

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
  const [activeTopic, setActiveTopic] = useState(null);
  const tenant = overview?.tenant;
  const units = tenant?.units || [];
  const highlights = overview?.highlights || [];

  const filteredHighlights = activeTopic
    ? highlights.filter((h) => {
        const hay = `${h.title} ${h.section}`.toLowerCase();
        if (activeTopic === 'projects') return /overview|pricing|inventory|configuration/i.test(hay);
        if (activeTopic === 'amenities') return /amenit|clubhouse|facilities|utilities/i.test(hay);
        if (activeTopic === 'location') return /location|neighbourhood|nearby|connectivity/i.test(hay);
        if (activeTopic === 'about') return /company|who we are|rera|possession/i.test(hay);
        return true;
      })
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F2] text-[#202922]">
      {/* Screen 1 Clean Top Bar */}
      <header className="relative z-20 shrink-0 border-b border-[#E8EAE2] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2.5">
            <DeveloperMark className="size-8" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight text-[#202922]">
                {tenant?.companyName?.split(' ')[0] || 'ABC'}
              </div>
              <div className="text-xs font-medium text-[#657168]">
                {tenant?.companyName?.split(' ').slice(1).join(' ') || 'Developers'}
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[#657168] md:flex">
            {NAV_TOPICS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTopic((cur) => (cur === item.key ? null : item.key))}
                className={`cursor-pointer transition-colors hover:text-[#244D3C] ${
                  activeTopic === item.key ? 'font-semibold text-[#244D3C]' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="cursor-pointer rounded-full bg-[#244D3C] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#193B30] disabled:opacity-50"
          >
            {starting ? 'Connecting…' : 'Talk to AI Assistant'}
          </button>
        </div>
      </header>

      {/* Full-Bleed Blended Hero Showcase occupying full remaining height */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-[#F7F7F2]">
        {/* Right-side architectural photo seamlessly blended into warm cream canvas */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:block lg:w-[62%]">
          <img
            src="/images/greenhaven-hero.jpg"
            alt="GreenHaven Residences architectural exterior"
            className="h-full w-full object-cover object-center"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 24%, black 48%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 24%, black 48%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-28"
            style={{ background: 'linear-gradient(to top, rgba(247,247,242,0.75), transparent)' }}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-6 pb-8 pt-10 lg:px-10 lg:pb-10 lg:pt-14">
          {/* Hero Typography & Trust Row */}
          <div className="max-w-xl">
            <h1 className="font-serif text-[40px] font-medium leading-[1.08] tracking-tight text-[#202922] sm:text-[52px]">
              Find Your <br />
              Dream Home at <br />
              <span className="italic text-[#244D3C]">
                {tenant?.projectName || 'GreenHaven Residences'}
              </span>
            </h1>

            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#5A665D]">
              Premium 2 &amp; 3 BHK apartments in {tenant?.location || 'Gachibowli, Hyderabad'}.
            </p>

            {/* Mobile Hero Image Fallback */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#E2E4DC] lg:hidden">
              <img
                src="/images/greenhaven-hero.jpg"
                alt="GreenHaven Residences exterior"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>

            {/* 3 Circular Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-full border border-[#D4DCD1] bg-white/95 text-[#244D3C] shadow-2xs">
                  <MapPin className="size-4.5" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-[#202922]">Prime Location</div>
                  <div className="text-xs text-[#657168]">Gachibowli</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-full border border-[#D4DCD1] bg-white/95 text-[#244D3C] shadow-2xs">
                  <Sparkles className="size-4.5" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-[#202922]">Modern Amenities</div>
                  <div className="text-xs text-[#657168]">≈25,000 sq ft Clubhouse (Planned Demo)</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-full border border-[#D4DCD1] bg-white/95 text-[#244D3C] shadow-2xs">
                  <ShieldCheck className="size-4.5" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-[#202922]">Demo Knowledge Base</div>
                  <div className="text-xs text-[#657168]">Pending Review · Synthetic Demo Data</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dock Group */}
          <div className="mt-10 lg:mt-auto lg:pt-10">
            {/* Floating Center-Bottom Assistant Dock */}
            <div className="mx-auto max-w-4xl rounded-2xl border border-[#E5E7DF] bg-white/95 px-6 py-6 shadow-[0_14px_38px_rgba(32,41,34,0.09)] backdrop-blur-xs sm:px-8 sm:py-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="grid size-16 shrink-0 place-items-center rounded-full bg-[#F1F3EC]">
                  <WaveformIcon size="lg" light={false} />
                </div>
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight text-[#202922]">
                    Talk to VaaniQ
                  </h2>
                  <div className="text-[15px] font-medium text-[#202922]">
                    Your AI Sales Assistant
                  </div>
                  <p className="mt-1 text-[13.5px] leading-snug text-[#657168]">
                    Get instant answers, project details, pricing and book a site visit.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                <button
                  type="button"
                  onClick={onStart}
                  disabled={starting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#244D3C] px-7 py-3.5 text-[15px] font-medium text-white shadow-xs transition-colors hover:bg-[#193B30] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{starting ? 'Starting…' : 'Start Conversation'}</span>
                  <ArrowRight className="size-4.5" />
                </button>

                {/* Clean Language Row */}
                <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Language selection">
                  <Globe className="mr-1 size-4 text-[#657168]" />
                  {Object.entries(LANG_LABEL).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={lang === code}
                      onClick={() => onSelectLang(code)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                        lang === code
                          ? 'border border-[#BDD4C0] bg-[#DCE9DD] text-[#193B30]'
                          : 'text-[#657168] hover:text-[#202922]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-[#E7BDBD] bg-[#FAE8E8] px-4 py-2.5 text-sm text-[#A93B3B]">
                {error}
              </div>
            )}
          </div>

          {/* Subtle Mic & Demo Footnote below Dock */}
          <div className="mx-auto mt-3.5 flex max-w-4xl flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#5A665D]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F2]/90 px-3 py-1 backdrop-blur-xs">
              {sttSupported ? (
                <Mic className="size-3.5 text-[#244D3C]" />
              ) : (
                <MicOff className="size-3.5 text-[#9A6216]" />
              )}
              {sttSupported
                ? permission === 'denied'
                  ? 'Microphone access is blocked in browser settings — text chat is always available.'
                  : 'Allow microphone permission when prompted to speak, or type anytime. No audio is recorded.'
                : 'Text chat ready (microphone voice works best in Chrome or Edge).'}
            </span>
            <span className="rounded-full bg-[#F7F7F2]/90 px-3 py-1 font-mono text-[11px] backdrop-blur-xs">
              {units.map((u) => `${u.type}: ₹${u.priceLakh[0]}–${u.priceLakh[1]}L`).join(' · ')}
            </span>
          </div>
          </div>

          {/* Verified Brochure Details Drawer when top nav item clicked */}
          {activeTopic && (
            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-[#E2E4DC] bg-white p-6 shadow-[0_4px_16px_rgba(32,41,34,0.05)]">
              <div className="flex items-center justify-between border-b border-[#E2E4DC] pb-3.5">
                <div>
                  <h3 className="font-serif text-xl font-medium capitalize text-[#202922]">
                    {activeTopic} · Demo Project Information
                  </h3>
                  <p className="text-xs text-[#657168]">
                    Retrieved from ABC Developers’ demo knowledge base (pending review).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTopic(null)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#657168] hover:bg-[#F7F7F2] hover:text-[#202922]"
                  aria-label="Close details"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              {activeTopic === 'projects' && units.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {units.map((u, idx) => (
                    <div
                      key={u.type}
                      className="flex items-center gap-4 rounded-xl border border-[#E2E4DC] bg-[#F7F7F2] p-3.5"
                    >
                      <img
                        src={idx === 0 ? '/images/greenhaven-hero.jpg' : '/images/greenhaven-amenities.jpg'}
                        alt={u.type}
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#202922]">{u.type} Residences</div>
                        <div className="text-xs text-[#657168]">
                          {fmtArea(u)} · {u.bedrooms} Bedrooms
                        </div>
                        <div className="mt-1 font-mono text-sm font-semibold text-[#244D3C]">
                          ₹{u.priceLakh[0]}–{u.priceLakh[1]} Lakhs*
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#657168]">
                    *Indicative base price; additional charges and taxes extra. Areas are approximate built-up areas.
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {filteredHighlights.map((h, i) => (
                  <div key={i} className="rounded-xl border border-[#E2E4DC] bg-[#F7F7F2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">
                      {h.section}
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#202922]">{h.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
