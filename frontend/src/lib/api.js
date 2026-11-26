// Thin fetch wrapper: attaches the bearer token and unwraps the { data } / { error } envelope.
const TOKEN_KEY = 'vaaniq_token';

export const tokenStore = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable: token stays in memory only */ } },
  clear: () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(status, code, message, details) { super(message); this.status = status; this.code = code; this.details = details; }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

/** rawBody: send a Blob as-is (e.g. recorded audio) with its own content type instead of JSON. */
export async function api(path, { method = 'GET', body, rawBody, signal } = {}) {
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method, signal,
      headers: { ...(rawBody ? { 'content-type': rawBody.type } : body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: rawBody ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the VaaniQ server. Is the backend running?');
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login') onUnauthorized();
    throw new ApiError(res.status, json.error?.code, json.error?.message || `Request failed (${res.status})`, json.error?.details);
  }
  return json.data;
}
