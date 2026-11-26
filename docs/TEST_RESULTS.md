# Test Results

Run date: 2026-11-26 · Node v26.0.0 · PostgreSQL 18.1 (local) · LLM: DEMO_MODE + injected mock providers in tests; Groq verified live separately (see QA_REPORT.md).

## Backend: `cd backend && npm test`

```
✔ A. collects missing information turn by turn (379.198083ms)
✔ B. retrieves relevant documents with sources (16.0665ms)
✔ C. qualifies the customer and shows an explainable score (8.795666ms)
✔ D. checks real availability, collects contact, and PROPOSES (not books) a slot (67.163375ms)
✔ E. books only after explicit confirmation, inside a transaction, and confirms (9.996833ms)
✔ F. duplicate booking: the same customer cannot book a second visit (12.623375ms)
✔ G. booking conflict: slot taken between proposal and confirmation is refused and re-offered (36.47425ms)
✔ H. produces and persists the structured call summary (6.315625ms)
✔ I. decision trace and audit trail are complete and contain no raw phone numbers (1.671584ms)
✔ J. a proposal left unconfirmed at the end of a call is reported as NOT booked (21.545625ms)
✔ booking tool refuses to run without customer confirmation (147.882417ms)
✔ confirmation of a DIFFERENT slot than proposed is refused (1.660125ms)
✔ expired proposal is refused (0.867375ms)
✔ unknown tools and invalid arguments are rejected before execution (3.4945ms)
✔ LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking (48.737792ms)
✔ LLM failure falls back to rules and is recorded in the trace (14.644583ms)
✔ LLM analysis with null fields is accepted (not rejected as invalid) (6.716416ms)
✔ malformed (non-JSON) LLM output falls back to rules and is recorded (4.350542ms)
✔ grounding guard: an LLM answer with a computed/invented figure is replaced by the verbatim source (6.82775ms)
✔ LLM answers: duplicate visit offers removed; LLM cannot turn a loan amount into a budget (regressions) (98.715ms)
✔ response contract: every structured field is present and the pipeline events are recorded (313.971875ms)
✔ 1. pricing question: answered from the Price list with sources, no invented figures (16.477333ms)
✔ 2. unsupported question: explicit fallback, no sources, nothing made up (10.930917ms)
✔ 3. budget change mid-conversation: newer value wins and the score is recomputed (18.381209ms)
✔ 4. follow-up question uses the previous topic from memory (14.779125ms)
✔ 5. language switch: replies follow the newly selected language and it is persisted (149.744041ms)
✔ 6. incomplete information: nothing is invented and the agent asks for what is missing (27.564166ms)
✔ sessions never mix: two concurrent customers keep separate memory, leads and slots (72.11625ms)
✔ structured action proposal: suggestedAction mirrors backend state, not model text (39.011459ms)
✔ memory never turns an unsupported question into an answer about the previous topic (25.58475ms)
✔ a loan amount is not mistaken for a budget; "payment schedule" is not a visit request (regressions) (33.925875ms)
✔ demo-mode answer combines the most relevant sentences across close sections (24.573208ms)
✔ scenario: extracts requirements without inventing missing fields (13.296125ms)
✔ scenario: visit request is the primary intent and info request is secondary (4.902333ms)
✔ budget parsing across units and languages (0.408834ms)
✔ contact details, day and time parsing (3.508416ms)
✔ confirm/decline only recognised when something is pending (4.164541ms)
✔ human escalation request is detected (0.133666ms)
✔ sentiment: positive, negative, negated and neutral with evidence (101.763291ms)
✔ lead score for the scenario is explainable and lists missing info (2.062167ms)
✔ empty profile scores 0 and booking adds full appointment points (0.206ms)
✔ budget below range earns partial points (0.185625ms)
✔ "I'm <Name>" is a name, "I am looking" is not (regression) (0.229958ms)
✔ Hindi and Telugu names keep their vowel signs (regression) (1.068208ms)
✔ "This is great!" is not a name, "This is Priya" is (regression) (0.208ms)
✔ every factor lists its evidence; no evidence means no points; next action is recommended (0.328166ms)
✔ sentiment declares it is transcript-text based, not voice emotion (0.1025ms)
✔ health check and authentication (304.90575ms)
✔ request validation returns a consistent error envelope (17.845459ms)
✔ full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise (213.186667ms)
✔ declining a proposal books nothing (27.537167ms)
✔ unknown information is not invented (10.049917ms)
✔ human escalation and Hindi conversation (47.766541ms)
✔ tenant isolation: another tenant cannot read this tenant's data (123.504625ms)
✔ deleting a user revokes their existing token immediately (122.502875ms)
✔ knowledge base: ingest, search with citations, delete (13.308625ms)
✔ slots respect visiting hours, working days and minimum lead time (146.371791ms)
✔ booking is persisted, removes the slot, and blocks a second booking of that slot (6.632625ms)
✔ concurrent bookings of the same slot: exactly one succeeds (9.32375ms)
✔ a lead cannot hold two upcoming visits; out-of-policy times are rejected (3.146167ms)
✔ repeat caller: phone match merges the temporary lead into the existing one (4.692791ms)
✔ leads: create (scored, deduplicated), read, update, delete, all persisted (394.603833ms)
✔ customers: a view over identified leads with full CRUD (27.515167ms)
✔ conversations: create, read, delete cascades messages/traces (63.9185ms)
✔ appointments: staff create via tool, read, reschedule, status, delete; duplicate + conflict rejected (55.842542ms)
✔ call summaries: generate, list, read, annotate, delete (26.309625ms)
✔ dashboard KPIs equal direct database counts (no hardcoded analytics) (13.650417ms)
✔ RLS: a non-owner role (like Supabase anon) sees no rows even with SELECT granted (125.148167ms)
✔ database errors are explained without leaking the connection string (0.261083ms)
✔ seed is repeatable and demo lead scores come from the scoring model (5.822416ms)
✔ PII masking hides phone numbers but never corrupts UUIDs (regression) (0.743459ms)
✔ public overview resolves allowed slug only and hides internal policies (196.682583ms)
✔ public knowledge search excludes internal policies (16.285583ms)
✔ public session isolation blocks cross-conversation access and admin APIs (25.350083ms)
✔ full public customer journey persists to PostgreSQL and is visible in Business Admin Panel without leaking CRM/trace publicly (161.75925ms)
✔ Groq adapter: OpenAI-compatible request with JSON mode and bearer key; parses content (243.767625ms)
✔ Gemini adapter: generateContent with x-goog-api-key and JSON mime type; parses candidates (0.521625ms)
✔ providers: HTTP errors, timeouts and empty responses become LlmErrors (never hang, never leak the key) (151.77825ms)
✔ GET /llm/health: demo mode, healthy provider, unavailable provider (10.563417ms)
✔ rate limit answers 429 in the JSON error envelope (5.481625ms)
✔ database outage errors map to 503 SERVICE_UNAVAILABLE with a clear message (8.392708ms)
✔ duplicate concurrent requests: two simultaneous "yes" book exactly once, no confusing failure (111.05075ms)
✔ invalid slot requests: out-of-hours time via agent is never booked; malformed/out-of-policy via API rejected (23.924792ms)
✔ SQL injection payloads are treated as data (parameterized queries) (66.137959ms)
✔ stored XSS payloads are persisted and returned as inert text (13.075375ms)
✔ cross-tenant: every CRM/tool endpoint hides other tenants' records (182.072417ms)
✔ prompt injection in a customer message cannot trigger a booking or reveal configuration (12.807791ms)
✔ chunker keeps section headings for attribution (122.734083ms)
✔ chunker flags prompt-injection text (0.165708ms)
✔ BM25 ranks the matching document first and bounds relevance to 0..1 (2.161083ms)
✔ retrieval answers pricing question from the pricing document with a section (3.61575ms)
✔ retrieval returns nothing for an off-topic query (no forced citation) (0.223833ms)
✔ Hindi price query is expanded to English keywords (2.578875ms)
✔ flagged chunks are excluded from retrieval (3.155625ms)
✔ tokenizer does not split words containing "rs" (regression) (0.314541ms)
✔ parenthetical notes are not indexed as standalone chunks (0.148125ms)
✔ reindex replaces old chunks with the current chunker output (21.599709ms)
✔ "three bedroom" and "3 bed room" retrieve the same documents as "3BHK" (regression) (0.327ms)
✔ new company documents answer their topics; off-topic questions find nothing (1.257167ms)
✔ re-seeding syncs demo documents and never touches user-uploaded ones (24.960709ms)
✔ two-part questions retrieve a passage for each topic (2.594917ms)
✔ transcription requires sign-in and reports 501 when no provider is configured (demo mode) (245.495916ms)
✔ rejects non-audio, too-short audio and invalid language (7.827458ms)
✔ sends the clip to Groq Whisper with model + language, returns text, stores nothing (2.756375ms)
✔ upstream failure becomes a clear 502; public route needs a customer session (5.385708ms)
✔ registry exposes exactly the nine controlled tools with metadata (127.089125ms)
✔ every execution returns a structured record and writes an audit row (even rejections) (10.027167ms)
✔ authorization: resources from another tenant are rejected and never recorded (3.372584ms)
✔ consent: agent needs the customer's confirmation; a signed-in staff member is the confirming human (31.774041ms)
✔ saveLead deduplicates by phone; calculateLeadScore is pure; audit args are PII-masked (8.125667ms)
✔ generateCallSummary and escalateToHuman persist their results (13.828458ms)
ℹ tests 111
ℹ suites 0
ℹ pass 111
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8966.313208
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
| `cd backend && npm run lint` (syntax check) | 86/86 files passed |
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
| Live Groq on the real setup (Supabase + `openai/gpt-oss-20b`) | full scenario booked after consent; LLM-grounded answers in EN/HI/TE; two-part Telugu question answers both price and schools; loan amount not stored as budget; LLM-written call summary |
| Docker Compose (built and run) | 3 migrations + 18 documents on first start; SPA, deep links, assets and API through nginx; CSP/nosniff/Referrer/Permissions headers present; login, AI turn and customer page work; images and fonts load with no console errors |
| Load test (isolated DEMO_MODE instance) | up to 683 turns/s at 50 concurrent, 0 errors; booking race 100×10 → exactly 10; 0 duplicate turns; see `LOAD_TEST.md` |
| Live-Groq concurrency | 10 simultaneous turns: all LLM-grounded, 0 errors, median 4.4 s |
| Server speech-to-text (Groq Whisper, real audio from macOS voices) | English exact; Hindi exact with `whisper-large-v3`; Telugu romanised ("3BHK FLAT DHARA YENTA") but understood by the agent's keyword map |

## Not tested

- Live Gemini requests (no key). Groq was verified live; the Gemini adapter is covered by request/response tests with a mocked fetch.
- Real microphone input in a browser: the test browser blocks the mic (denied path tested live). The server-transcription endpoint was tested with real audio files, but the in-browser recording path (`MediaRecorder` → upload) was not exercised end to end.
- Speech from real human voices: Whisper was tested on synthetic macOS voices only.
- Production-scale load: the load test ran on one laptop (client and server on the same machine); no distributed or soak test.
