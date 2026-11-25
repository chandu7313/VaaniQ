import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BCP47 } from '../lib/format';
import { publicApi, customerSessionStore } from '../lib/publicApi';
import { useSpeechRecognition, useSpeechSynthesis, useMicPermission } from '../hooks/useSpeech';
import { ConversationHeader } from '../components/customer/BrandHeader';
import WelcomeScreen from '../components/customer/WelcomeScreen';
import CustomerVoiceConsole from '../components/customer/CustomerVoiceConsole';
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

  const [session, setSession] = useState(null);
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
  const [showCompletion, setShowCompletion] = useState(false);

  const [slots, setSlots] = useState([]);
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

  const loadAvailability = useCallback(async () => {
    try {
      const data = await publicApi(slug, '/availability?limit=48');
      setSlots(data || []);
    } catch {
      // Keep current slots if refresh fails transiently
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);

    (async () => {
      try {
        const [data, avail] = await Promise.all([
          publicApi(slug, '/overview'),
          publicApi(slug, '/availability?limit=48').catch(() => []),
        ]);
        if (cancelled) return;
        setOverview(data);
        setSlots(avail?.length ? avail : data.availableSlots || []);

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
            if (restored.appointment || restored.conversationStatus === 'ended') {
              setShowCompletion(true);
            }
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
      setShowCompletion(false);
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
        if (r.collectedRequirements) setRequirements(r.collectedRequirements);
        setStatus(r.conversationStatus || 'active');

        if (r.appointment) {
          setAppointment(r.appointment);
          setShowCompletion(true);
          loadAvailability();
          // Also finalize call summary in PostgreSQL when booking completes
          publicApi(slug, `/conversations/${session.conversationId}/end`, {
            method: 'POST',
            sessionToken: session.sessionToken,
          }).catch(() => {});
        }
        autoSay(r.reply, r.language || lang, r.messageId);
      } catch (err) {
        setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, failed: err.message } : x)));
        setError(err.message);
      } finally {
        setSending(false);
      }
    },
    [session, sending, status, slug, lang, autoSay, loadAvailability],
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
      const refreshed = await publicApi(slug, `/conversations/${session.conversationId}`, {
        sessionToken: session.sessionToken,
      });
      setMessages(refreshed.messages || []);
      setPendingConfirmation(r.pendingConfirmation || null);
      setNeedsContact(Boolean(r.needsContact));
      setContactSaved(Boolean(r.contactSaved));
      if (r.appointment) {
        setAppointment(r.appointment);
        setShowCompletion(true);
      }
      autoSay(r.reply, lang, r.messageId);
    } catch (err) {
      setError(err.message);
      loadAvailability();
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
      setShowCompletion(true);
      tts.cancel();
      speech.stop();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnding(false);
    }
  };

  const handleExploreMore = () => {
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
    setShowCompletion(false);
    setError(null);
    loadAvailability();
  };

  const changeLang = (k) => {
    setLang(k);
    speech.stop();
    tts.cancel();
  };

  if (overviewLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F7F7F2] text-sm text-[#657168]">
        Loading GreenHaven Residences…
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F7F7F2] p-6">
        <div className="max-w-md rounded-2xl border border-[#E7BDBD] bg-[#FAE8E8] p-6 text-center text-sm text-[#A93B3B]">
          <div className="font-semibold">Unable to load assistant</div>
          <p className="mt-1">{overviewError}</p>
        </div>
      </div>
    );
  }

  // Screen 1: Welcome / Hero Landing
  if (!session) {
    return (
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
    );
  }

  const ended = status === 'ended';
  const voiceState = speech.listening ? 'listening' : sending ? 'thinking' : tts.speaking ? 'speaking' : 'idle';
  const tenant = overview?.tenant;

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F2] text-[#202922]">
      <ConversationHeader
        companyName={tenant?.companyName}
        lang={lang}
        onChangeLang={changeLang}
        onEnd={handleEndConversation}
        ending={ending}
        ended={ended || showCompletion}
      />

      {error && (
        <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6">
          <div role="alert" className="rounded-xl border border-[#E7BDBD] bg-[#FAE8E8] px-4 py-2.5 text-sm text-[#A93B3B]">
            {error}
          </div>
        </div>
      )}

      {showCompletion ? (
        <CompletionCard
          appointment={appointment}
          tenant={tenant}
          onExploreMore={handleExploreMore}
          onViewTranscript={() => setShowCompletion(false)}
        />
      ) : (
        <CustomerVoiceConsole
          lang={lang}
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
          overview={overview}
          requirements={requirements}
          slots={slots}
          selectingSlot={selectingSlot}
          onSelectSlot={handleSelectSlot}
          pendingConfirmation={pendingConfirmation}
          offeredSlots={offeredSlots}
          needsContact={needsContact}
          contactSaved={contactSaved}
          onSubmitContact={handleSubmitContact}
          savingContact={savingContact}
          hasVoice={hasVoice}
        />
      )}
    </div>
  );
}
