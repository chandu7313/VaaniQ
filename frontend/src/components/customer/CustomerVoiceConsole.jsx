import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Square,
  FileText,
  Loader2,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { LANG_LABEL } from '../../lib/format';

const QUICK_PROMPTS = {
  en: [
    'What are the 2BHK and 3BHK sizes and prices?',
    'Tell me about amenities and location',
    'I would like to schedule a site visit',
  ],
  hi: [
    '2BHK और 3BHK का साइज़ और कीमत क्या है?',
    'सुविधाओं और लोकेशन के बारे में बताइए',
    'मैं साइट विजिट शेड्यूल करना चाहता हूँ',
  ],
  te: [
    '2BHK మరియు 3BHK సైజు మరియు ధరలు ఏమిటి?',
    'సౌకర్యాలు మరియు లొకేషన్ గురించి చెప్పండి',
    'నేను సైట్ విజిట్ బుక్ చేయాలనుకుంటున్నాను',
  ],
};

const YES_NO = {
  en: { yes: 'Yes, confirm visit', no: 'No, choose another time' },
  hi: { yes: 'हाँ, विजिट कन्फर्म करें', no: 'नहीं, दूसरा समय चुनें' },
  te: { yes: 'అవును, నిర్ధారించండి', no: 'వద్దు, వేరే సమయం' },
};

const ORDINALS = {
  en: ['the first one', 'the second one', 'the third one'],
  hi: ['पहला वाला', 'दूसरा वाला', 'तीसरा वाला'],
  te: ['మొదటిది', 'రెండవది', 'మూడవది'],
};

const STATE_VIEW = {
  idle: { label: 'Ready', cls: 'bg-[#EDEFE7] text-[#202922] border-[#DCE9DD]', icon: Radio },
  listening: { label: 'Listening…', cls: 'bg-[#FAE8E8] text-[#A93B3B] border-[#E7BDBD]', icon: Mic },
  thinking: { label: 'Thinking…', cls: 'bg-[#FAF0DC] text-[#9A6216] border-[#E8D1A1]', icon: Loader2 },
  speaking: { label: 'Speaking…', cls: 'bg-[#DCE9DD] text-[#193B30] border-[#BDD4C0]', icon: Volume2 },
};

