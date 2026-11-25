import { postJson, LlmError } from './http.js';

// Groq exposes an OpenAI-compatible Chat Completions API at https://api.groq.com/openai/v1
// (https://console.groq.com/docs/openai). JSON mode: response_format {type:"json_object"}.
export function createGroqProvider({ apiKey, model, timeoutMs }) {
  async function chat({ system, messages, json = false, temperature = 0.2 }) {
    const data = await postJson('https://api.groq.com/openai/v1/chat/completions', {
      provider: 'groq', timeoutMs,
      headers: { authorization: `Bearer ${apiKey}` },
      body: {
        model, temperature,
        messages: [{ role: 'system', content: system }, ...messages],
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      },
    });
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new LlmError('groq returned no content');
    return text;
  }
  return { name: `groq:${model}`, isDemo: false, chat };
}
