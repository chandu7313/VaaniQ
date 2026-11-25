import { Badge, SCORE_TONE } from './ui';

const MISSING_LABEL = {
  budget: 'Budget',
  bedrooms: 'Configuration (BHK)',
  location: 'Preferred location',
  purpose: 'Purpose (self-use / investment)',
  preferences: 'Specific preferences',
  timeline: 'Purchase timeline',
  decisionMaker: 'Decision-maker',
  visit: 'Site-visit request',
};

/** Explainable lead score: total, factor bars with the reason for each award, and missing information. */
export default function ScoreBreakdown({ score, compact = false }) {
  if (!score?.factors) return <p className="text-sm text-ink-muted">No qualification data yet.</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3.5">
        <div className="flex items-baseline gap-3">
          <div className="font-mono text-4xl font-semibold tracking-tight text-ink tabular-nums">
            {score.total}
            <span className="text-base font-normal text-ink-muted">/100</span>
          </div>
          <Badge tone={SCORE_TONE[score.classification]} className="uppercase tracking-wide">
            {score.classification}
          </Badge>
        </div>
      </div>

      <ul className="mt-4 space-y-3.5">
        {score.factors.map((f) => (
          <li key={f.key}>
            <div className="flex justify-between text-[13px]">
              <span className="font-medium text-ink">{f.label}</span>
              <span className="font-mono tabular-nums text-ink-2">
                {f.points}/{f.max}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-section">
              <div
                className="h-2 rounded-full bg-brand transition-all duration-300"
                style={{ width: `${(f.points / f.max) * 100}%` }}
              />
            </div>
            {!compact && (
              <div
                className="mt-1 text-xs leading-snug text-ink-muted"
                title={f.evidence?.map((e) => `${e.field}=${JSON.stringify(e.value)} (${e.source})`).join('\n')}
              >
                {f.reason}
              </div>
            )}
          </li>
        ))}
      </ul>

      {score.recommendedNextAction && (
        <div className="mt-4 rounded-lg border border-brand-soft-border bg-brand-soft/60 px-3.5 py-3 text-[13px] leading-relaxed text-brand-deep">
          <span className="font-semibold">Recommended next action:</span> {score.recommendedNextAction.text}
        </div>
      )}

      {score.missing?.length > 0 && (
        <div className="mt-4">
          <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Missing information
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {score.missing.map((m) => (
              <Badge key={m}>{MISSING_LABEL[m] || m}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
