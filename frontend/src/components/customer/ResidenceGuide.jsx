import { useState } from 'react';
import { Search, FileText, Home, Sparkles } from 'lucide-react';
import { publicApi } from '../../lib/publicApi';

export default function ResidenceGuide({ slug, overview, requirements }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const units = overview?.tenant?.units || [];
  const highlights = overview?.highlights || [];

  const runSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await publicApi(slug, '/knowledge/search', {
        method: 'POST',
        body: { query: query.trim(), k: 4 },
      });
      setHits(res);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const hasRequirements =
    requirements &&
    (requirements.bedrooms || requirements.budgetLakh || requirements.location || requirements.timelineMonths);

  return (
    <div className="space-y-5">
      {/* Your Stated Preferences (Strictly Customer-Owned, Zero CRM Score/Status) */}
      {hasRequirements && (
        <div className="rounded-xl border border-[#DCE9DD] bg-[#EDEFE7] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">
            Your Residence Preferences
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {requirements.bedrooms && (
              <div>
                <dt className="text-xs text-[#657168]">Configuration</dt>
                <dd className="font-medium text-[#202922]">{requirements.bedrooms}BHK</dd>
              </div>
            )}
            {requirements.budgetLakh && (
              <div>
                <dt className="text-xs text-[#657168]">Budget</dt>
                <dd className="font-medium text-[#202922]">₹{requirements.budgetLakh} Lakh</dd>
              </div>
            )}
            {requirements.location && (
              <div>
                <dt className="text-xs text-[#657168]">Location</dt>
                <dd className="font-medium text-[#202922]">{requirements.location}</dd>
              </div>
            )}
            {requirements.timelineMonths && (
              <div>
                <dt className="text-xs text-[#657168]">Purchase timeline</dt>
                <dd className="font-medium text-[#202922]">
                  {requirements.timelineMonths} month{requirements.timelineMonths === 1 ? '' : 's'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Verified Configurations & Pricing */}
      <div className="rounded-xl border border-[#E2E4DC] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#202922]">
          <Home className="size-4 text-[#244D3C]" />
          <span>Verified Residences &amp; Pricing</span>
        </div>
        <div className="mt-3.5 space-y-2.5">
          {units.map((u) => (
            <div
              key={u.type}
              className="flex items-center justify-between rounded-lg border border-[#E2E4DC] bg-[#F7F7F2] px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold text-[#202922]">{u.type} Apartment</div>
                <div className="text-xs text-[#657168]">
                  {u.sizeSqft[0]}–{u.sizeSqft[1]} sq. ft.
                </div>
              </div>
              <div className="font-mono text-sm font-semibold text-[#244D3C]">
                ₹{u.priceLakh[0]}–{u.priceLakh[1]} L
              </div>
            </div>
          ))}
        </div>

        {/* Search Verified Knowledge Base */}
        <form onSubmit={runSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brochure (e.g. clubhouse, parking, RERA)…"
            className="flex-1 rounded-lg border border-[#CFD3C7] bg-[#F7F7F2] px-3 py-2 text-[13px] text-[#202922] placeholder:text-[#899188] focus:border-[#244D3C] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={searching || query.trim().length < 2}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#244D3C] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#193B30] disabled:opacity-45"
          >
            <Search className="size-3.5" />
            Find
          </button>
        </form>

        {searchError && <p className="mt-2 text-xs text-[#A93B3B]">{searchError}</p>}

        {hits ? (
          <div className="mt-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#657168]">
              <span>Verified results</span>
              <button
                type="button"
                onClick={() => setHits(null)}
                className="cursor-pointer font-medium text-[#244D3C] hover:underline"
              >
                Show highlights
              </button>
            </div>
            {hits.length === 0 ? (
              <p className="text-xs text-[#657168]">No verified details matched that search.</p>
            ) : (
              hits.map((h, i) => (
                <div key={i} className="rounded-lg border border-[#E2E4DC] bg-[#F7F7F2] p-3 text-[13px]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#244D3C]">
                    <FileText className="size-3.5" />
                    <span>
                      {h.title.replace(/^ABC (Heights|Developers) - /, '')} › {h.section}
                    </span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-[#202922]">{h.content}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          highlights.length > 0 && (
            <div className="mt-4 space-y-2.5 border-t border-[#E2E4DC] pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#657168]">
                <Sparkles className="size-3.5 text-[#244D3C]" />
                <span>Key Project Facts</span>
              </div>
              {highlights.slice(0, 4).map((h, i) => (
                <details key={i} className="rounded-lg border border-[#E2E4DC] bg-[#F7F7F2] px-3.5 py-2.5">
                  <summary className="cursor-pointer text-[13px] font-medium text-[#202922]">
                    {h.section}
                  </summary>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#657168]">{h.content}</p>
                  <div className="mt-1.5 text-[11px] text-[#899188]">
                    Source: {h.title.replace(/^ABC (Heights|Developers) - /, '')}
                  </div>
                </details>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
