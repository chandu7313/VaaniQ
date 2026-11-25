import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { BCP47 } from '../lib/format';
import { publicApi, customerSessionStore } from '../lib/publicApi';
import { useSpeechRecognition, useSpeechSynthesis, useMicPermission } from '../hooks/useSpeech';
import { ProductBrand } from '../components/ProductBrand';
import WelcomeScreen from '../components/customer/WelcomeScreen';
import CustomerVoiceConsole from '../components/customer/CustomerVoiceConsole';
import ResidenceGuide from '../components/customer/ResidenceGuide';
import VisitBookingPanel from '../components/customer/VisitBookingPanel';
import CompletionCard from '../components/customer/CompletionCard';

let localId = 0;
const nextLocalId = () => `cust-local-${++localId}`;

export default function CustomerExperience() {
  const { slug = 'abc-developers' } = useParams();

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  const [lang, setLang] = useState('en');
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [session, setSession] = useState(null); // { conversationId, sessionToken }
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('active');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState(null);

  const [requirements, setRequirements] = useState(null);
  const [offeredSlots, setOfferedSlots] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [needsContact, setNeedsContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [appointment, setAppointment] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [daypart, setDaypart] = useState('');
  const [selectingSlot, setSelectingSlot] = useState(null);
  const [savingContact, setSavingContact] = useState(false);

  const tts = useSpeechSynthesis();
  const permission = useMicPermission();
  const bcp47 = BCP47[lang] || BCP47.en;
  const hasVoice = tts.hasVoice(bcp47);

  const say = useCallback(
    (text, language, id) => {
      if (!tts.supported) return;
      tts.speak(text, BCP47[language] || BCP47.en, { id });
    },
    [tts],
  );

  const autoSay = useCallback(
    (text, language, id) => {
      if (autoSpeak) say(text, language, id);
    },
    [autoSpeak, say],
  );

  // Load verified project overview & initial slots + restore isolated session if active
  useEffect(() => {
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);

    (async () => {
      try {
        const data = await publicApi(slug, '/overview');
        if (cancelled) return;
        setOverview(data);
        setSlots(data.availableSlots || []);

        const saved = customerSessionStore.get(slug);
        if (saved?.conversationId && saved?.sessionToken) {
          try {
            const restored = await publicApi(slug, `/conversations/${saved.conversationId}`, {
              sessionToken: saved.sessionToken,
            });
            if (cancelled) return;
            setSession(saved);
            setLang(restored.conversation.language || 'en');
            setMessages(restored.messages || []);
            setStatus(restored.conversationStatus || 'active');
            setOfferedSlots(restored.offeredSlots || []);
            setPendingConfirmation(restored.pendingConfirmation || null);
            setNeedsContact(Boolean(restored.needsContact));
            setContactSaved(Boolean(restored.contactSaved));
            setAppointment(restored.appointment || null);
            setRequirements(restored.collectedRequirements || null);
          } catch {
            customerSessionStore.clear(slug);
          }
        }
      } catch (err) {
        if (!cancelled) setOverviewError(err.message);
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadAvailability = useCallback(
    async (dp) => {
      setLoadingSlots(true);
      try {
        const qs = new URLSearchParams({ limit: '12', ...(dp ? { daypart: dp } : {}) }).toString();
        const data = await publicApi(slug, `/availability?${qs}`);
        setSlots(data || []);
      } catch {
        // Keep current slots if refresh fails transiently
      } finally {
        setLoadingSlots(false);
      }
    },
    [slug],
  );

  const handleChangeDaypart = (dp) => {
    setDaypart(dp);
    loadAvailability(dp);
  };

  const startConversation = async () => {
    setStarting(true);
    setError(null);
    try {
      const data = await publicApi(slug, '/conversations', {
        method: 'POST',
        body: { language: lang, channel: 'voice' },
      });
      const nextSession = { conversationId: data.conversation.id, sessionToken: data.sessionToken };
      customerSessionStore.set(slug, nextSession);
      setSession(nextSession);
      setMessages([data.greeting]);
      setStatus(data.conversation.status || 'active');
      setRequirements(null);
      setOfferedSlots([]);
      setPendingConfirmation(null);
      setNeedsContact(false);
      setContactSaved(false);
      setAppointment(null);
      autoSay(data.greeting.content, lang, data.greeting.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = useCallback(
    async (text) => {
      if (!session || sending || status === 'ended') return;
      const tempId = nextLocalId();
      setMessages((m) => [...m, { id: tempId, role: 'customer', content: text }]);
      setSending(true);
      setError(null);
      try {
        const r = await publicApi(slug, `/conversations/${session.conversationId}/messages`, {
          method: 'POST',
          sessionToken: session.sessionToken,
          body: { text, language: lang },
        });
        setMessages((m) => [
          ...m,
          { id: r.messageId, role: 'agent', content: r.reply, sources: r.sources },
        ]);
        setOfferedSlots(r.offeredSlots || []);
        setPendingConfirmation(r.pendingConfirmation || null);
        setNeedsContact(Boolean(r.needsContact));
        setContactSaved(Boolean(r.contactSaved));
        if (r.appointment) {
          setAppointment(r.appointment);
          loadAvailability(daypart);
        }
        if (r.collectedRequirements) setRequirements(r.collectedRequirements);
        setStatus(r.conversationStatus || 'active');
        autoSay(r.reply, r.language || lang, r.messageId);
      } catch (err) {
        setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, failed: err.message } : x)));
        setError(err.message);
      } finally {
        setSending(false);
      }
    },
    [session, sending, status, slug, lang, autoSay, daypart, loadAvailability],
  );

  const speech = useSpeechRecognition({ lang: bcp47, onFinal: sendMessage });
  useEffect(() => {
    if (speech.listening) tts.cancel();
  }, [speech.listening, tts]);

  const handleSelectSlot = async (startsAt) => {
    if (!session || selectingSlot || sending) return;
    setSelectingSlot(startsAt);
    setError(null);
    try {
      const r = await publicApi(slug, `/conversations/${session.conversationId}/select-slot`, {
        method: 'POST',
        sessionToken: session.sessionToken,
        body: { startsAt, language: lang },
      });
      // Reload clean message history or append both turns cleanly
      const refreshed = await publicApi(slug, `/conversations/${session.conversationId}`, {
        sessionToken: session.sessionToken,
      });
      setMessages(refreshed.messages || []);
      setPendingConfirmation(r.pendingConfirmation || null);
      setNeedsContact(Boolean(r.needsContact));
      setContactSaved(Boolean(r.contactSaved));
      if (r.appointment) setAppointment(r.appointment);
      autoSay(r.reply, lang, r.messageId);
    } catch (err) {
      setError(err.message);
      loadAvailability(daypart);
    } finally {
      setSelectingSlot(null);
    }
  };

  const handleSubmitContact = async ({ fullName, phone, consent }) => {
    if (!session) return;
    setSavingContact(true);
    setError(null);
    try {
      const r = await publicApi(slug, `/conversations/${session.conversationId}/contact`, {
        method: 'POST',
        sessionToken: session.sessionToken,
        body: { fullName, phone, consent, language: lang },
      });
      setMessages((m) => [...m, { id: r.messageId, role: 'agent', content: r.reply }]);
      setContactSaved(true);
      setNeedsContact(false);
      setPendingConfirmation(r.pendingConfirmation || null);
      if (r.collectedRequirements) setRequirements(r.collectedRequirements);
      autoSay(r.reply, lang, r.messageId);
    } finally {
      setSavingContact(false);
    }
  };

  const handleEndConversation = async () => {
    if (!session || ending) return;
    setEnding(true);
    setError(null);
    try {
      await publicApi(slug, `/conversations/${session.conversationId}/end`, {
        method: 'POST',
        sessionToken: session.sessionToken,
      });
      setStatus('ended');
      tts.cancel();
      speech.stop();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnding(false);
    }
  };

  const handleStartNew = () => {
    tts.cancel();
    speech.stop();
    customerSessionStore.clear(slug);
    setSession(null);
    setMessages([]);
    setStatus('active');
    setRequirements(null);
    setOfferedSlots([]);
    setPendingConfirmation(null);
    setNeedsContact(false);
    setContactSaved(false);
    setAppointment(null);
    setError(null);
    loadAvailability(daypart);
  };

  const changeLang = (k) => {
    setLang(k);
    speech.stop();
    tts.cancel();
  };

  const ended = status === 'ended';
  const voiceState = speech.listening ? 'listening' : sending ? 'thinking' : tts.speaking ? 'speaking' : 'idle';
  const tenant = overview?.tenant;

  return (
    <div className="min-h-full bg-[#F7F7F2] text-[#202922]">
      {/* Dedicated Customer Top Bar (Strictly Isolated from Admin Console) */}
      <header className="border-b border-[#E2E4DC] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <ProductBrand size="sm" surface="light" />
            <div className="hidden h-6 w-px bg-[#E2E4DC] sm:block" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-[#202922]">
                {tenant?.companyName || 'ABC Developers'} · {tenant?.projectName || 'GreenHaven Residences'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#657168]">
                <MapPin className="size-3 text-[#244D3C]" />
                <span>{tenant?.location || 'Gachibowli, Hyderabad'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#657168]">
            <ShieldCheck className="size-4 text-[#244D3C]" />
            <span>Private guided session</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 lg:px-8 lg:py-8">
        {overviewLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-[#657168]">
            Preparing residence details…
          </div>
        ) : overviewError ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-[#E7BDBD] bg-[#FAE8E8] p-6 text-center text-sm text-[#A93B3B]">
            <div className="font-semibold">Unable to load assistant</div>
            <p className="mt-1">{overviewError}</p>
          </div>
        ) : !session ? (
          <WelcomeScreen
            overview={overview}
            lang={lang}
            onSelectLang={changeLang}
            onStart={startConversation}
            starting={starting}
            sttSupported={speech.supported}
            permission={permission}
            error={error}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
            <div className="min-w-0 space-y-4">
              <CustomerVoiceConsole
                lang={lang}
                onChangeLang={changeLang}
                messages={messages}
                sending={sending}
                ended={ended}
                voiceState={voiceState}
                speech={speech}
                tts={tts}
                autoSpeak={autoSpeak}
                onToggleAutoSpeak={setAutoSpeak}
                onReplay={(m) => say(m.content, lang, m.id)}
                onSend={sendMessage}
                onEnd={handleEndConversation}
                ending={ending}
                pendingConfirmation={pendingConfirmation}
                offeredSlots={offeredSlots}
                hasVoice={hasVoice}
              />

              {error && (
                <div role="alert" className="rounded-xl border border-[#E7BDBD] bg-[#FAE8E8] px-4 py-3 text-sm text-[#A93B3B]">
                  {error}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              {(appointment || ended) && (
                <CompletionCard
                  appointment={appointment}
                  tenant={tenant}
                  ended={ended}
                  onStartNew={handleStartNew}
                />
              )}

              {!ended && !appointment && (
                <VisitBookingPanel
                  slots={slots}
                  loadingSlots={loadingSlots}
                  daypart={daypart}
                  onChangeDaypart={handleChangeDaypart}
                  onSelectSlot={handleSelectSlot}
                  selectingSlot={selectingSlot}
                  pendingConfirmation={pendingConfirmation}
                  onConfirmPending={() => sendMessage('Yes, please confirm')}
                  onDeclinePending={() => sendMessage('No, a different time')}
                  needsContact={needsContact}
                  contactSaved={contactSaved}
                  onSubmitContact={handleSubmitContact}
                  savingContact={savingContact}
                  sending={sending}
                />
              )}

              <ResidenceGuide slug={slug} overview={overview} requirements={requirements} />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
