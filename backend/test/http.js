// Shared HTTP test harness: boots the real Express app on a random port against the test database.
import { createApp } from '../src/app.js';
import { DEMO_ADMIN_EMAIL } from '../src/db/seed.js';

export async function startServer() {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (method, path, body, token) => {
    const res = await fetch(`${base}${path}`, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, body: res.status === 204 ? null : await res.json() };
  };
  const login = async (email = DEMO_ADMIN_EMAIL, password = 'test-password-1') => (await request('POST', '/auth/login', { email, password })).body.data.token;
  return { server, request, login };
}
