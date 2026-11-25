import {
  CheckCircle2,
  XCircle,
  Compass,
  Search,
  FileCheck2,
  Wrench,
  Gauge,
  MessageSquareReply,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import { Badge, SENTIMENT_TONE, cx } from './ui';
import { humanize } from '../lib/format';

const Section = ({ icon: Icon, title, children, tone = 'text-brand' }) => (
  <div className="relative border-l border-line-strong pb-6 pl-7 last:pb-0">
    <div className="absolute -left-3.5 top-0 grid size-7 place-items-center rounded-full border border-line-strong bg-surface shadow-[var(--shadow-card)]">
      <Icon className={cx('size-4', tone)} />
    </div>
    <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-2">
      {title}
    </div>
    {children}
  </div>
);

const KV = ({ k, v }) => (
  <div className="flex gap-3 py-1 text-[13px]">
    <span className="w-32 shrink-0 text-ink-muted">{k}</span>
    <span className="min-w-0 break-words text-ink">{v}</span>
  </div>
);

const Json = ({ value }) => (
  <pre className="scrollbar-thin mt-2 max-h-56 overflow-auto rounded-lg border border-rail-border bg-code-bg p-3.5 font-mono text-xs leading-relaxed text-code-ink">
    {JSON.stringify(value, null, 2)}
  </pre>
);

/**
 * Agent Decision Trace: auditable evidence for one turn (no hidden model reasoning):
 * analysis -> retrieval -> proposal -> validated tool executions -> scoring -> response/outcome.
 */
export default function TraceView({ trace }) {
  if (!trace) return null;
  const a = trace.analysis || {};

  return (
    <div className="pl-3.5">
      {(trace.explanation || trace.events?.length > 0) && (
        <Section icon={ListChecks} title="Summary & execution events" tone="text-info">
          {trace.explanation && (
            <p className="mb-3 rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm leading-relaxed text-ink">
              {trace.explanation}
            </p>
          )}
          {trace.suggestedAction && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-ink-muted">Suggested action</span>
              <Badge tone={trace.suggestedAction.executed ? 'green' : 'amber'}>
                {humanize(trace.suggestedAction.type)}
              </Badge>
              {trace.suggestedAction.requiresConfirmation && !trace.suggestedAction.executed && (
                <Badge tone="amber">needs customer consent</Badge>
              )}
              <span className="text-ink-2">{trace.suggestedAction.reason}</span>
            </div>
          )}
          {trace.events?.length > 0 && (
            <ol className="space-y-1.5 rounded-lg border border-rail-border bg-code-bg p-3.5 font-mono text-xs text-code-ink">
              {trace.events.map((ev, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-14 shrink-0 text-right tabular-nums text-rail-muted">+{ev.ms}ms</span>
                  <span className="w-28 shrink-0 font-semibold text-[#89D0A5]">{ev.step}</span>
                  <span className="text-code-ink">{ev.summary}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      )}

      <Section icon={Compass} title="1 · Intent & entities">
        <div className="space-y-1">
          <KV k="Customer said" v={<span className="italic text-ink">“{trace.input}”</span>} />
          <KV
            k="Analysis source"
            v={<Badge tone={a.source === 'rules' ? 'dark' : 'brand'}>{a.source}</Badge>}
          />
          <KV
            k="Detected intent"
            v={
              <span className="inline-flex flex-wrap gap-1.5">
                <Badge tone="brand">{humanize(a.intent)}</Badge>
                {a.secondaryIntents?.map((i) => (
                  <Badge key={i}>{humanize(i)}</Badge>
                ))}
              </span>
            }
          />
          <KV
            k="Sentiment"
            v={
              a.sentiment && (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <Badge tone={SENTIMENT_TONE[a.sentiment.label]}>{a.sentiment.label}</Badge>
                  <span className="font-mono text-xs text-ink-muted">
                    conf {a.sentiment.confidence} · {a.sentiment.method}
                  </span>
                  {a.sentiment.evidence?.length > 0 && (
                    <span className="text-ink-2">
                      ({a.sentiment.evidence.map((e) => `“${e.phrase}”`).join(', ')})
                    </span>
                  )}
                </span>
              )
            }
          />
        </div>
        {a.entities && Object.keys(a.entities).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(a.entities).map(([k, v]) => (
              <Badge key={k} tone="sky" title={`source: ${a.entitySources?.[k] || 'rules'}`}>
                <span className="font-mono">{k}:</span> {Array.isArray(v) ? v.join(', ') : String(v)}
              </Badge>
            ))}
          </div>
        )}
      </Section>

      {trace.retrieval && (
        <Section icon={Search} title="2 · Knowledge retrieval (BM25)">
          <KV k="Answer method" v={humanize(trace.retrieval.answerMethod)} />
          {trace.retrieval.hits.length === 0 ? (
            <p className="mt-2 rounded-lg border border-warning-border bg-warning-soft px-3 py-2 text-[13px] text-warning">
              No document passed the relevance threshold, so the agent did not answer from guesswork.
            </p>
          ) : (
            <div className="mt-2.5 overflow-hidden rounded-lg border border-line">
              <table className="w-full text-[13px]">
                <thead className="border-b border-line bg-surface-2 text-xs text-ink-2">
                  <tr>
                    <th className="px-3.5 py-2 text-left font-medium">Document › section</th>
                    <th className="px-3.5 py-2 text-right font-medium">BM25</th>
                    <th className="w-36 px-3.5 py-2 text-right font-medium">Relevance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {trace.retrieval.hits.map((h) => (
                    <tr key={`${h.title}${h.section}`}>
                      <td className="px-3.5 py-2.5 text-ink">
                        {h.title} <span className="text-ink-muted">› {h.section}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-ink-2">{h.score}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="ml-auto flex w-32 items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-section">
                            <div
                              className="h-2 rounded-full bg-success"
                              style={{ width: `${h.relevance * 100}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-ink-2">{h.relevance.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {trace.proposal && (
        <Section icon={FileCheck2} title="3 · Structured action proposal" tone="text-warning">
          <div className="space-y-1 rounded-lg border border-warning-border bg-warning-soft/50 p-3.5">
            <KV k="Tool" v={<code className="font-mono font-medium text-ink">{trace.proposal.tool}</code>} />
            <KV k="Arguments" v={<code className="font-mono text-xs">{JSON.stringify(trace.proposal.args)}</code>} />
            <KV
              k="Needs consent"
              v={
                trace.proposal.requiresConfirmation
                  ? 'Yes: executed only after explicit customer “yes”'
                  : 'No'
              }
            />
            {trace.proposal.status && (
              <KV
                k="Status"
                v={
                  <Badge
                    tone={
                      trace.proposal.status.includes('confirmed')
                        ? 'green'
                        : trace.proposal.status.includes('declined')
                          ? 'red'
                          : 'amber'
                    }
                  >
                    {humanize(trace.proposal.status)}
                  </Badge>
                }
              />
            )}
          </div>
        </Section>
      )}

      <Section icon={Wrench} title={`4 · Validated tool executions (${trace.steps?.length || 0})`}>
        {!trace.steps?.length ? (
          <p className="text-[13px] text-ink-muted">No tools were needed for this turn.</p>
        ) : (
          <div className="space-y-3">
            {trace.steps.map((s, i) => (
              <div
                key={i}
                className={cx(
                  'rounded-lg border p-3.5',
                  s.ok ? 'border-line bg-canvas' : 'border-danger-border bg-danger-soft/60',
                )}
              >
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  {s.ok ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-danger" />
                  )}
                  <code className="font-mono font-semibold text-ink">{s.tool}</code>
                  {s.sideEffect && (
                    <Badge tone={s.sideEffect === 'write' ? 'amber' : 'slate'}>{s.sideEffect}</Badge>
                  )}
                  <span className="ml-auto font-mono text-xs text-ink-muted">{s.durationMs} ms</span>
                </div>
                <div className="mt-1.5 text-[13px] text-ink-2">{s.reason}</div>
                {s.validation?.checks?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {s.validation.checks.map((c) => (
                      <Badge key={c} tone="green">
                        ✓ {c}
                      </Badge>
                    ))}
                  </div>
                )}
                {s.error && (
                  <div className="mt-2 text-[13px] font-medium text-danger">
                    {s.error.code}: {s.error.message}
                  </div>
                )}
                <details className="mt-2.5">
                  <summary className="cursor-pointer text-xs font-medium text-ink-2 hover:text-brand">
                    Arguments &amp; result JSON
                  </summary>
                  <Json value={{ args: s.args, result: s.result }} />
                </details>
              </div>
            ))}
          </div>
        )}
      </Section>

      {trace.scoring && (
        <Section icon={Gauge} title="5 · Lead score update">
          <div className="flex items-center gap-2 text-sm text-ink-2">
            <span className="font-mono">{trace.scoring.previous}</span>
            <span>→</span>
            <span className="font-mono text-lg font-semibold text-ink">{trace.scoring.total}</span>
            <Badge tone="brand">{trace.scoring.classification}</Badge>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {trace.scoring.factors.map((f) => (
              <Badge key={f.key} title={f.reason}>
                {f.label}: <span className="font-mono">{f.points}/{f.max}</span>
              </Badge>
            ))}
          </div>
        </Section>
      )}

      <Section icon={MessageSquareReply} title="6 · Response & business outcome" tone="text-success">
        <KV k="Outcome" v={<Badge tone="green">{humanize(trace.response?.outcome)}</Badge>} />
        <p className="mt-2.5 rounded-lg border border-line bg-surface-2/80 p-3.5 text-[15px] leading-relaxed text-ink">
          {trace.response?.text}
        </p>
        {trace.response?.sources?.length > 0 && (
          <div className="mt-2 text-xs text-ink-2">
            Sources: {trace.response.sources.map((s) => `${s.title} › ${s.section}`).join(' · ')}
          </div>
        )}
        <div className="mt-2 font-mono text-xs text-ink-muted">
          Provider {trace.provider}
          {trace.demoMode && ' (DEMO_MODE)'} · {trace.latencyMs} ms · language {trace.language}
        </div>
      </Section>

      {trace.errors?.length > 0 && (
        <Section icon={AlertTriangle} title="Errors & fallbacks" tone="text-danger">
          {trace.errors.map((e, i) => (
            <div key={i} className="text-[13px] text-danger">
              {e.stage}: {e.message} → {e.fallback}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
