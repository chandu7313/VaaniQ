import { Globe, ChevronDown, X } from 'lucide-react';
import { LANG_LABEL } from '../../lib/format';

export function DeveloperMark({ className = 'size-7' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="10" width="7" height="18" rx="1.5" fill="#244D3C" />
      <rect x="13" y="4" width="8" height="24" rx="1.5" fill="#193B30" />
      <rect x="23" y="13" width="5" height="15" rx="1.5" fill="#82966B" />
      <rect x="15.5" y="8" width="3" height="2.5" rx="0.5" fill="#DCE9DD" />
      <rect x="15.5" y="13" width="3" height="2.5" rx="0.5" fill="#DCE9DD" />
      <rect x="15.5" y="18" width="3" height="2.5" rx="0.5" fill="#DCE9DD" />
    </svg>
  );
}

export function WaveformIcon({ size = 'md', light = true }) {
  const dim = size === 'lg' ? 'size-11' : size === 'sm' ? 'size-5' : 'size-9';
  const bar = light ? 'bg-white' : 'bg-[#244D3C]';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${
        light ? 'bg-[#244D3C]' : 'bg-[#DCE9DD]'
      } ${dim}`}
      aria-hidden="true"
    >
      <span className="flex items-center gap-[2.5px]">
        <span className={`h-2 w-[2px] rounded-full ${bar} opacity-80`} />
        <span className={`h-3.5 w-[2px] rounded-full ${bar}`} />
        <span className={`h-4.5 w-[2px] rounded-full ${bar}`} />
        <span className={`h-3 w-[2px] rounded-full ${bar}`} />
        <span className={`h-2 w-[2px] rounded-full ${bar} opacity-80`} />
      </span>
    </span>
  );
}

export function ConversationHeader({ companyName, lang, onChangeLang, onEnd, ending, ended }) {
  return (
    <header className="border-b border-[#E2E4DC] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2">
            <DeveloperMark className="size-7" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[#202922]">
                {companyName?.split(' ')[0] || 'ABC'}
              </div>
              <div className="text-[11px] font-medium text-[#657168]">
                {companyName?.split(' ').slice(1).join(' ') || 'Developers'}
              </div>
            </div>
          </div>

          <span className="h-6 w-px bg-[#E2E4DC]" />

          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">
              <span className="text-[#012A59]">Vaani</span>
              <span className="text-[#F16704]">Q</span>
            </div>
            <div className="text-[11px] font-medium text-[#657168]">AI Sales Assistant</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <Globe className="pointer-events-none absolute left-2.5 size-3.5 text-[#657168]" />
            <select
              value={lang}
              onChange={(e) => onChangeLang(e.target.value)}
              aria-label="Conversation language"
              className="cursor-pointer appearance-none rounded-full border border-[#E2E4DC] bg-[#F7F7F2] py-1.5 pl-8 pr-7 text-[13px] font-medium text-[#202922] transition-colors hover:border-[#CFD3C7] focus:border-[#244D3C] focus:outline-none"
            >
              {Object.entries(LANG_LABEL).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-[#657168]" />
          </div>

          {!ended && onEnd && (
            <button
              type="button"
              onClick={onEnd}
              disabled={ending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7BDBD] bg-[#FAE8E8]/70 px-3.5 py-1.5 text-[13px] font-medium text-[#A93B3B] transition-colors hover:bg-[#FAE8E8] disabled:opacity-50"
            >
              <X className="size-3.5" />
              <span>{ending ? 'Ending…' : 'End chat'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
