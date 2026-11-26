import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, PhoneOff, Settings2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LANG_LABEL, BCP47 } from '../lib/format';
import { useSpeechRecognition, useSpeechSynthesis, useMicPermission } from '../hooks/useSpeech';
import { useSettings } from '../context/SettingsContext';
import { Badge, Button, Card, ErrorState, PageHeader, STATUS_TONE, cx } from '../components/ui';
import ChatTranscript from '../components/agent/ChatTranscript';
import Composer from '../components/agent/Composer';
import InsightsPanel from '../components/agent/InsightsPanel';
import VoiceStatus from '../components/agent/VoiceStatus';
import SummaryCard from '../components/SummaryCard';

const SAMPLES = {
  en: 'I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?',
  hi: 'मुझे गाचीबोवली में 3BHK फ्लैट चाहिए, बजट लगभग 90 लाख है। अगले महीने खरीदना है। साइट विजिट करवा दीजिए।',
  te: 'నాకు గచ్చిబౌలిలో 3BHK అపార్ట్‌మెంట్ కావాలి, బడ్జెట్ 95 లక్షలు. వచ్చే నెల కొనాలి. సైట్ విజిట్ ఏర్పాటు చేయండి.',
};

let localId = 0;
const nextId = () => `local-${++localId}`;

export default function Agent() {
  const { settings, update } = useSettings();
  const [lang, setLang] = useState(settings.language);
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [sentiments, setSentiments] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [ending, setEnding] = useState(false);
  const tts = useSpeechSynthesis();
  const permission = useMicPermission();
  const bcp47 = BCP47[lang];

  const say = useCallback(
    (text, language, id) => {
      if (!tts.supported) return;
      tts.speak(text, BCP47[language], { voiceURI: settings.voices[language], rate: settings.rate, id });
    },
    [tts, settings.voices, settings.rate],
  );

  const autoSay = useCallback(
    (text, language, id) => {
      if (settings.autoSpeak) say(text, language, id);
    },
    [settings.autoSpeak, say],
  );

  const start = async () => {
    setError(null);
    setSummary(null);
    setResult(null);
    setSentiments([]);
    try {
      const data = await api('/conversations', { method: 'POST', body: { language: lang, channel: 'voice' } });
      setConv({ ...data.conversation });
      setMessages([{ id: data.greeting.id, role: 'agent', content: data.greeting.content }]);
      autoSay(data.greeting.content, lang, data.greeting.id);
    } catch (err) {
      setError(err);
    }
  };

  const send = useCallback(
    async (text) => {
      if (!conv || sending) return;
      const id = nextId();
      setMessages((m) => [...m, { id, role: 'customer', content: text }]);
      setSending(true);
      setError(null);
      try {
        const r = await api(`/conversations/${conv.id}/messages`, {
          method: 'POST',
          body: { text, language: lang },
        });
        setMessages((m) => [
          ...m.map((x) => (x.id === id ? { ...x, sentiment: r.sentiment } : x)),
          { id: r.messageId, role: 'agent', content: r.reply, sources: r.sources },
        ]);
        setSentiments((s) => [...s, r.sentiment]);
        setResult(r);
        setConv((c) => ({ ...c, status: r.conversationStatus }));
        autoSay(r.reply, lang, r.messageId);
      } catch (err) {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, failed: err.message } : x)));
        setError(err);
      } finally {
        setSending(false);
      }
    },
    [conv, sending, lang, autoSay],
  );

  const { meta } = useAuth();
  // Server (Whisper) transcription is offered only when the backend reports it is configured.
  const transcribe = useCallback(async (blob, language) => (await api(`/speech/transcribe?language=${language}`, { method: 'POST', rawBody: blob })).text, []);
  const speech = useSpeechRecognition({ lang: bcp47, onFinal: send, transcribe: meta?.speech?.serverTranscription ? transcribe : undefined });
  useEffect(() => {
    if (speech.listening) tts.cancel();
  }, [speech.listening, tts]);

  const end = async () => {
    setEnding(true);
    try {
      setSummary(await api(`/conversations/${conv.id}/end`, { method: 'POST' }));
      setConv((c) => ({ ...c, status: c.status === 'escalated' ? 'escalated' : 'ended' }));
      tts.cancel();
      speech.stop();
    } catch (err) {
      setError(err);
    } finally {
      setEnding(false);
    }
  };

  const changeLang = (k) => {
    setLang(k);
    speech.stop();
    tts.cancel();
  };

  const ended = summary || conv?.status === 'ended';
  const voiceState = speech.listening ? 'listening' : sending || speech.transcribing ? 'thinking' : tts.speaking ? 'speaking' : 'idle';
  const hasVoice = tts.hasVoice(bcp47);

  return (
    <div>
      <PageHeader
        eyebrow="Live Call Workstation"
        title="AI Voice Agent"
        description="Run a multilingual customer call in real time. Every reply combines backend NLU, BM25 knowledge retrieval, validated CRM updates, and consent-checked scheduling."
        actions={
          <>
            <div
              className="flex rounded-lg border border-line bg-surface-2 p-1"
              role="group"
              aria-label="Conversation language"
            >
              {Object.entries(LANG_LABEL).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={lang === k}
                  onClick={() => changeLang(k)}
                  className={cx(
                    'cursor-pointer rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                    lang === k
                      ? 'bg-surface text-brand-deep shadow-[var(--shadow-card)]'
                      : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {conv && !ended && (
              <Button variant="danger" onClick={end} loading={ending}>
                <PhoneOff className="size-4" />
                End call &amp; summarise
              </Button>
            )}
            <Button onClick={start}>
              <PhoneCall className="size-4" />
              {conv ? 'New call' : 'Start call'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="min-w-0 space-y-5">
          {/* Main Call Workspace Surface */}
          <section className="flex h-[calc(100vh-230px)] min-h-[600px] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]">
            {/* Dark Studio Call Header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-rail-border bg-rail px-6 py-3.5 text-rail-ink">
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full bg-[#6ED499]" />
                <span className="text-sm font-semibold text-rail-ink">Call Session</span>
                {conv ? (
                  <Badge tone={STATUS_TONE[conv.status]}>{conv.status}</Badge>
                ) : (
                  <Badge tone="dark">standby</Badge>
                )}
                {conv?.id && (
                  <span className="hidden font-mono text-xs text-rail-muted sm:inline">
                    #{conv.id.slice(0, 8)}
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <VoiceStatus
                  state={voiceState}
                  lang={lang}
                  bcp47={bcp47}
                  sttSupported={speech.supported}
                  permission={permission}
                  ttsSupported={tts.supported}
                  hasVoice={hasVoice}
                  muted={!settings.autoSpeak}
                  sttMode={speech.mode}
                  onDark
                />
              </div>
            </div>

            {!conv ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-canvas/50 p-10 text-center">
                <div className="grid size-16 place-items-center rounded-2xl border border-brand-soft-border bg-brand-soft text-brand-deep">
                  <PhoneCall className="size-7" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="font-serif text-2xl font-medium text-ink">
                    Ready to initiate a customer call
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-2">
                    Select English, हिन्दी, or తెలుగు above and start a session. Speak via microphone (Chrome or Edge recommended) or type customer messages directly. No audio files are stored.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={start}>
                    <PhoneCall className="size-4" />
                    Start call session
                  </Button>
                  <Link to="/settings">
                    <Button variant="secondary">
                      <Settings2 className="size-4" />
                      Voice &amp; audio settings
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ChatTranscript
                  messages={messages}
                  sending={sending}
                  interim={speech.interim}
                  onReplay={(m) => say(m.content, lang, m.id)}
                  onStopSpeaking={tts.cancel}
                  speakingId={tts.speakingId}
                  canReplay={tts.supported && hasVoice}
                />
                {!ended && (
                  <>
                    {messages.length === 1 && (
                      <div className="border-t border-line bg-canvas/70 px-5 py-3">
                        <button
                          type="button"
                          onClick={() => send(SAMPLES[lang])}
                          className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-2.5 text-left text-[13px] text-ink-2 transition-colors hover:border-brand hover:text-ink"
                        >
                          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                          <span>
                            <span className="font-semibold text-brand">Try sample customer inquiry:</span> “
                            {SAMPLES[lang]}”
                          </span>
                        </button>
                      </div>
                    )}
                    <Composer
                      lang={lang}
                      disabled={sending}
                      onSend={send}
                      speech={speech}
                      tts={tts}
                      ttsEnabled={settings.autoSpeak}
                      setTtsEnabled={(v) => update({ autoSpeak: v })}
                      pending={result?.pendingConfirmation}
                      offeredSlots={result?.offeredSlots}
                    />
                  </>
                )}
              </>
            )}
          </section>

          {error && <ErrorState error={error} />}

          {summary && (
            <Card title="Call summary" subtitle="Persisted to PostgreSQL (call_summaries)">
              <SummaryCard summary={summary} />
            </Card>
          )}
        </div>

        <InsightsPanel result={result} sentiments={sentiments} conversationId={conv?.id} />
      </div>
    </div>
  );
}
