import { log } from '../../lib/logger.js';

export class LlmError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

/** fetch with timeout; never logs the request body or API key. */
export async function postJson(url, { headers, body, timeoutMs, provider }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) {
      log.warn('llm_http_error', { provider, status: res.status });
      throw new LlmError(`${provider} returned HTTP ${res.status}`, res.status);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new LlmError(`${provider} timed out after ${timeoutMs}ms`, 504);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
