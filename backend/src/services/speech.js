import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
import { log } from '../lib/logger.js';

// Server-side speech-to-text fallback for browsers whose Web Speech API is missing or cannot recognise the
// selected language. Uses Groq's OpenAI-compatible Whisper endpoint (/openai/v1/audio/transcriptions).
// PRIVACY: audio is held in memory only for the duration of the request and is never written or logged.

// whisper-large-v3 transcribed Hindi and Telugu clearly better than the turbo variant in our tests, at similar latency.
const MODEL = process.env.STT_MODEL || 'whisper-large-v3';
const MAX_BYTES = 5 * 1024 * 1024;
const EXT = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/aac': 'aac', 'audio/x-m4a': 'm4a' };

export const speechCapabilities = () => ({ serverTranscription: config.llm.provider === 'groq' && Boolean(config.llm.apiKey), model: MODEL });

export async function transcribe({ audio, mimeType, language }) {
  if (!speechCapabilities().serverTranscription) throw new AppError(501, 'STT_UNAVAILABLE', 'Server transcription is not configured (needs LLM_PROVIDER=groq with an API key).');
  const base = String(mimeType || '').split(';')[0].trim().toLowerCase();
  if (!EXT[base]) throw new AppError(415, 'UNSUPPORTED_AUDIO', `Unsupported audio type: ${base || 'none'}`);
  if (!audio?.length || audio.length < 1000) throw new AppError(400, 'AUDIO_TOO_SHORT', 'The recording was too short. Please speak a little longer.');
  if (audio.length > MAX_BYTES) throw new AppError(413, 'AUDIO_TOO_LARGE', 'Recordings are limited to 5 MB (about 30 seconds).');

  const form = new FormData();
  form.append('file', new Blob([audio], { type: base }), `speech.${EXT[base]}`);
  form.append('model', MODEL);
  form.append('response_format', 'json');
  form.append('temperature', '0');
  if (language) form.append('language', language); // ISO-639-1: en, hi, te

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.llm.timeoutMs);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST', headers: { authorization: `Bearer ${config.llm.apiKey}` }, body: form, signal: ctrl.signal,
    });
    if (!res.ok) {
      log.warn('stt_http_error', { status: res.status });
      throw new AppError(502, 'STT_FAILED', `Speech service returned HTTP ${res.status}. Please type instead.`);
    }
    const text = String((await res.json())?.text ?? '').trim();
    if (!text) throw new AppError(422, 'NO_SPEECH', 'No speech was recognised. Please try again or type instead.');
    return { text: text.slice(0, 1000), model: MODEL };
  } catch (err) {
    if (err.name === 'AbortError') throw new AppError(504, 'STT_TIMEOUT', 'The speech service took too long. Please try again or type instead.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
