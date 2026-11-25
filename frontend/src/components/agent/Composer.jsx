import { useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button, cx, inputCls } from '../ui';

const YES = { en: 'Yes, please confirm', hi: 'हाँ, कन्फर्म कीजिए', te: 'అవును, నిర్ధారించండి' };
const NO = { en: 'No, a different time', hi: 'नहीं, कोई और समय', te: 'వద్దు, వేరే సమయం' };
const ORDINALS = {
  en: ['the first one', 'the second one', 'the third one'],
  hi: ['पहला वाला', 'दूसरा वाला', 'तीसरा वाला'],
  te: ['మొదటిది', 'రెండవది', 'మూడవది'],
};

/** Customer input: microphone (when supported), text fallback, and quick replies for consent and slot choice. */
export default function Composer({
  lang,
  disabled,
  onSend,
  speech,
  tts,
  ttsEnabled,
  setTtsEnabled,
  pending,
  offeredSlots,
}) {
  const [text, setText] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="border-t border-line bg-surface p-4.5">
      {pending && (
        <div className="mb-3.5 flex flex-wrap items-center gap-3 rounded-lg border border-warning-border bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <div className="min-w-0 flex-1">
            <span className="font-semibold">Awaiting customer confirmation:</span> site visit{' '}
            <span className="font-semibold text-ink">{pending.label}</span>. Nothing is booked until the customer confirms.
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSend(YES[lang])} disabled={disabled}>
              {YES[lang]}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onSend(NO[lang])} disabled={disabled}>
              {NO[lang]}
            </Button>
          </div>
        </div>
      )}

      {!pending && offeredSlots?.length > 0 && (
        <div className="mb-3.5 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-medium text-ink-2">Quick slot selection:</span>
          {offeredSlots.map((s, i) => (
            <Button
              key={s.startsAt}
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => onSend(ORDINALS[lang][i])}
            >
              <span className="font-mono text-ink-muted">{i + 1}.</span> {s.label}
            </Button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2.5">
        {speech.supported ? (
          <button
            type="button"
            disabled={disabled}
            onClick={
              speech.listening
                ? speech.stop
                : () => {
                    tts.cancel();
                    speech.start();
                  }
            }
            aria-label={speech.listening ? 'Stop listening' : 'Start speaking'}
            title={speech.listening ? 'Stop microphone' : 'Speak with microphone'}
            className={cx(
              'grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              speech.listening
                ? 'listening border-danger bg-danger text-white'
                : 'border-rail-border bg-rail text-rail-ink hover:bg-brand-deep dark:border-brand dark:bg-brand dark:text-white',
            )}
          >
            {speech.listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
        ) : null}

        <input
          className={inputCls}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={
            speech.listening
              ? 'Listening to microphone…'
              : speech.supported
                ? 'Speak with the microphone, or type a customer message…'
                : 'Voice input unavailable in this browser: type the customer message…'
          }
          maxLength={1000}
        />

        <Button type="submit" disabled={disabled || !text.trim()} aria-label="Send">
          <Send className="size-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>

        {tts.supported && (
          <Button
            variant="secondary"
            onClick={() => {
              if (ttsEnabled) tts.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            aria-label={ttsEnabled ? 'Mute voice replies' : 'Enable voice replies'}
            title={ttsEnabled ? 'Voice replies on' : 'Voice replies off'}
          >
            {ttsEnabled ? <Volume2 className="size-4.5 text-brand" /> : <VolumeX className="size-4.5 text-ink-muted" />}
          </Button>
        )}
      </form>

      {speech.error && (
        <div role="alert" className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-danger">
          <span>{speech.error.message}</span>
          {speech.error.retryable && (
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                tts.cancel();
                speech.retry();
              }}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          )}
          <button
            type="button"
            className="cursor-pointer text-ink-2 underline hover:text-ink"
            onClick={speech.clearError}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
