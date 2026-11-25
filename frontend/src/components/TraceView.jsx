import { CheckCircle2, XCircle, Brain, Search, FileCheck2, Wrench, Gauge, MessageSquareReply, AlertTriangle, ListChecks } from 'lucide-react';
import { Badge, SENTIMENT_TONE, cx } from './ui';
import { humanize } from '../lib/format';

const Section = ({ icon: Icon, title, children, tone = 'text-indigo-300' }) => (
  <div className="relative border-l border-line pb-5 pl-6 last:pb-0">
    <div className="absolute -left-3 top-0 grid size-6 place-items-center rounded-full border border-line bg-panel-2"><Icon className={cx('size-3.5', tone)} /></div>
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
    {children}
  </div>
);
const KV = ({ k, v }) => <div className="flex gap-2 text-xs"><span className="w-28 shrink-0 text-slate-500">{k}</span><span className="break-words text-slate-200">{v}</span></div>;
const Json = ({ value }) => <pre className="scrollbar-thin mt-1 max-h-40 overflow-auto rounded-md bg-surface p-2 text-[11px] leading-relaxed text-slate-300">{JSON.stringify(value, null, 2)}</pre>;

/**
 * Agent Decision Trace: auditable evidence for one turn (no hidden model reasoning):
 * analysis -> retrieval -> proposal -> validated tool executions -> scoring -> response/outcome.
 */
