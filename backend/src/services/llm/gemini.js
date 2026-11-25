import { postJson, LlmError } from './http.js';

// Gemini REST generateContent (https://ai.google.dev/api/generate-content):
// POST /v1beta/models/{model}:generateContent with header x-goog-api-key.
// JSON mode: generationConfig.responseMimeType = "application/json".
export function createGeminiProvider({ apiKey, model, timeoutMs }) {
  async function chat({ system, messages, json = false, temperature = 0.2 }) {
    const data = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      provider: 'gemini', timeoutMs,
      headers: { 'x-goog-api-key': apiKey },
      body: {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature, ...(json ? { responseMimeType: 'application/json' } : {}) },
      },
    });
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
    if (!text) throw new LlmError('gemini returned no content');
    return text;
  }
  return { name: `gemini:${model}`, isDemo: false, chat };
}
