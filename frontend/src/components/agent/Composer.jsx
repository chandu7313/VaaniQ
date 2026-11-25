import { useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { Button, cx, inputCls } from '../ui';

const YES = { en: 'Yes, please confirm', hi: 'हाँ, कन्फर्म कीजिए', te: 'అవును, నిర్ధారించండి' };
const NO = { en: 'No, a different time', hi: 'नहीं, कोई और समय', te: 'వద్దు, వేరే సమయం' };
const ORDINALS = { en: ['the first one', 'the second one', 'the third one'], hi: ['पहला वाला', 'दूसरा वाला', 'तीसरा वाला'], te: ['మొదటిది', 'రెండవది', 'మూడవది'] };

/** Customer input: microphone (when supported), text fallback, and quick replies for consent and slot choice. */
export default function Composer({ lang, disabled, onSend, speech, tts, ttsEnabled, setTtsEnabled, pending, offeredSlots }) {
  const [text, setText] = useState('');
  const submit = (e) => { e.preventDefault(); if (!text.trim()) return; onSend(text.trim()); setText(''); };

  return (
    <div className="border-t border-line p-4">
      {pending && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <span className="font-medium">Awaiting customer confirmation:</span> site visit {pending.label}. Nothing is booked until the customer says yes.
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => onSend(YES[lang])} disabled={disabled}>{YES[lang]}</Button>
            <Button size="sm" variant="secondary" onClick={() => onSend(NO[lang])} disabled={disabled}>{NO[lang]}</Button>
          </div>
        </div>
      )}
      {!pending && offeredSlots?.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Customer quick reply:</span>
          {offeredSlots.map((s, i) => <Button key={s.startsAt} size="sm" variant="secondary" disabled={disabled} onClick={() => onSend(ORDINALS[lang][i])}>{i + 1}) {s.label}</Button>)}
        </div>
      )}
      <form onSubmit={submit} className="flex items-center gap-2">
        {speech.supported ? (
          <button type="button" disabled={disabled} onClick={speech.listening ? speech.stop : () => { tts.cancel(); speech.start(); }}
            aria-label={speech.listening ? 'Stop listening' : 'Start speaking'}
            className={cx('grid size-11 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-40', speech.listening ? 'listening bg-rose-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-400')}>
            {speech.listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
        ) : null}
        <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} disabled={disabled}
          placeholder={speech.listening ? 'Listening…' : speech.supported ? 'Speak with the mic, or type the customer message…' : 'Voice input unavailable in this browser: type the customer message…'} maxLength={1000} />
        <Button type="submit" disabled={disabled || !text.trim()} aria-label="Send"><Send className="size-4" /></Button>
        {tts.supported && (
          <Button variant="ghost" onClick={() => { if (ttsEnabled) tts.cancel(); setTtsEnabled(!ttsEnabled); }} aria-label={ttsEnabled ? 'Mute voice replies' : 'Enable voice replies'} title={ttsEnabled ? 'Voice replies on' : 'Voice replies off'}>
            {ttsEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
        )}
      </form>
      {speech.error && <p className="mt-2 text-xs text-rose-300">{speech.error}</p>}
    </div>
  );
}