export default function TraceView({ trace }) {
  if (!trace) return null;
  const a = trace.analysis || {};
  return (
    <div className="pl-3">
      {(trace.explanation || trace.events?.length > 0) && (
        <Section icon={ListChecks} title="Summary & execution events" tone="text-sky-300">
          {trace.explanation && <p className="mb-2 rounded-lg bg-surface p-2.5 text-xs leading-relaxed text-slate-200">{trace.explanation}</p>}
          {trace.suggestedAction && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500">Suggested action</span>
              <Badge tone={trace.suggestedAction.executed ? 'green' : 'amber'}>{humanize(trace.suggestedAction.type)}</Badge>
              {trace.suggestedAction.requiresConfirmation && !trace.suggestedAction.executed && <Badge tone="amber">needs customer consent</Badge>}
              <span className="text-slate-400">{trace.suggestedAction.reason}</span>
            </div>
          )}
          {trace.events?.length > 0 && (
            <ol className="space-y-0.5 font-mono text-[11px]">
              {trace.events.map((ev, i) => (
                <li key={i} className="flex gap-2"><span className="w-11 shrink-0 text-right tabular-nums text-slate-600">+{ev.ms}ms</span><span className="w-20 shrink-0 text-sky-300">{ev.step}</span><span className="text-slate-300">{ev.summary}</span></li>
              ))}
            </ol>
          )}
        </Section>
      )}
      <Section icon={Brain} title="1 · Intent & entities">
        <div className="space-y-1">
          <KV k="Customer said" v={<span className="italic text-slate-300">“{trace.input}”</span>} />
          <KV k="Analysis source" v={<Badge tone={a.source === 'rules' ? 'slate' : 'indigo'}>{a.source}</Badge>} />
          <KV k="Detected intent" v={<><Badge tone="indigo">{humanize(a.intent)}</Badge> {a.secondaryIntents?.map((i) => <Badge key={i} className="ml-1">{humanize(i)}</Badge>)}</>} />
          <KV k="Sentiment" v={a.sentiment && <><Badge tone={SENTIMENT_TONE[a.sentiment.label]}>{a.sentiment.label}</Badge> <span className="text-slate-500">confidence {a.sentiment.confidence} · {a.sentiment.method}</span>{a.sentiment.evidence?.length > 0 && <span className="ml-1 text-slate-400">evidence: {a.sentiment.evidence.map((e) => `“${e.phrase}”`).join(', ')}</span>}</>} />
        </div>
        {a.entities && Object.keys(a.entities).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(a.entities).map(([k, v]) => <Badge key={k} tone="sky" title={`source: ${a.entitySources?.[k] || 'rules'}`}>{k}: {Array.isArray(v) ? v.join(', ') : String(v)}</Badge>)}
          </div>
        )}
      </Section>

      {trace.retrieval && (
        <Section icon={Search} title="2 · Knowledge retrieval (BM25)">
          <KV k="Answer method" v={humanize(trace.retrieval.answerMethod)} />
          {trace.retrieval.hits.length === 0 ? <p className="mt-1 text-xs text-amber-300">No document passed the relevance threshold, so the agent did not answer from guesswork.</p> : (
            <table className="mt-2 w-full text-xs">
              <thead className="text-slate-500"><tr><th className="py-1 text-left font-medium">Document › section</th><th className="text-right font-medium">BM25</th><th className="w-32 text-right font-medium">Relevance</th></tr></thead>
              <tbody>{trace.retrieval.hits.map((h) => (
                <tr key={`${h.title}${h.section}`} className="border-t border-line/60">
                  <td className="py-1.5 text-slate-300">{h.title} <span className="text-slate-500">› {h.section}</span></td>
                  <td className="text-right tabular-nums text-slate-400">{h.score}</td>
                  <td><div className="ml-auto flex w-28 items-center gap-2"><div className="h-1.5 flex-1 rounded bg-slate-800"><div className="h-1.5 rounded bg-emerald-400" style={{ width: `${h.relevance * 100}%` }} /></div><span className="tabular-nums text-slate-400">{h.relevance.toFixed(2)}</span></div></td>
                </tr>))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {trace.proposal && (
        <Section icon={FileCheck2} title="3 · Structured action proposal" tone="text-amber-300">
          <div className="space-y-1">
            <KV k="Tool" v={<code className="text-amber-200">{trace.proposal.tool}</code>} />
            <KV k="Arguments" v={<code>{JSON.stringify(trace.proposal.args)}</code>} />
            <KV k="Needs consent" v={trace.proposal.requiresConfirmation ? 'Yes: executed only after explicit customer “yes”' : 'No'} />
            {trace.proposal.status && <KV k="Status" v={<Badge tone={trace.proposal.status.includes('confirmed') ? 'green' : trace.proposal.status.includes('declined') ? 'red' : 'amber'}>{humanize(trace.proposal.status)}</Badge>} />}
          </div>
        </Section>
      )}

      <Section icon={Wrench} title={`4 · Validated tool executions (${trace.steps?.length || 0})`}>
        {!trace.steps?.length ? <p className="text-xs text-slate-500">No tools were needed for this turn.</p> : (
          <div className="space-y-2">
            {trace.steps.map((s, i) => (
              <div key={i} className={cx('rounded-lg border p-3', s.ok ? 'border-line bg-panel-2' : 'border-rose-500/30 bg-rose-500/5')}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {s.ok ? <CheckCircle2 className="size-4 text-emerald-400" /> : <XCircle className="size-4 text-rose-400" />}
                  <code className="font-semibold text-slate-100">{s.tool}</code>
                  {s.sideEffect && <Badge tone={s.sideEffect === 'write' ? 'amber' : 'slate'}>{s.sideEffect}</Badge>}
                  <span className="text-slate-500">{s.durationMs} ms</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{s.reason}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">{s.validation?.checks?.map((c) => <Badge key={c} tone="green">✓ {c}</Badge>)}</div>
                {s.error && <div className="mt-1.5 text-xs text-rose-300">{s.error.code}: {s.error.message}</div>}
                <details className="mt-1.5"><summary className="cursor-pointer text-[11px] text-slate-500 hover:text-slate-300">Arguments & result</summary><Json value={{ args: s.args, result: s.result }} /></details>
              </div>
            ))}
          </div>
        )}
      </Section>

      {trace.scoring && (
        <Section icon={Gauge} title="5 · Lead score update">
          <div className="text-xs text-slate-300">{trace.scoring.previous} → <span className="text-base font-semibold text-slate-50">{trace.scoring.total}</span> <Badge className="ml-1">{trace.scoring.classification}</Badge></div>
          <div className="mt-1.5 flex flex-wrap gap-1">{trace.scoring.factors.map((f) => <Badge key={f.key} title={f.reason}>{f.label}: {f.points}/{f.max}</Badge>)}</div>
        </Section>
      )}

      <Section icon={MessageSquareReply} title="6 · Response & business outcome" tone="text-emerald-300">
        <KV k="Outcome" v={<Badge tone="green">{humanize(trace.response?.outcome)}</Badge>} />
        <p className="mt-2 rounded-lg bg-surface p-3 text-sm text-slate-200">{trace.response?.text}</p>
        {trace.response?.sources?.length > 0 && <div className="mt-2 text-[11px] text-slate-500">Sources: {trace.response.sources.map((s) => `${s.title} › ${s.section}`).join(' · ')}</div>}
        <div className="mt-2 text-[11px] text-slate-500">Provider {trace.provider}{trace.demoMode && ' (DEMO_MODE)'} · {trace.latencyMs} ms · language {trace.language}</div>
      </Section>

      {trace.errors?.length > 0 && (
        <Section icon={AlertTriangle} title="Errors & fallbacks" tone="text-rose-300">
          {trace.errors.map((e, i) => <div key={i} className="text-xs text-rose-200">{e.stage}: {e.message} → {e.fallback}</div>)}
        </Section>
      )}
    </div>
  );
}
