import { Badge, SENTIMENT_TONE, SCORE_TONE } from './ui';
import { fmtDateTime } from '../lib/format';

const Row = ({ k, v }) =>
  v ? (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-[13px] last:border-0">
      <span className="text-ink-2">{k}</span>
      <span className="text-right font-medium text-ink">{v}</span>
    </div>
  ) : null;

/** Structured call summary produced by the backend summarisation service. */
export default function SummaryCard({ summary }) {
  const r = summary.requirements || {};
  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-line bg-canvas px-4.5 py-3.5 text-[15px] leading-relaxed text-ink">
        {summary.narrative}
      </p>

      <div className="flex flex-wrap gap-2">
        <Badge tone={summary.appointment ? 'green' : summary.outcome.includes('Escalated') ? 'red' : 'slate'}>
          {summary.outcome}
        </Badge>
        {summary.leadScore && (
          <Badge tone={SCORE_TONE[summary.leadScore.classification]}>
            Score {summary.leadScore.total} · {summary.leadScore.classification}
          </Badge>
        )}
        <Badge tone={SENTIMENT_TONE[summary.sentiment.overall]}>
          Sentiment {summary.sentiment.overall} ({summary.sentiment.trend})
        </Badge>
        {summary.buyingIntent && (
          <Badge
            tone={{ high: 'green', medium: 'amber', low: 'slate' }[summary.buyingIntent.level]}
            title={summary.buyingIntent.evidence.join(' · ')}
          >
            Buying intent {summary.buyingIntent.level}
          </Badge>
        )}
        {summary.appointmentOutcome === 'proposed_not_confirmed' && (
          <Badge tone="amber">Visit proposed, not confirmed</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Customer requirements
          </div>
          <div className="rounded-lg border border-line bg-surface px-4 py-1">
            <Row k="Configuration" v={r.configuration} />
            <Row k="Location" v={r.location} />
            <Row k="Budget" v={r.budget} />
            <Row k="Timeline" v={r.timeline} />
            <Row k="Decision-maker" v={r.decisionMaker} />
            <Row k="Purpose" v={r.purpose} />
            <Row k="Preferences" v={r.preferences?.join(', ')} />
            {summary.appointment && <Row k="Site visit" v={summary.appointment.label} />}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              Recommended next actions
            </div>
            <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-ink">
              {summary.recommendedNextActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          {summary.concerns?.length > 0 && (
            <div className="rounded-lg border border-warning-border bg-warning-soft px-3.5 py-3">
              <div className="mb-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-warning">
                Customer concerns
              </div>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-warning">
                {summary.concerns.map((c, i) => (
                  <li key={i}>{c.detail}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.buyingIntent?.evidence?.length > 0 && (
            <div className="text-[13px] text-ink-2">
              <span className="font-medium text-ink">Intent evidence:</span> {summary.buyingIntent.evidence.join(' · ')}
            </div>
          )}
          {summary.topicsDiscussed?.length > 0 && (
            <div className="text-[13px] text-ink-2">
              <span className="font-medium text-ink">Topics:</span> {summary.topicsDiscussed.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line pt-3 font-mono text-xs text-ink-muted">
        Generated {fmtDateTime(summary.generatedAt)} · narrative: {summary.narrativeMethod}
      </div>
    </div>
  );
}
