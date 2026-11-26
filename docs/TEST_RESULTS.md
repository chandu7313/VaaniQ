# Test Results

Run date: 2026-11-26 · Node v26.0.0 · PostgreSQL 18.1 (local) · LLM: DEMO_MODE + injected mock providers in tests; Groq verified live separately (see QA_REPORT.md).

## Backend: `cd backend && npm test`

```
✔ A. collects missing information turn by turn (197.810167ms)
✔ B. retrieves relevant documents with sources (11.439583ms)
✔ C. qualifies the customer and shows an explainable score (7.192875ms)
✔ D. checks real availability, collects contact, and PROPOSES (not books) a slot (29.891542ms)
✔ E. books only after explicit confirmation, inside a transaction, and confirms (7.530417ms)
✔ F. duplicate booking: the same customer cannot book a second visit (9.366542ms)
✔ G. booking conflict: slot taken between proposal and confirmation is refused and re-offered (25.1455ms)
✔ H. produces and persists the structured call summary (9.951334ms)
✔ I. decision trace and audit trail are complete and contain no raw phone numbers (1.110666ms)
✔ J. a proposal left unconfirmed at the end of a call is reported as NOT booked (17.734959ms)
✔ booking tool refuses to run without customer confirmation (90.65775ms)
✔ confirmation of a DIFFERENT slot than proposed is refused (1.09675ms)
✔ expired proposal is refused (0.547667ms)
✔ unknown tools and invalid arguments are rejected before execution (1.823291ms)
✔ LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking (26.358167ms)
✔ LLM failure falls back to rules and is recorded in the trace (9.600084ms)
✔ LLM analysis with null fields is accepted (not rejected as invalid) (4.973334ms)
✔ malformed (non-JSON) LLM output falls back to rules and is recorded (3.983333ms)
✔ grounding guard: an LLM answer with a computed/invented figure is replaced by the verbatim source (5.24425ms)
✔ response contract: every structured field is present and the pipeline events are recorded (184.730625ms)
✔ 1. pricing question: answered from the Price list with sources, no invented figures (12.273917ms)
✔ 2. unsupported question: explicit fallback, no sources, nothing made up (8.157708ms)
✔ 3. budget change mid-conversation: newer value wins and the score is recomputed (14.193541ms)
✔ 4. follow-up question uses the previous topic from memory (12.440042ms)
✔ 5. language switch: replies follow the newly selected language and it is persisted (66.921834ms)
✔ 6. incomplete information: nothing is invented and the agent asks for what is missing (6.702333ms)
✔ sessions never mix: two concurrent customers keep separate memory, leads and slots (31.76925ms)
✔ structured action proposal: suggestedAction mirrors backend state, not model text (19.28525ms)
✔ memory never turns an unsupported question into an answer about the previous topic (14.471667ms)
✔ a loan amount is not mistaken for a budget; "payment schedule" is not a visit request (regressions) (21.9525ms)
✔ demo-mode answer combines the most relevant sentences across close sections (15.378583ms)
✔ scenario: extracts requirements without inventing missing fields (7.376709ms)
✔ scenario: visit request is the primary intent and info request is secondary (2.799167ms)
✔ budget parsing across units and languages (0.24025ms)
✔ contact details, day and time parsing (2.018917ms)
✔ confirm/decline only recognised when something is pending (2.340416ms)
✔ human escalation request is detected (0.073209ms)
✔ sentiment: positive, negative, negated and neutral with evidence (57.215541ms)
✔ lead score for the scenario is explainable and lists missing info (1.166292ms)
✔ empty profile scores 0 and booking adds full appointment points (0.136083ms)
✔ budget below range earns partial points (0.1125ms)
✔ "I'm <Name>" is a name, "I am looking" is not (regression) (0.133042ms)
✔ Hindi and Telugu names keep their vowel signs (regression) (0.606541ms)
✔ "This is great!" is not a name, "This is Priya" is (regression) (0.111208ms)
✔ every factor lists its evidence; no evidence means no points; next action is recommended (0.194916ms)
✔ sentiment declares it is transcript-text based, not voice emotion (0.076084ms)
✔ health check and authentication (183.07275ms)
✔ request validation returns a consistent error envelope (11.397209ms)
✔ full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise (133.687167ms)
✔ declining a proposal books nothing (19.25525ms)
✔ unknown information is not invented (7.598917ms)
✔ human escalation and Hindi conversation (32.024958ms)
✔ tenant isolation: another tenant cannot read this tenant's data (69.651083ms)
✔ deleting a user revokes their existing token immediately (64.917666ms)
✔ knowledge base: ingest, search with citations, delete (6.866458ms)
✔ slots respect visiting hours, working days and minimum lead time (88.253334ms)
✔ booking is persisted, removes the slot, and blocks a second booking of that slot (4.413541ms)
✔ concurrent bookings of the same slot: exactly one succeeds (6.662458ms)
✔ a lead cannot hold two upcoming visits; out-of-policy times are rejected (2.285958ms)
✔ repeat caller: phone match merges the temporary lead into the existing one (3.386292ms)
✔ leads: create (scored, deduplicated), read, update, delete, all persisted (236.593083ms)
✔ customers: a view over identified leads with full CRUD (17.071625ms)
✔ conversations: create, read, delete cascades messages/traces (36.681916ms)
✔ appointments: staff create via tool, read, reschedule, status, delete; duplicate + conflict rejected (35.311917ms)
✔ call summaries: generate, list, read, annotate, delete (19.239541ms)
✔ dashboard KPIs equal direct database counts (no hardcoded analytics) (8.361458ms)
✔ RLS: a non-owner role (like Supabase anon) sees no rows even with SELECT granted (77.286125ms)
✔ database errors are explained without leaking the connection string (0.145958ms)
✔ seed is repeatable and demo lead scores come from the scoring model (3.556125ms)
✔ PII masking hides phone numbers but never corrupts UUIDs (regression) (0.46175ms)
✔ public overview resolves allowed slug only and hides internal policies (120.107958ms)
✔ public knowledge search excludes internal policies (9.978375ms)
✔ public session isolation blocks cross-conversation access and admin APIs (16.674583ms)
✔ full public customer journey persists to PostgreSQL and is visible in Business Admin Panel without leaking CRM/trace publicly (96.032292ms)
✔ Groq adapter: OpenAI-compatible request with JSON mode and bearer key; parses content (142.919666ms)
✔ Gemini adapter: generateContent with x-goog-api-key and JSON mime type; parses candidates (0.289541ms)
✔ providers: HTTP errors, timeouts and empty responses become LlmErrors (never hang, never leak the key) (151.865125ms)
✔ GET /llm/health: demo mode, healthy provider, unavailable provider (11.582917ms)
✔ rate limit answers 429 in the JSON error envelope (5.584084ms)
✔ database outage errors map to 503 SERVICE_UNAVAILABLE with a clear message (7.481958ms)
✔ duplicate concurrent requests: two simultaneous "yes" book exactly once, no confusing failure (74.084375ms)
✔ invalid slot requests: out-of-hours time via agent is never booked; malformed/out-of-policy via API rejected (16.339667ms)
✔ SQL injection payloads are treated as data (parameterized queries) (46.001ms)
✔ stored XSS payloads are persisted and returned as inert text (12.61ms)
✔ cross-tenant: every CRM/tool endpoint hides other tenants' records (109.434917ms)
✔ prompt injection in a customer message cannot trigger a booking or reveal configuration (7.158292ms)
✔ chunker keeps section headings for attribution (76.564709ms)
✔ chunker flags prompt-injection text (0.107917ms)
✔ BM25 ranks the matching document first and bounds relevance to 0..1 (1.198417ms)
✔ retrieval answers pricing question from the pricing document with a section (2.074167ms)
✔ retrieval returns nothing for an off-topic query (no forced citation) (0.118834ms)
✔ Hindi price query is expanded to English keywords (1.450417ms)
✔ flagged chunks are excluded from retrieval (1.871917ms)
✔ tokenizer does not split words containing "rs" (regression) (0.196792ms)
✔ parenthetical notes are not indexed as standalone chunks (0.083291ms)
✔ reindex replaces old chunks with the current chunker output (15.11025ms)
✔ "three bedroom" and "3 bed room" retrieve the same documents as "3BHK" (regression) (0.218792ms)
✔ new company documents answer their topics; off-topic questions find nothing (0.702ms)
✔ re-seeding syncs demo documents and never touches user-uploaded ones (5.685417ms)
✔ registry exposes exactly the nine controlled tools with metadata (76.913125ms)
✔ every execution returns a structured record and writes an audit row (even rejections) (5.663417ms)
✔ authorization: resources from another tenant are rejected and never recorded (1.84375ms)
✔ consent: agent needs the customer's confirmation; a signed-in staff member is the confirming human (18.87875ms)
✔ saveLead deduplicates by phone; calculateLeadScore is pure; audit args are PII-masked (5.773792ms)
✔ generateCallSummary and escalateToHuman persist their results (7.57375ms)
ℹ tests 105
ℹ suites 0
ℹ pass 105
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4959.4515
```

