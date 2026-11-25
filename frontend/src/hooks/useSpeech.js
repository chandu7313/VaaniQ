import { useCallback, useEffect, useRef, useState } from 'react';

// Browser Web Speech API. Feature-detected: when unavailable the UI falls back to typing.
// Note: in Chrome, recognition audio is processed by the browser vendor's speech service;
// VaaniQ itself never receives or stores audio, only the final transcript text.
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

const ERRORS = {
  'not-allowed': 'Microphone permission was denied. Allow it in the browser, or type instead.',
  'service-not-allowed': 'Speech recognition is blocked in this browser. Please type instead.',
  'no-speech': 'No speech detected. Tap the mic and try again.',
  'audio-capture': 'No microphone found. Please type instead.',
  network: 'Speech service unreachable (network). Please type instead.',
  'language-not-supported': 'This browser cannot recognise speech in the selected language. Please type instead.',
};

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
    rec.onerror = (e) => { if (e.error !== 'aborted') setError(ERRORS[e.error] || `Speech recognition error: ${e.error}`); };
    rec.onend = () => { setListening(false); setInterim(''); };
    recRef.current = rec;
    setError(null);
    try { rec.start(); setListening(true); } catch (err) { setError(err.message); }
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);
  useEffect(() => () => recRef.current?.abort(), []);
  return { supported: Boolean(Recognition), listening, interim, error, start, stop };
}

export function useSpeechSynthesis() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', load); window.speechSynthesis.cancel(); };
  }, [supported]);

  const hasVoice = useCallback((bcp47) => voices.some((v) => v.lang.toLowerCase().startsWith(bcp47.slice(0, 2))), [voices]);

  /** Speaks text with a voice for the language; returns false when no such voice is installed. */
  const speak = useCallback((text, bcp47) => {
    if (!supported) return false;
    const voice = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase()) || voices.find((v) => v.lang.toLowerCase().startsWith(bcp47.slice(0, 2)));
    if (!voice) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/₹/g, 'Rupees '));
    u.voice = voice; u.lang = voice.lang; u.rate = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    return true;
  }, [supported, voices]);

  const cancel = useCallback(() => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false); }, [supported]);
  return { supported, speaking, speak, cancel, hasVoice };
}
