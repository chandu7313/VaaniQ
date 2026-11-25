import { useCallback, useEffect, useRef, useState } from 'react';

// Browser Web Speech API, feature-detected. When unavailable the UI falls back to typing.
// Privacy: VaaniQ never records or stores audio. Recognition runs in the browser; in Chrome the
// browser vendor's speech service processes it. Only the final transcript TEXT is sent to the server.
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

const ERRORS = {
  'not-allowed': 'Microphone permission was denied. Allow it in the browser address bar, then press Retry, or type instead.',
  'service-not-allowed': 'Speech recognition is blocked in this browser. Please type instead.',
  'no-speech': 'No speech was detected. Press Retry and speak after the tone, or type instead.',
  'audio-capture': 'No microphone was found. Connect one and press Retry, or type instead.',
  network: 'The browser speech service could not be reached (network). Press Retry, or type instead.',
  'language-not-supported': 'This browser cannot recognise speech in the selected language. Please type instead.',
  aborted: null,
};
const RETRYABLE = new Set(['no-speech', 'network', 'audio-capture', 'not-allowed']);

/** Microphone permission state where the Permissions API supports it: granted | denied | prompt | unknown. */
export function useMicPermission() {
  const [state, setState] = useState('unknown');
  useEffect(() => {
    let status;
    const onChange = () => setState(status.state);
    navigator.permissions?.query({ name: 'microphone' })
      .then((s) => { status = s; setState(s.state); s.addEventListener('change', onChange); })
      .catch(() => setState('unknown')); // e.g. Firefox/Safari do not expose microphone permission state
    return () => status?.removeEventListener('change', onChange);
  }, []);
  return state;
}

export function useSpeechRecognition({ lang, onFinal }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);

  const start = useCallback(() => {
    if (!Recognition) return;
    recRef.current?.abort();
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interimText = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else interimText += r[0].transcript;
      }
      setInterim(interimText || finalText);
      if (finalText.trim()) onFinalRef.current(finalText.trim());
    };
    rec.onerror = (e) => {
      const message = ERRORS[e.error] === undefined ? `Speech recognition error: ${e.error}` : ERRORS[e.error];
      if (message) setError({ code: e.error, message, retryable: RETRYABLE.has(e.error) });
    };
    rec.onend = () => { setListening(false); setInterim(''); };
    recRef.current = rec;
    setError(null);
    try { rec.start(); setListening(true); } catch (err) { setError({ code: 'start-failed', message: err.message, retryable: true }); }
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);
  const clearError = useCallback(() => setError(null), []);
  useEffect(() => () => recRef.current?.abort(), []);
  return { supported: Boolean(Recognition), listening, interim, error, start, stop, retry: start, clearError };
}

export function useSpeechSynthesis() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', load); window.speechSynthesis.cancel(); };
  }, [supported]);

  /** Voices installed in this browser for a language (e.g. 'te-IN' -> all 'te*' voices). Often empty for Telugu. */
  const voicesFor = useCallback((bcp47) => voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(bcp47.slice(0, 2).toLowerCase())), [voices]);

  /**
   * Speaks text with the preferred voice (voiceURI) if it is installed, otherwise the best match for the
   * language. Returns false when the browser has no voice for that language, so the UI can say so.
   */
  const speak = useCallback((text, bcp47, { voiceURI, rate = 1, id = null } = {}) => {
    if (!supported) return false;
    const candidates = voicesFor(bcp47);
    const voice = candidates.find((v) => v.voiceURI === voiceURI)
      || candidates.find((v) => v.lang.toLowerCase().replace('_', '-') === bcp47.toLowerCase())
      || candidates[0];
    if (!voice) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/₹/g, 'Rupees '));
    u.voice = voice; u.lang = voice.lang; u.rate = rate;
    u.onstart = () => { setSpeaking(true); setSpeakingId(id); };
    u.onend = () => { setSpeaking(false); setSpeakingId(null); };
    u.onerror = () => { setSpeaking(false); setSpeakingId(null); };
    window.speechSynthesis.speak(u);
    return true;
  }, [supported, voicesFor]);

  const cancel = useCallback(() => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false); setSpeakingId(null); }, [supported]);
  return { supported, voices, voicesFor, speaking, speakingId, speak, cancel, hasVoice: (bcp47) => voicesFor(bcp47).length > 0 };
}
