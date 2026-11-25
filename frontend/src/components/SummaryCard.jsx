import { Badge, SENTIMENT_TONE, SCORE_TONE } from './ui';
import { fmtDateTime } from '../lib/format';

const Row = ({ k, v }) => (v ? <div className="flex justify-between gap-4 border-b border-line/60 py-1.5 text-xs last:border-0"><span className="text-slate-500">{k}</span><span className="text-right text-slate-200">{v}</span></div> : null);

/** Structured call summary produced by the backend summarisation service. */
export default function SummaryCard({ summary }) {
  const r = summary.requirements || {};
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-200">{summary.narrative}</p>
      <div className="flex flex-wrap gap-2">
        <Badge tone={summary.appointment ? 'green' : summary.outcome.includes('Escalated') ? 'red' : 'slate'}>{summary.outcome}</Badge>
        {summary.leadScore && <Badge tone={SCORE_TONE[summary.leadScore.classification]}>Score {summary.leadScore.total} · {summary.leadScore.classification}</Badge>}
        <Badge tone={SENTIMENT_TONE[summary.sentiment.overall]}>Sentiment {summary.sentiment.overall} ({summary.sentiment.trend})</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Customer requirements</div>
          <Row k="Configuration" v={r.configuration} /><Row k="Location" v={r.location} /><Row k="Budget" v={r.budget} />
          <Row k="Timeline" v={r.timeline} /><Row k="Decision-maker" v={r.decisionMaker} /><Row k="Purpose" v={r.purpose} />
          <Row k="Preferences" v={r.preferences?.join(', ')} />
          {summary.appointment && <Row k="Site visit" v={summary.appointment.label} />}
        </div>
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Recommended next actions</div>
          <ul className="list-disc space-y-1 pl-4 text-xs text-slate-200">{summary.recommendedNextActions.map((a) => <li key={a}>{a}</li>)}</ul>
          {summary.topicsDiscussed?.length > 0 && <div className="mt-3 text-[11px] text-slate-500">Topics: {summary.topicsDiscussed.join(', ')}</div>}
        </div>
      </div>
      <div className="text-[11px] text-slate-500">Generated {fmtDateTime(summary.generatedAt)} · narrative: {summary.narrativeMethod}</div>
    </div>
  );
}
