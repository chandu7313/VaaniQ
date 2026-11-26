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

const canRecord = () => typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
const RECORD_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
// Browser recognition errors after which the server (Whisper) path is a better choice.
const SWITCH_TO_SERVER = new Set(['language-not-supported', 'network', 'service-not-allowed']);
const MAX_RECORDING_MS = 30000;

/**
 * Voice input with two engines:
 *  - 'browser': the Web Speech API (live interim transcript), when available;
 *  - 'server':  record with MediaRecorder and send the clip to `transcribe(blob, 'en'|'hi'|'te')` (Groq Whisper).
 *    Used when the browser has no recognition, or switches automatically after language/network errors.
 * The recording lives only in memory and is discarded after transcription.
 */
export function useSpeechRecognition({ lang, onFinal, transcribe }) {
  const serverPossible = Boolean(transcribe) && canRecord();
  const [mode, setMode] = useState(Recognition ? 'browser' : serverPossible ? 'server' : 'none');
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const mediaRef = useRef(null);
  const timerRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  const transcribeRef = useRef(transcribe);
  useEffect(() => { onFinalRef.current = onFinal; transcribeRef.current = transcribe; }, [onFinal, transcribe]);
  // A page may learn about server transcription after the first render (capabilities load asynchronously).
  useEffect(() => { if (mode === 'none' && serverPossible) setMode('server'); }, [mode, serverPossible]);

  const startBrowser = useCallback(() => {
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
      if (SWITCH_TO_SERVER.has(e.error) && serverPossible) {
        setMode('server');
        setError({ code: e.error, message: 'Browser speech recognition is unavailable for this language here, so VaaniQ switched to server transcription. Press the mic and speak again.', retryable: true });
        return;
      }
      const message = ERRORS[e.error] === undefined ? `Speech recognition error: ${e.error}` : ERRORS[e.error];
      if (message) setError({ code: e.error, message, retryable: RETRYABLE.has(e.error) });
    };
    rec.onend = () => { setListening(false); setInterim(''); };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch (err) { setError({ code: 'start-failed', message: err.message, retryable: true }); }
  }, [lang, serverPossible]);

  const startServer = useCallback(async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError(err.name === 'NotAllowedError'
        ? { code: 'not-allowed', message: ERRORS['not-allowed'], retryable: true }
        : { code: 'audio-capture', message: ERRORS['audio-capture'], retryable: true });
      return;
    }
    const mimeType = RECORD_TYPES.find((t) => window.MediaRecorder.isTypeSupported?.(t));
    const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = async () => {
      clearTimeout(timerRef.current);
      stream.getTracks().forEach((t) => t.stop());
      setListening(false);
      const blob = new Blob(chunks, { type: (recorder.mimeType || mimeType || 'audio/webm').split(';')[0] });
      if (blob.size < 1000) { setInterim(''); setError({ code: 'no-speech', message: ERRORS['no-speech'], retryable: true }); return; }
      setTranscribing(true); setInterim('Transcribing…');
      try {
        const text = await transcribeRef.current(blob, lang.slice(0, 2));
        if (text?.trim()) onFinalRef.current(text.trim());
      } catch (err) {
        setError({ code: err.code || 'stt-failed', message: err.message || 'Transcription failed. Please type instead.', retryable: true });
      } finally {
        setTranscribing(false); setInterim('');
      }
    };
    mediaRef.current = recorder;
    recorder.start();
    setListening(true);
    setInterim('Recording… press the mic again to send');
    timerRef.current = setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, MAX_RECORDING_MS);
  }, [lang]);

  const start = useCallback(() => {
    setError(null);
    if (mode === 'browser') startBrowser();
    else if (mode === 'server') startServer();
  }, [mode, startBrowser, startServer]);

  const stop = useCallback(() => {
    if (mode === 'server') { if (mediaRef.current?.state === 'recording') mediaRef.current.stop(); } else recRef.current?.stop();
  }, [mode]);
  const clearError = useCallback(() => setError(null), []);
  useEffect(() => () => {
    recRef.current?.abort();
    clearTimeout(timerRef.current);
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
  }, []);
  return { supported: mode !== 'none', mode, listening, transcribing, interim, error, start, stop, retry: start, clearError };
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
