import { useEffect, useRef } from 'react';
import { Headset, User, FileText, Loader2, Volume2, Square } from 'lucide-react';
import { Badge, SENTIMENT_TONE, cx } from '../ui';

export default function ChatTranscript({
  messages,
  sending,
  interim,
  onReplay,
  onStopSpeaking,
  speakingId,
  canReplay,
}) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, interim]);

  return (
    <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto bg-canvas/55 p-6" aria-live="polite">
      {messages.map((m) => {
        const isCustomer = m.role === 'customer';
        const isSpeaking = speakingId === m.id;
        return (
          <div key={m.id} className={cx('vq-fade-in flex gap-3.5', isCustomer && 'flex-row-reverse')}>
            <div
              className={cx(
                'grid size-9 shrink-0 place-items-center rounded-lg border',
                isCustomer
                  ? 'border-rail-border bg-rail text-rail-ink dark:border-brand-soft-border dark:bg-brand-soft dark:text-brand-deep'
                  : 'border-line bg-surface text-brand',
              )}
              title={isCustomer ? 'Customer' : 'VaaniQ AI Sales Agent'}
            >
              {isCustomer ? <User className="size-4.5" /> : <Headset className="size-4.5" />}
            </div>

            <div className={cx('max-w-[84%] sm:max-w-[78%]', isCustomer && 'text-right')}>
              <div
                className={cx(
                  'mb-1.5 flex items-center gap-2 text-xs font-medium text-ink-muted',
                  isCustomer && 'justify-end',
                )}
              >
                <span>{isCustomer ? 'Customer' : 'VaaniQ Sales Agent'}</span>
              </div>

              <div
                className={cx(
                  'inline-block whitespace-pre-wrap rounded-xl px-4.5 py-3.5 text-left text-[15px] leading-relaxed',
                  isCustomer
                    ? 'bg-rail text-rail-ink shadow-[var(--shadow-card)] dark:bg-brand dark:text-white'
                    : 'border border-line bg-surface text-ink shadow-[var(--shadow-card)]',
                  m.failed && 'border-danger-border bg-danger text-white',
                  isSpeaking && 'ring-2 ring-brand/45',
                )}
              >
                {m.content}
              </div>

              <div className={cx('mt-2 flex flex-wrap items-center gap-2', isCustomer && 'justify-end')}>
                {!isCustomer && onReplay && (
                  isSpeaking ? (
                    <button
                      type="button"
                      onClick={onStopSpeaking}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-success-border bg-success-soft px-2.5 py-1 text-xs font-medium text-success"
                      aria-label="Stop speaking"
                    >
                      <Square className="size-3 fill-current" />
                      Stop audio
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReplay(m)}
                      disabled={!canReplay}
                      title={canReplay ? 'Replay this reply' : 'No voice available for this language'}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Replay reply"
                    >
                      <Volume2 className="size-3.5" />
                      Replay
                    </button>
                  )
                )}

                {m.sentiment && (
                  <Badge
                    tone={SENTIMENT_TONE[m.sentiment.label]}
                    title={`From transcript text. Evidence: ${m.sentiment.evidence?.map((e) => e.phrase).join(', ') || 'no sentiment cues'}`}
                  >
                    {m.sentiment.label} · <span className="font-mono">{Math.round(m.sentiment.confidence * 100)}%</span>
                  </Badge>
                )}

                {m.sources?.map((s) => (
                  <Badge key={`${s.documentId}${s.section}`} tone="sky" title={`relevance ${s.relevance}`}>
                    <FileText className="size-3.5" />
                    {s.title.replace(/^[^-]+ - /, '')} › {s.section}
                  </Badge>
                ))}

                {m.failed && <span className="text-xs font-medium text-danger">Not delivered: {m.failed}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {interim && (
        <div className="flex justify-end">
          <div className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-2.5 text-[15px] italic text-ink-2">
            “{interim}”…
          </div>
        </div>
      )}

      {sending && (
        <div className="flex w-fit items-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] text-ink-2 shadow-[var(--shadow-card)]">
          <Loader2 className="size-4 animate-spin text-brand" />
          <span>VaaniQ is analysing intent, retrieving verified facts, and updating CRM…</span>
        </div>
      )}

      <div ref={end} />
    </div>
  );
}
