// Dedicated public API helper for the Customer Experience Interface.
// Completely isolated from admin sessionStorage tokens and admin APIs.

export class PublicApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const sessionKey = (slug) => `vaaniq_customer_session_${slug}`;

export const customerSessionStore = {
  get(slug) {
    try {
      const raw = sessionStorage.getItem(sessionKey(slug));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(slug, session) {
    try {
      sessionStorage.setItem(sessionKey(slug), JSON.stringify(session));
    } catch {
      /* ignore */
    }
  },
  clear(slug) {
    try {
      sessionStorage.removeItem(sessionKey(slug));
    } catch {
      /* ignore */
    }
  },
};

export async function publicApi(slug, path, { method = 'GET', body, rawBody, sessionToken, signal } = {}) {
  let res;
  try {
    res = await fetch(`/api/public/${encodeURIComponent(slug)}${path}`, {
      method,
      signal,
      headers: {
        ...(rawBody ? { 'content-type': rawBody.type } : body ? { 'content-type': 'application/json' } : {}),
        ...(sessionToken ? { 'x-customer-session': sessionToken } : {}),
      },
      body: rawBody ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new PublicApiError(0, 'NETWORK_ERROR', 'Unable to connect right now. Please try again in a moment.');
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PublicApiError(
      res.status,
      json.error?.code,
      json.error?.details?.[0]?.message || json.error?.message || `Request failed (${res.status})`,
      json.error?.details,
    );
  }
  return json.data;
}
