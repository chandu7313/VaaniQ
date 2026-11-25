import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Square,
  Keyboard,
  FileText,
  CalendarDays,
  User,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { WaveformIcon } from './BrandHeader';
import {
  InlineResidenceCards,
  InlineRequirementsCard,
  InlineBookingCard,
} from './InlineConversationCards';

const WAVE_HEIGHTS = [10, 16, 24, 14, 28, 36, 22, 42, 30, 48, 34, 44, 26, 38, 22, 32, 18, 24, 14, 18, 12];

const QUICK_CHIPS = {
  en: ['2BHK & 3BHK pricing', 'Amenities & clubhouse', 'Schedule a site visit'],
  hi: ['2BHK और 3BHK की कीमत', 'सुविधाएं और क्लबहाउस', 'साइट विजिट तय करें'],
  te: ['2BHK మరియు 3BHK ధరలు', 'సౌకర్యాలు మరియు క్లబ్‌హౌస్', 'సైట్ విజిట్ బుక్ చేయండి'],
};

export default function CustomerVoiceConsole({
  lang,
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
  overview,
  requirements,
  slots,
  selectingSlot,
  onSelectSlot,
  pendingConfirmation,
  offeredSlots,
  needsContact,
  contactSaved,
  onSubmitContact,
  savingContact,
  hasVoice,
}) {
  const [text, setText] = useState('');
  const [showTyping, setShowTyping] = useState(!speech.supported);
  const [showCalendarManual, setShowCalendarManual] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, speech.interim, pendingConfirmation, needsContact, showCalendarManual]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending || ended) return;
    onSend(text.trim());
    setText('');
  };

  const units = overview?.tenant?.units || [];
  const lastAgentIndex = messages.map((m) => m.role).lastIndexOf('agent');

  // Show calendar inline if agent offered slots, waiting for contact, awaiting confirmation, or user clicked Visit Slots
  const showBookingUi =
    !ended &&
    (offeredSlots?.length > 0 || Boolean(pendingConfirmation) || Boolean(needsContact) || showCalendarManual);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 pb-6 pt-5 sm:px-6">
      {/* Conversation Stream */}
      <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto pb-6" aria-live="polite">
        {messages.map((m, idx) => {
          const isCustomer = m.role === 'customer';
          const isSpeaking = tts.speakingId === m.id;
          const mentionsResidences =
            !isCustomer &&
            (m.sources?.some((s) => /pricing|overview|inventory/i.test(`${s.title} ${s.section}`)) ||
              (/2BHK|3BHK|₹\d+/i.test(m.content) && idx > 0));
          const isLastAgent = idx === lastAgentIndex;

          return (
            <div key={m.id} className="vq-fade-in">
              <div className={`flex items-start gap-3 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                {!isCustomer && <WaveformIcon size="md" light />}

                <div className={`max-w-[85%] ${isCustomer ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4.5 py-3.5 text-[15px] leading-relaxed shadow-[0_1px_2px_rgba(32,41,34,0.04)] ${
                      isCustomer
                        ? 'flex items-center gap-2.5 border border-[#DCE9DD] bg-[#EDEFE7] text-[#202922]'
                        : 'border border-[#E2E4DC] bg-white text-[#202922]'
                    } ${m.failed ? 'border-[#E7BDBD] bg-[#FAE8E8] text-[#A93B3B]' : ''} ${
                      isSpeaking ? 'ring-2 ring-[#244D3C]/35' : ''
                    }`}
                  >
                    {isCustomer && <User className="size-4 shrink-0 text-[#657168]" />}
                    <span>{m.content}</span>
                  </div>

                  {/* Replay + Source Attribution */}
                  <div className={`mt-1.5 flex flex-wrap items-center gap-2 ${isCustomer ? 'justify-end' : ''}`}>
                    {!isCustomer && tts.supported && (
                      isSpeaking ? (
                        <button
                          type="button"
                          onClick={tts.cancel}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#BDD4C0] bg-[#DCE9DD] px-2 py-0.5 text-[11px] font-medium text-[#193B30]"
                        >
                          <Square className="size-2.5 fill-current" />
                          Stop
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReplay(m)}
                          disabled={!hasVoice}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#E2E4DC] bg-white px-2 py-0.5 text-[11px] font-medium text-[#657168] hover:text-[#202922] disabled:opacity-40"
                        >
                          <Volume2 className="size-3" />
                          Replay
                        </button>
                      )
                    )}
                    {!mentionsResidences &&
                      m.sources?.map((s) => (
                        <span
                          key={`${s.title}-${s.section}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[#DCE9DD] bg-[#EDEFE7] px-2 py-0.5 text-[11px] font-medium text-[#244D3C]"
                        >
                          <FileText className="size-3" />
                          {s.title.replace(/^ABC (Heights|Developers) - /, '')} › {s.section}
                        </span>
                      ))}
                    {m.failed && <span className="text-xs text-[#A93B3B]">Failed: {m.failed}</span>}
                  </div>
                </div>
              </div>

              {/* Screen 3: Inline Verified Residence Cards */}
              {mentionsResidences && (
                <div className="pl-12">
                  <InlineResidenceCards
                    units={units}
                    budgetLakh={requirements?.budgetLakh}
                    sources={m.sources}
                  />
                </div>
              )}

              {/* Screen 4: Inline Your Requirements Card attached after latest agent turn */}
              {isLastAgent && requirements && (
                <div className="pl-12">
                  <InlineRequirementsCard
                    requirements={requirements}
                    onUpdateRequirements={onSend}
                    disabled={sending || ended}
                  />
                </div>
              )}

              {/* Screen 5: Inline Calendar + Slots + Contact + Confirmation Card */}
              {isLastAgent && showBookingUi && (
                <div className="pl-12">
                  <InlineBookingCard
                    slots={slots}
                    selectingSlot={selectingSlot}
                    onSelectSlot={(iso) => {
                      setShowCalendarManual(false);
                      onSelectSlot(iso);
                    }}
                    pendingConfirmation={pendingConfirmation}
                    onConfirmPending={() => onSend('Yes, please confirm')}
                    onDeclinePending={() => {
                      setShowCalendarManual(true);
                      onSend('No, a different time');
                    }}
                    needsContact={needsContact}
                    contactSaved={contactSaved}
                    onSubmitContact={onSubmitContact}
                    savingContact={savingContact}
                    sending={sending}
                  />
                </div>
              )}
            </div>
          );
        })}

        {speech.interim && (
          <div className="flex justify-end">
            <div className="rounded-2xl border border-dashed border-[#CFD3C7] bg-white px-4 py-2.5 text-sm italic text-[#657168]">
              “{speech.interim}”…
            </div>
          </div>
        )}

        {sending && (
          <div className="flex items-center gap-2.5 pl-12 text-xs text-[#657168]">
            <Loader2 className="size-4 animate-spin text-[#244D3C]" />
            <span>VaaniQ is checking verified residence records…</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Starter chips on first message */}
      {!ended && messages.length === 1 && !sending && (
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {(QUICK_CHIPS[lang] || QUICK_CHIPS.en).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSend(chip)}
              className="cursor-pointer rounded-full border border-[#CFD3C7] bg-white px-3.5 py-1.5 text-xs font-medium text-[#202922] transition-colors hover:border-[#244D3C] hover:bg-[#DCE9DD]/45"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Screen 2 Center-Bottom Voice Hub */}
      {!ended && (
        <div className="border-t border-[#E2E4DC] pt-4">
          {/* Expandable Text Input Bar */}
          {showTyping && (
            <form onSubmit={submit} className="mb-4 flex items-center gap-2.5">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
                maxLength={1000}
                placeholder="Type your question or visit preference…"
                className="h-11 flex-1 rounded-full border border-[#CFD3C7] bg-white px-4 text-sm text-[#202922] placeholder:text-[#899188] focus:border-[#244D3C] focus:outline-none focus:ring-1 focus:ring-[#244D3C]"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                aria-label="Send message"
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[#244D3C] text-white hover:bg-[#193B30] disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          )}

          {/* Subtle Equalizer Waveform */}
          <div className="mb-3 flex h-10 items-center justify-center gap-1" aria-hidden="true">
            {WAVE_HEIGHTS.map((h, i) => {
              const active = voiceState === 'listening' || voiceState === 'speaking';
              return (
                <span
                  key={i}
                  className={`w-[2.5px] rounded-full transition-all ${
                    active
                      ? 'vq-wave-bar bg-[#244D3C]'
                      : i % 3 === 0
                        ? 'bg-[#82966B]/60'
                        : 'bg-[#CFD3C7]'
                  }`}
                  style={{
                    height: active ? `${h}px` : `${Math.max(8, Math.round(h * 0.45))}px`,
                    animationDelay: `${i * 55}ms`,
                  }}
                />
              );
            })}
          </div>

          {/* Centered Circular Microphone Control */}
          <div className="flex flex-col items-center gap-2">
            {speech.supported ? (
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
                aria-label={speech.listening ? 'Stop listening' : 'Tap microphone to speak'}
                className={`grid size-16 cursor-pointer place-items-center rounded-full ring-8 transition-all disabled:opacity-45 ${
                  speech.listening
                    ? 'listening bg-[#A93B3B] text-white ring-[#FAE8E8]'
                    : 'bg-[#244D3C] text-white ring-[#DCE9DD] hover:bg-[#193B30]'
                }`}
              >
                {speech.listening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowTyping(true)}
                className="grid size-14 cursor-pointer place-items-center rounded-full bg-[#244D3C] text-white ring-6 ring-[#DCE9DD]"
                aria-label="Type message"
              >
                <Keyboard className="size-5" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-medium text-[#202922]">
              <span
                className={`size-2 rounded-full ${
                  voiceState === 'listening'
                    ? 'bg-[#A93B3B]'
                    : voiceState === 'thinking'
                      ? 'bg-[#9A6216]'
                      : voiceState === 'speaking'
                        ? 'bg-[#2C6E49]'
                        : 'bg-[#82966B]'
                }`}
              />
              <span>
                {voiceState === 'listening'
                  ? 'Listening…'
                  : voiceState === 'thinking'
                    ? 'Processing…'
                    : voiceState === 'speaking'
                      ? 'Speaking…'
                      : speech.supported
                        ? 'Tap microphone to speak'
                        : 'Type below to chat'}
              </span>
            </div>
          </div>

          {speech.error && (
            <div role="alert" className="mt-2.5 flex items-center justify-center gap-2 text-xs text-[#A93B3B]">
              <span>{speech.error.message}</span>
              {speech.error.retryable && (
                <button
                  type="button"
                  onClick={() => {
                    tts.cancel();
                    speech.retry();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#E7BDBD] px-2 py-0.5 font-medium"
                >
                  <RotateCcw className="size-3" />
                  Retry
                </button>
              )}
              <button type="button" onClick={speech.clearError} className="underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Minimal Bottom Controls (Mute · Calendar · Type) */}
          <div className="mt-4 flex items-center justify-between px-2 text-xs font-medium text-[#657168]">
            <div className="flex items-center gap-5">
              {tts.supported && (
                <button
                  type="button"
                  onClick={() => {
                    if (autoSpeak) tts.cancel();
                    onToggleAutoSpeak(!autoSpeak);
                  }}
                  className="flex cursor-pointer flex-col items-center gap-1 hover:text-[#202922]"
                >
                  {autoSpeak ? (
                    <Volume2 className="size-4 text-[#244D3C]" />
                  ) : (
                    <VolumeX className="size-4 text-[#A93B3B]" />
                  )}
                  <span>{autoSpeak ? 'Mute' : 'Unmute'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowCalendarManual((v) => !v)}
                className="flex cursor-pointer flex-col items-center gap-1 hover:text-[#202922]"
              >
                <CalendarDays className={`size-4 ${showCalendarManual ? 'text-[#244D3C]' : ''}`} />
                <span>Visit Slots</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTyping((v) => !v)}
              className="flex cursor-pointer flex-col items-center gap-1 hover:text-[#202922]"
            >
              <Keyboard className={`size-4 ${showTyping ? 'text-[#244D3C]' : ''}`} />
              <span>Type</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
