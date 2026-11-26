// VaaniQ load test (no dependencies). Run it ONLY against an isolated instance in DEMO_MODE with a
// throwaway database and raised rate limits (see docs/LOAD_TEST.md), never against production or a live LLM.
//   BASE=http://localhost:4200/api PW=<seed admin password> node scripts/loadtest.mjs
const base = process.env.BASE || 'http://localhost:4200/api';
const pct = (a, p) => a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))];
async function req(method, path, body, token) {
  const t0 = performance.now();
  const res = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => null);
  return { ms: performance.now() - t0, status: res.status, json };
}
async function run(name, total, concurrency, task) {
  const lat = []; let errors = 0; let i = 0; const statuses = {};
  const t0 = performance.now();
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (i < total) { const n = i++; try { const r = await task(n); lat.push(r.ms); statuses[r.status] = (statuses[r.status] || 0) + 1; if (r.status >= 400) errors++; } catch { errors++; } }
  }));
  const secs = (performance.now() - t0) / 1000; lat.sort((a, b) => a - b);
  const row = { scenario: name, requests: total, concurrency, 'req/s': (total / secs).toFixed(1), p50_ms: pct(lat, 50).toFixed(1), p95_ms: pct(lat, 95).toFixed(1), p99_ms: pct(lat, 99).toFixed(1), max_ms: lat.at(-1).toFixed(1), errors, statuses: JSON.stringify(statuses) };
  console.log(JSON.stringify(row));
  return row;
}
const token = (await req('POST', '/auth/login', { email: 'admin@abcdevelopers.demo', password: process.env.PW })).json.data.token;
const warm = await req('GET', '/health');
const rows = [];
rows.push(await run('GET /health', 3000, 50, () => req('GET', '/health')));
rows.push(await run('GET /leads (auth + DB read)', 2000, 50, () => req('GET', '/leads', null, token)));
rows.push(await run('POST /knowledge/search (BM25)', 2000, 50, () => req('POST', '/knowledge/search', { query: 'price of 3BHK and amenities', k: 3 }, token)));
const questions = ['What is the price of a 3BHK?', 'What is the kitchen specification?', 'Which schools are nearby?', 'I need a 3BHK in Gachibowli, budget 90 lakhs, buying next month', 'What would my EMI be for a 70 lakh loan?', 'Can I visit on Sunday?'];
for (const c of [10, 25, 50]) {
  const convs = await Promise.all(Array.from({ length: c }, async () => (await req('POST', '/conversations', { language: 'en' }, token)).json.data.conversation.id));
  rows.push(await run('agent turn (full pipeline, demo mode)', c * 12, c, (n) => req('POST', `/conversations/${convs[n % c]}/messages`, { text: questions[n % questions.length] }, token)));
}
// Booking race: 100 different customers, 10 slots, all at once.
const slots = (await req('GET', '/appointments/availability?limit=10', null, token)).json.data;
const leads = await Promise.all(Array.from({ length: 100 }, async (_, k) => (await req('POST', '/leads', { fullName: `Load Tester ${k}`, phone: `+9198${String(10000000 + k).slice(0, 8)}` }, token)).json.data.leadId));
const t0 = performance.now();
const results = await Promise.all(leads.map((leadId, k) => req('POST', '/appointments', { leadId, startsAt: slots[k % 10].startsAt }, token)));
const ok = results.filter((r) => r.status === 201).length, taken = results.filter((r) => r.json?.error?.code === 'SLOT_TAKEN').length;
console.log(JSON.stringify({ scenario: 'booking race: 100 customers x 10 slots', succeeded: ok, slot_taken: taken, other: 100 - ok - taken, ms: (performance.now() - t0).toFixed(0) }));
