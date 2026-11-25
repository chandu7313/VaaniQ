import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, PhoneOff, Settings2 } from 'lucide-react';
import { api } from '../lib/api';
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

  const say = useCallback((text, language, id) => {
    if (!tts.supported) return;
    tts.speak(text, BCP47[language], { voiceURI: settings.voices[language], rate: settings.rate, id });
  }, [tts, settings.voices, settings.rate]);
  const autoSay = useCallback((text, language, id) => { if (settings.autoSpeak) say(text, language, id); }, [settings.autoSpeak, say]);

  const start = async () => {
    setError(null); setSummary(null); setResult(null); setSentiments([]);
    try {
      const data = await api('/conversations', { method: 'POST', body: { language: lang, channel: 'voice' } });
      setConv({ ...data.conversation });
      setMessages([{ id: data.greeting.id, role: 'agent', content: data.greeting.content }]);
      autoSay(data.greeting.content, lang, data.greeting.id);
    } catch (err) { setError(err); }
  };

  const send = useCallback(async (text) => {
    if (!conv || sending) return;
    const id = nextId();
    setMessages((m) => [...m, { id, role: 'customer', content: text }]);
    setSending(true); setError(null);
    try {
      const r = await api(`/conversations/${conv.id}/messages`, { method: 'POST', body: { text, language: lang } });
      setMessages((m) => [...m.map((x) => (x.id === id ? { ...x, sentiment: r.sentiment } : x)), { id: r.messageId, role: 'agent', content: r.reply, sources: r.sources }]);
      setSentiments((s) => [...s, r.sentiment]);
      setResult(r);
      setConv((c) => ({ ...c, status: r.conversationStatus }));
      autoSay(r.reply, lang, r.messageId);
    } catch (err) {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, failed: err.message } : x)));
      setError(err);
    } finally { setSending(false); }
  }, [conv, sending, lang, autoSay]);

  const speech = useSpeechRecognition({ lang: bcp47, onFinal: send });
  // Never talk over the customer: stop speaking as soon as the microphone opens.
  useEffect(() => { if (speech.listening) tts.cancel(); }, [speech.listening, tts]);

  const end = async () => {
    setEnding(true);
    try {
      setSummary(await api(`/conversations/${conv.id}/end`, { method: 'POST' }));
      setConv((c) => ({ ...c, status: c.status === 'escalated' ? 'escalated' : 'ended' }));
      tts.cancel(); speech.stop();
    } catch (err) { setError(err); } finally { setEnding(false); }
  };

  const changeLang = (k) => { setLang(k); speech.stop(); tts.cancel(); };
  const ended = summary || conv?.status === 'ended';
  const voiceState = speech.listening ? 'listening' : sending ? 'thinking' : tts.speaking ? 'speaking' : 'idle';
  const hasVoice = tts.hasVoice(bcp47);

  return (
    <div>
      <PageHeader title="AI Voice Agent" description="Role-play a customer call. Every reply is produced live by the backend agent: analysis, RAG, validated tools and database writes."
        actions={(
          <>
            <div className="flex rounded-lg border border-line bg-panel p-0.5" role="group" aria-label="Conversation language">
              {Object.entries(LANG_LABEL).map(([k, label]) => (
                <button key={k} type="button" aria-pressed={lang === k} onClick={() => changeLang(k)} className={cx('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', lang === k ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200')}>{label}</button>
              ))}
            </div>
            {conv && !ended && <Button variant="danger" onClick={end} loading={ending}><PhoneOff className="size-4" />End call & summarise</Button>}
            <Button onClick={start}><PhoneCall className="size-4" />{conv ? 'New call' : 'Start call'}</Button>
          </>
        )} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-4">
          <section className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col rounded-xl border border-line bg-panel">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
              <span className="text-xs font-medium text-slate-200">Live call</span>
              {conv ? <Badge tone={STATUS_TONE[conv.status]}>{conv.status}</Badge> : <Badge>not started</Badge>}
              <div className="ml-auto"><VoiceStatus state={voiceState} lang={lang} bcp47={bcp47} sttSupported={speech.supported} permission={permission} ttsSupported={tts.supported} hasVoice={hasVoice} muted={!settings.autoSpeak} /></div>
            </div>
            {!conv ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-indigo-500/15"><PhoneCall className="size-7 text-indigo-300" /></div>
                <div className="max-w-md text-sm text-slate-400">Choose a language and start a call. Speak through your microphone (Chrome or Edge recommended) or type. The customer is a role-play persona and the company is fictional. No audio is recorded or stored.</div>
                <div className="flex gap-2"><Button onClick={start}>Start call</Button><Link to="/settings"><Button variant="secondary"><Settings2 className="size-4" />Voice settings</Button></Link></div>
              </div>
            ) : (
              <>
                <ChatTranscript messages={messages} sending={sending} interim={speech.interim}
                  onReplay={(m) => say(m.content, lang, m.id)} onStopSpeaking={tts.cancel} speakingId={tts.speakingId} canReplay={tts.supported && hasVoice} />
                {!ended && (
                  <>
                    {messages.length === 1 && (
                      <div className="px-4 pb-1">
                        <button type="button" onClick={() => send(SAMPLES[lang])} className="w-full rounded-lg border border-dashed border-line px-3 py-2 text-left text-xs text-slate-400 transition-colors hover:border-indigo-500/50 hover:text-slate-200">
                          <span className="font-medium text-indigo-300">Try the demo scenario:</span> “{SAMPLES[lang]}”
                        </button>
                      </div>
                    )}
                    <Composer lang={lang} disabled={sending} onSend={send} speech={speech} tts={tts}
                      ttsEnabled={settings.autoSpeak} setTtsEnabled={(v) => update({ autoSpeak: v })}
                      pending={result?.pendingConfirmation} offeredSlots={result?.offeredSlots} />
                  </>
                )}
              </>
            )}
          </section>
          {error && <ErrorState error={error} />}
          {summary && <Card title="Call summary" subtitle="Saved to PostgreSQL (call_summaries)"><SummaryCard summary={summary} /></Card>}
        </div>
        <InsightsPanel result={result} sentiments={sentiments} conversationId={conv?.id} />
      </div>
    </div>
  );
}
