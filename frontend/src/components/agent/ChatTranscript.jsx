import { useEffect, useRef } from 'react';
import { Bot, User, FileText, Loader2, Volume2, Square } from 'lucide-react';
import { Badge, SENTIMENT_TONE, cx } from '../ui';

export default function ChatTranscript({ messages, sending, interim, onReplay, onStopSpeaking, speakingId, canReplay }) {
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, sending, interim]);
  return (
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
      {messages.map((m) => (
        <div key={m.id} className={cx('vq-fade-in flex gap-3', m.role === 'customer' && 'flex-row-reverse')}>
          <div className={cx('grid size-8 shrink-0 place-items-center rounded-full', m.role === 'agent' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-300')}>
            {m.role === 'agent' ? <Bot className="size-4" /> : <User className="size-4" />}
          </div>
          <div className={cx('max-w-[80%]', m.role === 'customer' && 'text-right')}>
            <div className={cx('inline-block whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed', m.role === 'agent' ? 'rounded-tl-sm bg-panel-2 text-slate-100' : 'rounded-tr-sm bg-indigo-500 text-white', m.failed && 'bg-rose-600', speakingId === m.id && 'ring-1 ring-emerald-400/60')}>{m.content}</div>
            <div className={cx('mt-1 flex flex-wrap items-center gap-1.5', m.role === 'customer' && 'justify-end')}>
              {m.role === 'agent' && onReplay && (
                speakingId === m.id
                  ? <button type="button" onClick={onStopSpeaking} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-emerald-300 hover:bg-slate-800" aria-label="Stop speaking"><Square className="size-3" />Stop</button>
                  : <button type="button" onClick={() => onReplay(m)} disabled={!canReplay} title={canReplay ? 'Replay this reply' : 'No voice available for this language'} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Replay reply"><Volume2 className="size-3" />Replay</button>
              )}
              {m.sentiment && <Badge tone={SENTIMENT_TONE[m.sentiment.label]} title={`From transcript text. Evidence: ${m.sentiment.evidence?.map((e) => e.phrase).join(', ') || 'no sentiment cues'}`}>{m.sentiment.label} · {Math.round(m.sentiment.confidence * 100)}%</Badge>}
              {m.sources?.map((s) => <Badge key={`${s.documentId}${s.section}`} tone="sky" title={`relevance ${s.relevance}`}><FileText className="size-3" />{s.title.replace(/^ABC (Heights|Developers) - /, '')} › {s.section}</Badge>)}
              {m.failed && <span className="text-[11px] text-rose-300">Not delivered: {m.failed}</span>}
            </div>
          </div>
        </div>
      ))}
      {interim && <div className="text-right text-sm italic text-slate-400">“{interim}”…</div>}
      {sending && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="size-3.5 animate-spin" />VaaniQ is analysing, retrieving and acting…</div>}
      <div ref={end} />
    </div>
  );
}
