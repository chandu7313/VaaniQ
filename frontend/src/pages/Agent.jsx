import { useCallback, useState } from 'react';
import { PhoneCall, PhoneOff, Info } from 'lucide-react';
import { api } from '../lib/api';
import { LANG_LABEL } from '../lib/format';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useSpeech';
import { Badge, Button, Card, ErrorState, PageHeader, STATUS_TONE, cx } from '../components/ui';
import ChatTranscript from '../components/agent/ChatTranscript';
import Composer from '../components/agent/Composer';
import InsightsPanel from '../components/agent/InsightsPanel';
import SummaryCard from '../components/SummaryCard';

const BCP47 = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
const SAMPLES = {
  en: 'I am looking for a 3BHK apartment in Gachibowli. My budget is around ₹90 lakhs. I am planning to purchase within the next month. Can you tell me about the project and arrange a site visit?',
  hi: 'मुझे गाचीबोवली में 3BHK फ्लैट चाहिए, बजट लगभग 90 लाख है। अगले महीने खरीदना है। साइट विजिट करवा दीजिए।',
  te: 'నాకు గచ్చిబౌలిలో 3BHK అపార్ట్‌మెంట్ కావాలి, బడ్జెట్ 95 లక్షలు. వచ్చే నెల కొనాలి. సైట్ విజిట్ ఏర్పాటు చేయండి.',
};

let localId = 0;
const nextId = () => `local-${++localId}`;

export default function Agent() {
  const [lang, setLang] = useState('en');
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [sentiments, setSentiments] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [ending, setEnding] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsNotice, setTtsNotice] = useState(null);
  const tts = useSpeechSynthesis();

  const say = useCallback((text, language) => {
    if (!ttsEnabled || !tts.supported) return;
    const ok = tts.speak(text, BCP47[language]);
    setTtsNotice(ok ? null : `No ${LANG_LABEL[language]} voice is installed in this browser, so the reply is shown as text only.`);
  }, [ttsEnabled, tts]);

  const start = async () => {
    setError(null); setSummary(null); setResult(null); setSentiments([]);
    try {
      const data = await api('/conversations', { method: 'POST', body: { language: lang, channel: 'voice' } });
      setConv({ ...data.conversation });
      setMessages([{ id: data.greeting.id, role: 'agent', content: data.greeting.content }]);
      say(data.greeting.content, lang);
    } catch (err) { setError(err); }
  };

  const send = useCallback(async (text) => {
    if (!conv || sending) return;
    const id = nextId();
    setMessages((m) => [...m, { id, role: 'customer', content: text }]);
    setSending(true); setError(null);
    try {
      const r = await api(`/conversations/${conv.id}/messages`, { method: 'POST', body: { text, language: lang } });
      setMessages((m) => [...m.map((x) => (x.id === id ? { ...x, sentiment: r.analysis.sentiment } : x)), { id: r.messageId, role: 'agent', content: r.reply, sources: r.sources }]);
      setSentiments((s) => [...s, r.analysis.sentiment]);
      setResult(r);
      setConv((c) => ({ ...c, status: r.conversationStatus }));
      say(r.reply, lang);
    } catch (err) {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, failed: err.message } : x)));
      setError(err);
    } finally { setSending(false); }
  }, [conv, sending, lang, say]);

  const speech = useSpeechRecognition({ lang: BCP47[lang], onFinal: send });

  const end = async () => {
    setEnding(true);
    try {
      setSummary(await api(`/conversations/${conv.id}/end`, { method: 'POST' }));
      setConv((c) => ({ ...c, status: c.status === 'escalated' ? 'escalated' : 'ended' }));
      tts.cancel(); speech.stop();
    } catch (err) { setError(err); } finally { setEnding(false); }
  };

  const ended = summary || conv?.status === 'ended';
  return (
    <div>
      <PageHeader title="AI Voice Agent" description="Role-play a customer call. Every reply is produced live by the backend agent: analysis, RAG, validated tools and database writes."
        actions={(
          <>
            <div className="flex rounded-lg border border-line bg-panel p-0.5" role="group" aria-label="Language">
              {Object.entries(LANG_LABEL).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setLang(k)} className={cx('rounded-md px-3 py-1.5 text-xs font-medium', lang === k ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200')}>{label}</button>
              ))}
            </div>
            {conv && !ended && <Button variant="danger" onClick={end} loading={ending}><PhoneOff className="size-4" />End call & summarise</Button>}
            <Button onClick={start}><PhoneCall className="size-4" />{conv ? 'New call' : 'Start call'}</Button>
          </>
        )} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4">
          <section className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col rounded-xl border border-line bg-panel">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 text-xs">
              <span className="font-medium text-slate-200">Live call</span>
              {conv ? <Badge tone={STATUS_TONE[conv.status]}>{conv.status}</Badge> : <Badge>not started</Badge>}
              <span className="text-slate-500">· {LANG_LABEL[lang]} ({BCP47[lang]})</span>
              <span className="ml-auto text-slate-500">{speech.supported ? 'Voice input available' : 'Voice input not supported: text mode'}{tts.speaking && ' · speaking…'}</span>
            </div>
            {!conv ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-indigo-500/15"><PhoneCall className="size-7 text-indigo-300" /></div>
                <div className="max-w-md text-sm text-slate-400">Choose a language and start a call. Speak through your microphone (Chrome/Edge recommended) or type. The customer is a role-play persona and the company is fictional.</div>
                <Button onClick={start}>Start call</Button>
              </div>
            ) : (
              <>
                <ChatTranscript messages={messages} sending={sending} interim={speech.interim} />
                {!ended && conv.status !== 'ended' && (
                  <>
                    {messages.length === 1 && (
                      <div className="px-4 pb-1">
                        <button type="button" onClick={() => send(SAMPLES[lang])} className="w-full rounded-lg border border-dashed border-line px-3 py-2 text-left text-xs text-slate-400 hover:border-indigo-500/50 hover:text-slate-200">
                          <span className="font-medium text-indigo-300">Try the demo scenario:</span> “{SAMPLES[lang]}”
                        </button>
                      </div>
                    )}
                    <Composer lang={lang} disabled={sending} onSend={send} speech={speech} tts={tts} ttsEnabled={ttsEnabled} setTtsEnabled={setTtsEnabled} pending={result?.pendingConfirmation} offeredSlots={result?.offeredSlots} />
                  </>
                )}
              </>
            )}
          </section>
          {ttsNotice && <p className="flex items-center gap-2 text-xs text-amber-300"><Info className="size-3.5" />{ttsNotice}</p>}
          {error && <ErrorState error={error} />}
          {summary && <Card title="Call summary" subtitle="Saved to PostgreSQL (call_summaries)"><SummaryCard summary={summary} /></Card>}
        </div>
        <InsightsPanel result={result} sentiments={sentiments} conversationId={conv?.id} />
      </div>
    </div>
  );
}
