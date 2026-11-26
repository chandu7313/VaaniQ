import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetDb, pool } from './helpers.js';
import { startServer } from './http.js';
import { config } from '../src/config.js';

let h; let token;
const realFetch = globalThis.fetch;
const saved = { ...config.llm };
const audio = Buffer.alloc(4000, 1); // stands in for a short recorded clip

before(async () => { await resetDb(); h = await startServer(); token = await h.login(); });
afterEach(() => { globalThis.fetch = realFetch; Object.assign(config.llm, saved); });
after(async () => { h.server.close(); await pool.end(); });

const base = () => `http://127.0.0.1:${h.server.address().port}/api`;
const post = (path, body, headers = {}) => realFetch(base() + path, { method: 'POST', headers, body }).then(async (r) => ({ status: r.status, body: await r.json() }));
const groqOn = () => Object.assign(config.llm, { provider: 'groq', apiKey: 'test-key' });

test('transcription requires sign-in and reports 501 when no provider is configured (demo mode)', async () => {
  assert.equal((await post('/speech/transcribe', audio, { 'content-type': 'audio/webm' })).status, 401);
  const r = await post('/speech/transcribe?language=te', audio, { 'content-type': 'audio/webm', authorization: `Bearer ${token}` });
  assert.deepEqual([r.status, r.body.error.code], [501, 'STT_UNAVAILABLE']);
});

test('rejects non-audio, too-short audio and invalid language', async () => {
  groqOn();
  const auth = { authorization: `Bearer ${token}` };
  assert.equal((await post('/speech/transcribe', 'hello', { ...auth, 'content-type': 'audio/x-unknown' })).body.error.code, 'UNSUPPORTED_AUDIO');
  assert.equal((await post('/speech/transcribe', Buffer.alloc(10), { ...auth, 'content-type': 'audio/webm' })).body.error.code, 'AUDIO_TOO_SHORT');
  assert.equal((await post('/speech/transcribe?language=fr', audio, { ...auth, 'content-type': 'audio/webm' })).status, 400);
});

test('sends the clip to Groq Whisper with model + language, returns text, stores nothing', async () => {
  groqOn();
  let seen;
  globalThis.fetch = async (url, init) => {
    if (!String(url).startsWith('https://api.groq.com')) return realFetch(url, init);
    seen = { url: String(url), auth: init.headers.authorization, form: init.body };
    return { ok: true, status: 200, json: async () => ({ text: ' 3BHK ధర ఎంత? ' }) };
  };
  const r = await post('/speech/transcribe?language=te', audio, { 'content-type': 'audio/webm;codecs=opus', authorization: `Bearer ${token}` });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.text, '3BHK ధర ఎంత?');
  assert.equal(seen.url, 'https://api.groq.com/openai/v1/audio/transcriptions');
  assert.equal(seen.auth, 'Bearer test-key');
  assert.equal(seen.form.get('model'), 'whisper-large-v3');
  assert.equal(seen.form.get('language'), 'te');
  assert.equal(seen.form.get('file').type, 'audio/webm');
  assert.equal(seen.form.get('file').size, audio.length);
});

test('upstream failure becomes a clear 502; public route needs a customer session', async () => {
  groqOn();
  globalThis.fetch = async (url, init) => (String(url).startsWith('https://api.groq.com') ? { ok: false, status: 503, json: async () => ({}) } : realFetch(url, init));
  const r = await post('/speech/transcribe?language=en', audio, { 'content-type': 'audio/webm', authorization: `Bearer ${token}` });
  assert.deepEqual([r.status, r.body.error.code], [502, 'STT_FAILED']);
  assert.match(r.body.error.message, /type instead/);
  const pub = await post('/public/abc-developers/conversations/00000000-0000-0000-0000-000000000000/transcribe?language=en', audio, { 'content-type': 'audio/webm' });
  assert.equal(pub.status, 401);
});
