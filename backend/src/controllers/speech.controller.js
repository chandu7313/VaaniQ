import { transcribe } from '../services/speech.js';

/** Raw audio body (express.raw) → { text }. Nothing is stored. */
export async function transcribeAudio(req, res) {
  const result = await transcribe({ audio: req.body, mimeType: req.get('content-type'), language: req.valid.query.language });
  res.json({ data: result });
}
