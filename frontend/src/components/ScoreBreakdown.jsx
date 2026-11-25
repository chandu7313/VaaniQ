import { Badge, SCORE_TONE } from './ui';

const MISSING_LABEL = { budget: 'Budget', bedrooms: 'Configuration (BHK)', location: 'Preferred location', purpose: 'Purpose (self-use / investment)', preferences: 'Specific preferences', timeline: 'Purchase timeline', decisionMaker: 'Decision-maker', visit: 'Site-visit request' };

/** Explainable lead score: total, factor bars with the reason for each award, and missing information. */
export default function ScoreBreakdown({ score, compact = false }) {
  if (!score?.factors) return <p className="text-sm text-slate-500">No qualification data yet.</p>;
  return (
    <div>
      <div className="flex items-end gap-3">
        <div className="text-4xl font-semibold tracking-tight text-slate-50">{score.total}<span className="text-base text-slate-500">/100</span></div>
        <Badge tone={SCORE_TONE[score.classification]} className="mb-1.5 uppercase">{score.classification}</Badge>
      </div>
      <ul className="mt-4 space-y-3">
        {score.factors.map((f) => (
          <li key={f.key}>
            <div className="flex justify-between text-xs"><span className="font-medium text-slate-300">{f.label}</span><span className="tabular-nums text-slate-400">{f.points}/{f.max}</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
            {!compact && <div className="mt-1 text-[11px] text-slate-500" title={f.evidence?.map((e) => `${e.field}=${JSON.stringify(e.value)} (${e.source})`).join('\n')}>{f.reason}</div>}
          </li>
        ))}
      </ul>
      {score.recommendedNextAction && (
        <div className="mt-4 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-100"><span className="font-medium">Recommended next action:</span> {score.recommendedNextAction.text}</div>
      )}
      {score.missing?.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Missing information</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{score.missing.map((m) => <Badge key={m}>{MISSING_LABEL[m] || m}</Badge>)}</div>
        </div>
      )}
    </div>
  );
}