export default function CustomerVoiceConsole({
  lang,
  onChangeLang,
  messages,
  sending,
  ended,
  voiceState,
  speech,
  tts,
  autoSpeak,
  onToggleAutoSpeak,
  onReplay,
  onSend,
  onEnd,
  ending,
  pendingConfirmation,
  offeredSlots,
  hasVoice,
}) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, speech.interim]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending || ended) return;
    onSend(text.trim());
    setText('');
  };

  const st = STATE_VIEW[voiceState] || STATE_VIEW.idle;
  const StateIcon = st.icon;

  return (
    <section className="flex h-[calc(100vh-175px)] min-h-[580px] flex-col overflow-hidden rounded-2xl border border-[#E2E4DC] bg-white shadow-[0_1px_3px_rgba(32,41,34,0.05)]">
      {/* Calm Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E4DC] bg-[#F7F7F2] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium ${st.cls}`}
          >
            <StateIcon className={`size-3.5 ${voiceState === 'thinking' ? 'animate-spin' : ''}`} />
            <span>{st.label}</span>
            {(voiceState === 'listening' || voiceState === 'speaking') && (
              <span className="flex h-3 items-center gap-0.5" aria-hidden="true">
                <span
                  className={`vq-wave-bar h-3 w-0.5 rounded-full ${
                    voiceState === 'listening' ? 'bg-[#A93B3B]' : 'bg-[#244D3C]'
                  }`}
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className={`vq-wave-bar h-3 w-0.5 rounded-full ${
                    voiceState === 'listening' ? 'bg-[#A93B3B]' : 'bg-[#244D3C]'
                  }`}
                  style={{ animationDelay: '180ms' }}
                />
                <span
                  className={`vq-wave-bar h-3 w-0.5 rounded-full ${
                    voiceState === 'listening' ? 'bg-[#A93B3B]' : 'bg-[#244D3C]'
                  }`}
                  style={{ animationDelay: '360ms' }}
                />
              </span>
            )}
          </span>

          <div className="flex rounded-lg border border-[#E2E4DC] bg-white p-0.5" role="group" aria-label="Language">
            {Object.entries(LANG_LABEL).map(([code, label]) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => onChangeLang(code)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === code
                    ? 'bg-[#244D3C] text-white'
                    : 'text-[#657168] hover:text-[#202922]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tts.supported && (
            <button
              type="button"
              onClick={() => {
                if (autoSpeak) tts.cancel();
                onToggleAutoSpeak(!autoSpeak);
              }}
              aria-label={autoSpeak ? 'Mute assistant voice' : 'Unmute assistant voice'}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2E4DC] bg-white px-3 py-1.5 text-xs font-medium text-[#657168] hover:text-[#202922]"
            >
              {autoSpeak ? <Volume2 className="size-3.5 text-[#244D3C]" /> : <VolumeX className="size-3.5" />}
              <span className="hidden sm:inline">{autoSpeak ? 'Voice on' : 'Muted'}</span>
            </button>
          )}
          {!ended && (
            <button
              type="button"
              onClick={onEnd}
              disabled={ending}
              className="cursor-pointer rounded-lg border border-[#E2E4DC] bg-white px-3 py-1.5 text-xs font-medium text-[#657168] hover:border-[#CFD3C7] hover:text-[#202922] disabled:opacity-50"
            >
              {ending ? 'Finishing…' : 'Finish conversation'}
            </button>
          )}
        </div>
      </div>

      {/* Transcript Stream */}
      <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto bg-[#F7F7F2]/60 p-6" aria-live="polite">
        {messages.map((m) => {
          const isCustomer = m.role === 'customer';
          const isSpeaking = tts.speakingId === m.id;
          return (
            <div key={m.id} className={`vq-fade-in flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
              <div className="mb-1.5 px-1 text-xs font-medium text-[#899188]">
                {isCustomer ? 'You' : 'VaaniQ · ABC Developers'}
              </div>

              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4.5 py-3.5 text-[15.5px] leading-relaxed ${
                  isCustomer
                    ? 'rounded-tr-sm bg-[#244D3C] text-white'
                    : 'rounded-tl-sm border border-[#E2E4DC] bg-white text-[#202922]'
                } ${m.failed ? 'bg-[#A93B3B] text-white' : ''} ${
                  isSpeaking ? 'ring-2 ring-[#244D3C]/35' : ''
                }`}
              >
                {m.content}
              </div>

              <div className={`mt-2 flex flex-wrap items-center gap-2 ${isCustomer ? 'justify-end' : ''}`}>
                {!isCustomer && tts.supported && (
                  isSpeaking ? (
                    <button
                      type="button"
                      onClick={tts.cancel}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#BDD4C0] bg-[#DCE9DD] px-2.5 py-1 text-xs font-medium text-[#193B30]"
                    >
                      <Square className="size-3 fill-current" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReplay(m)}
                      disabled={!hasVoice}
                      title={hasVoice ? 'Listen again' : 'No voice available for this language'}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E4DC] bg-white px-2.5 py-1 text-xs font-medium text-[#657168] hover:text-[#202922] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Volume2 className="size-3.5" />
                      Replay
                    </button>
                  )
                )}

                {m.sources?.map((s) => (
                  <span
                    key={`${s.title}-${s.section}`}
                    title={`Verified source · relevance ${s.relevance}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#DCE9DD] bg-[#EDEFE7] px-2.5 py-1 text-xs font-medium text-[#244D3C]"
                  >
                    <FileText className="size-3" />
                    <span>
                      {s.title.replace(/^ABC (Heights|Developers) - /, '')} › {s.section}
                    </span>
                  </span>
                ))}

                {m.failed && <span className="text-xs text-[#A93B3B]">Could not deliver: {m.failed}</span>}
              </div>
            </div>
          );
        })}

        {speech.interim && (
          <div className="flex justify-end">
            <div className="rounded-xl border border-dashed border-[#CFD3C7] bg-white px-4 py-2.5 text-[15px] italic text-[#657168]">
              “{speech.interim}”…
            </div>
          </div>
        )}

        {sending && (
          <div className="flex w-fit items-center gap-2.5 rounded-xl border border-[#E2E4DC] bg-white px-4 py-2.5 text-sm text-[#657168]">
            <Loader2 className="size-4 animate-spin text-[#244D3C]" />
            <span>Checking verified project details…</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Starter suggestions on turn 1 */}
      {!ended && messages.length === 1 && !sending && (
        <div className="flex flex-wrap gap-2 border-t border-[#E2E4DC] bg-[#F7F7F2] px-5 py-3">
          {(QUICK_PROMPTS[lang] || QUICK_PROMPTS.en).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSend(prompt)}
              className="cursor-pointer rounded-full border border-[#CFD3C7] bg-white px-3.5 py-1.5 text-[13px] text-[#202922] transition-colors hover:border-[#244D3C] hover:bg-[#DCE9DD]/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Explicit Confirmation Bar in Chat */}
      {!ended && pendingConfirmation && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8D1A1] bg-[#FAF0DC] px-5 py-3 text-sm text-[#9A6216]">
          <div>
            Confirm your site visit for <span className="font-semibold text-[#202922]">{pendingConfirmation.label}</span>?
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={sending}
              onClick={() => onSend('Yes, please confirm')}
              className="cursor-pointer rounded-lg bg-[#244D3C] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#193B30] disabled:opacity-50"
            >
              {(YES_NO[lang] || YES_NO.en).yes}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => onSend('No, a different time')}
              className="cursor-pointer rounded-lg border border-[#CFD3C7] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#202922] hover:bg-[#F7F7F2] disabled:opacity-50"
            >
              {(YES_NO[lang] || YES_NO.en).no}
            </button>
          </div>
        </div>
      )}

      {/* Quick slot choice pills when assistant offers slots */}
      {!ended && !pendingConfirmation && offeredSlots?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E2E4DC] bg-[#F7F7F2] px-5 py-3 text-[13px]">
          <span className="font-medium text-[#657168]">Select a slot:</span>
          {offeredSlots.map((s, i) => (
            <button
              key={s.startsAt}
              type="button"
              disabled={sending}
              onClick={() => onSend((ORDINALS[lang] || ORDINALS.en)[i] || s.label)}
              className="cursor-pointer rounded-lg border border-[#CFD3C7] bg-white px-3 py-1.5 text-[13px] font-medium text-[#202922] hover:border-[#244D3C] hover:bg-[#DCE9DD]/40 disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Voice & Text Input Console */}
      {!ended && (
        <div className="border-t border-[#E2E4DC] bg-white p-4.5">
          <form onSubmit={submit} className="flex items-center gap-3">
            {speech.supported && (
              <button
                type="button"
                disabled={sending}
                onClick={
                  speech.listening
                    ? speech.stop
                    : () => {
                        tts.cancel();
                        speech.start();
                      }
                }
                aria-label={speech.listening ? 'Stop microphone' : 'Speak with microphone'}
                className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-45 ${
                  speech.listening
                    ? 'listening bg-[#A93B3B] text-white'
                    : 'bg-[#244D3C] text-white hover:bg-[#193B30]'
                }`}
              >
                {speech.listening ? <MicOff className="size-4.5" /> : <Mic className="size-4.5" />}
                <span className="hidden sm:inline">{speech.listening ? 'Listening…' : 'Speak'}</span>
              </button>
            )}

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
              maxLength={1000}
              placeholder={
                speech.listening
                  ? 'Listening to your voice…'
                  : speech.supported
                    ? 'Tap Speak or type your question here…'
                    : 'Type your question or visit request here…'
              }
              className="h-12 flex-1 rounded-xl border border-[#CFD3C7] bg-[#F7F7F2] px-4 text-[15px] text-[#202922] placeholder:text-[#899188] focus:border-[#244D3C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#244D3C]"
            />

            <button
              type="submit"
              disabled={sending || !text.trim()}
              aria-label="Send message"
              className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl bg-[#244D3C] text-white transition-colors hover:bg-[#193B30] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-4.5" />
            </button>
          </form>

          {speech.error && (
            <div role="alert" className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-[#A93B3B]">
              <span>{speech.error.message}</span>
              {speech.error.retryable && (
                <button
                  type="button"
                  onClick={() => {
                    tts.cancel();
                    speech.retry();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#E7BDBD] px-2.5 py-1 text-xs font-medium"
                >
                  <RotateCcw className="size-3" />
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={speech.clearError}
                className="cursor-pointer text-[#657168] underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