| Suite | Covers |
|---|---|
| `rag.test.js` | chunking with sections, injection flagging, BM25 ranking and relevance bounds, pricing retrieval, off-topic → no hits, Hindi query expansion, flagged chunks excluded, tokenizer regression |
| `analysis.test.js` | scenario extraction (no invented fields), intents, budget parsing EN/HI/TE, contact/day/time parsing, consent only when pending, escalation phrase, sentiment incl. negation and HI/TE, scenario score 74 with reasons, partial budget credit, name-parsing regressions |
| `booking.test.js` | slot policy (hours, Sunday, lead time), persistence and slot removal, SLOT_TAKEN, **5 concurrent bookings → exactly 1 succeeds**, one upcoming visit per lead, out-of-policy rejection, repeat-caller merge |
| `api.test.js` | health, auth (401s), validation envelope, **full scenario over HTTP** (74 → proposal → no booking yet → yes → booked → 77 → 87 → summary → ended → 409), decline books nothing, unknown info not invented, escalation, Hindi turn, **tenant isolation**, knowledge ingest/search/delete |
| `database.test.js` | **row-level security hides every row from a non-owner role** (as Supabase's anon key would be), DB error messages never leak the URL, seed is repeatable and demo lead scores equal the scoring model's output |
| `qa.test.js` | Groq/Gemini adapters (request shape, JSON mode, auth header, HTTP 429, empty response, 150 ms timeout, no key in errors); `/llm/health` demo/ok/down; JSON 429 envelope; DB outage → 503 (internals never leak); two simultaneous "yes" → exactly one booking, serialized turns; out-of-hours slot via agent and API rejected; SQL-injection payloads inert and no hash leakage; stored XSS kept as inert text; **21 cross-tenant endpoint checks return 404 and 7 list endpoints return nothing**; prompt injection cannot book or reveal config |
| `acceptance.test.js` | **end-to-end acceptance scenario verified against PostgreSQL rows**: collects missing info, cites the Price list, scores 77 (hot) with evidence, offers only free slots, proposal ≠ appointment, books after "yes" (row confirmed, reference matches, score 92, audit success), duplicate booking refused (agent + staff), slot conflict between proposal and yes refused and re-offered (1 row for the slot, audit SLOT_TAKEN), summary persisted (high intent, outcome confirmed), 9 complete traces with no raw phone, unconfirmed proposal reported as not booked |
| `crm.test.js` | CRUD for leads (dedupe by phone, computed fields not writable), customers (view over identified leads), conversations (cascade delete), appointments (staff booking via tool; SLOT_TAKEN / LEAD_ALREADY_BOOKED / MISSING_CONTACT), call summaries (annotate only); admin-only deletes (403 for sales role); every step checked in the DB |
| `tools.test.js` | exactly 9 tools; structured record + audit row for success and rejection; cross-tenant ids rejected and never recorded; actor checks; agent needs customer consent, staff is the confirming human; saveLead dedupe; calculateLeadScore persists nothing; audit args PII-masked; summary/escalation persisted |
| `ai-lifecycle.test.js` | **the six AI situations over HTTP**: pricing (Price list cited, 3BHK figure quoted), unsupported question (fallback, no sources, no figures), budget change (75L replaces 90L, budget factor 25→10), follow-up ("How big are they?" uses remembered topic), language switch (EN→HI persisted), incomplete info (nothing invented, asks budget); response contract + pipeline events; concurrent sessions never mix; suggested action mirrors backend state; memory never answers an unsupported question with the old topic |
| `agent-guards.test.js` | booking refused without consent, for a different slot, or when expired; unknown tool / invalid args rejected; **LLM "confirm" cannot book**; fabricated sentiment evidence rejected; LLM failure → rule fallback recorded in trace |

## Other checks

| Check | Result |
|---|---|
| `cd backend && npm run lint` (syntax check) | 82/82 files passed |
| `cd frontend && npm run lint` (ESLint + react-hooks) | 0 problems |
| `cd frontend && npm run build` (Vite) | success, pages code-split |
| `npm audit` backend (prod) / frontend | 0 vulnerabilities / 0 vulnerabilities |
| `docker compose config` | valid |
| Backend booted against the Supabase `DATABASE_URL` (probe on port 4100) | Direct host unreachable over IPv4: logs `database_unreachable`, `/api/health` → `503 DB_UNAVAILABLE` with the pooler hint |
| Manual browser run (Chrome pane, 1440px and 375px) | Full scenario completed via UI; all 9 pages (plus login) loaded with no console errors |
| Manual API runs in EN, HI, TE (demo script lines) | Outcomes as documented in DEMO_SCRIPT.md |
| Live run of the six AI situations through the Vite proxy | All six behaved as specified (pricing, fallback, budget change, follow-up, EN→HI→TE switch, incomplete info) |
| Live acceptance run + direct `psql` verification | lead (Suresh Babu, 3BHK Gachibowli ₹90L approx, 1 month, self, visit_scheduled, 92), appointment confirmed 26 Nov 11:00 IST with reference E939081C = reply, 19 messages, 9 turns all `success`, audit rows per tool, summary (confirmed, high intent, 92), 0 raw phone occurrences in traces, 1 confirmed booking for the slot |
| Live auth/health checks via proxy | health 200; 401 for missing/bad token, wrong password and unknown user (same message); 400 for invalid body and malformed JSON; 404 envelope for unknown routes; Helmet headers present; CORS allows only `http://localhost:5173` |

| Live Groq (`openai/gpt-oss-20b`) via a throwaway instance | Key valid (models listed); scenario, pricing, inventory, maintenance/Sunday, discount, EN/HI/TE answers grounded; LLM entity + sentiment merge used; prompt injection refused; no key in logs |
| Live DB-outage probe (instance pointed at a dead port) | health 503 `DB_UNAVAILABLE` with reason; login 503 `SERVICE_UNAVAILABLE`; startup log `database_unreachable` |
| Live rate-limit probe (instance with small limits) | successful login not counted; 4th failed login → 429 `TOO_MANY_LOGIN_ATTEMPTS`; global limit → JSON 429 |
| Browser: microphone denied (pane blocks mic) | clear alert + Retry button; typed message still answered with citation |
| Browser: responsive | all 9 pages have no horizontal overflow at 375 px and 768 px (measured in DOM) |
| Server log scan | 0 phone numbers, 0 customer names, 0 secrets |

| Live RAG check on the Supabase database after the knowledge update | 18 documents synced (15 added, 1 updated, 7 retired); admin agent and public customer API both answer project overview, 3BHK price, kitchen specification, schools/hospitals and EMI from the right documents with sources; helipad → honest fallback |

## Not tested

- Live Gemini requests (no key). Groq was verified live; the Gemini adapter is covered by request/response tests with a mocked fetch.
- Docker image build/run (Docker daemon was not running).
- Real microphone input and a genuinely speech-unsupported browser: the browser pane blocks the mic (denied path tested live), and the unsupported path (no `SpeechRecognition`) was verified by code review only.
- nginx security headers (Docker not available).
- Load/performance testing: none performed; no throughput claims are made.
