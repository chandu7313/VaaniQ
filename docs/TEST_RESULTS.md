# Test Results

Run date: 2026-11-26 · Node v26.0.0 · PostgreSQL 18.1 (local) · LLM: DEMO_MODE + injected mock providers in tests; Groq verified live separately (see QA_REPORT.md).

## Backend: `cd backend && npm test`

```
✔ A. collects missing information turn by turn (323.582917ms)
✔ B. retrieves relevant documents with sources (15.484292ms)
✔ C. qualifies the customer and shows an explainable score (9.780709ms)
✔ D. checks real availability, collects contact, and PROPOSES (not books) a slot (47.436125ms)
✔ E. books only after explicit confirmation, inside a transaction, and confirms (10.831209ms)
✔ F. duplicate booking: the same customer cannot book a second visit (13.699833ms)
✔ G. booking conflict: slot taken between proposal and confirmation is refused and re-offered (36.209834ms)
✔ H. produces and persists the structured call summary (15.215709ms)
✔ I. decision trace and audit trail are complete and contain no raw phone numbers (1.682333ms)
✔ J. a proposal left unconfirmed at the end of a call is reported as NOT booked (26.60675ms)
✔ booking tool refuses to run without customer confirmation (137.184208ms)
✔ confirmation of a DIFFERENT slot than proposed is refused (1.643709ms)
✔ expired proposal is refused (0.836834ms)
✔ unknown tools and invalid arguments are rejected before execution (3.251208ms)
✔ LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking (44.2085ms)
✔ LLM failure falls back to rules and is recorded in the trace (12.844ms)
✔ LLM analysis with null fields is accepted (not rejected as invalid) (7.596459ms)
✔ malformed (non-JSON) LLM output falls back to rules and is recorded (5.409416ms)
✔ grounding guard: an LLM answer with a computed/invented figure is replaced by the verbatim source (7.560542ms)
✔ response contract: every structured field is present and the pipeline events are recorded (290.341833ms)
✔ 1. pricing question: answered from the Price list with sources, no invented figures (16.820375ms)
✔ 2. unsupported question: explicit fallback, no sources, nothing made up (13.619875ms)
✔ 3. budget change mid-conversation: newer value wins and the score is recomputed (21.887459ms)
✔ 4. follow-up question uses the previous topic from memory (18.189292ms)
✔ 5. language switch: replies follow the newly selected language and it is persisted (112.438375ms)
✔ 6. incomplete information: nothing is invented and the agent asks for what is missing (10.349083ms)
✔ sessions never mix: two concurrent customers keep separate memory, leads and slots (50.577916ms)
✔ structured action proposal: suggestedAction mirrors backend state, not model text (30.524542ms)
✔ memory never turns an unsupported question into an answer about the previous topic (22.125958ms)
✔ scenario: extracts requirements without inventing missing fields (13.085958ms)
✔ scenario: visit request is the primary intent and info request is secondary (4.598959ms)
✔ budget parsing across units and languages (0.419875ms)
✔ contact details, day and time parsing (3.376125ms)
✔ confirm/decline only recognised when something is pending (3.842584ms)
✔ human escalation request is detected (0.131166ms)
✔ sentiment: positive, negative, negated and neutral with evidence (101.253125ms)
✔ lead score for the scenario is explainable and lists missing info (2.111083ms)
✔ empty profile scores 0 and booking adds full appointment points (0.203333ms)
✔ budget below range earns partial points (0.186208ms)
✔ "I'm <Name>" is a name, "I am looking" is not (regression) (0.23075ms)
✔ Hindi and Telugu names keep their vowel signs (regression) (1.084833ms)
✔ "This is great!" is not a name, "This is Priya" is (regression) (0.172625ms)
✔ every factor lists its evidence; no evidence means no points; next action is recommended (0.316958ms)
✔ sentiment declares it is transcript-text based, not voice emotion (0.10075ms)
✔ health check and authentication (292.050834ms)
✔ request validation returns a consistent error envelope (17.447417ms)
✔ full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise (227.38975ms)
✔ declining a proposal books nothing (35.718833ms)
✔ unknown information is not invented (13.455667ms)
✔ human escalation and Hindi conversation (52.224792ms)
✔ tenant isolation: another tenant cannot read this tenant's data (132.175666ms)
✔ deleting a user revokes their existing token immediately (116.943708ms)
✔ knowledge base: ingest, search with citations, delete (9.49725ms)
✔ slots respect visiting hours, working days and minimum lead time (142.315416ms)
✔ booking is persisted, removes the slot, and blocks a second booking of that slot (7.655834ms)
✔ concurrent bookings of the same slot: exactly one succeeds (10.405667ms)
✔ a lead cannot hold two upcoming visits; out-of-policy times are rejected (3.884625ms)
✔ repeat caller: phone match merges the temporary lead into the existing one (5.459458ms)
✔ leads: create (scored, deduplicated), read, update, delete, all persisted (392.978417ms)
✔ customers: a view over identified leads with full CRUD (32.183792ms)
✔ conversations: create, read, delete cascades messages/traces (60.810667ms)
✔ appointments: staff create via tool, read, reschedule, status, delete; duplicate + conflict rejected (56.021166ms)
✔ call summaries: generate, list, read, annotate, delete (28.847375ms)
✔ dashboard KPIs equal direct database counts (no hardcoded analytics) (19.371208ms)
✔ RLS: a non-owner role (like Supabase anon) sees no rows even with SELECT granted (111.961125ms)
✔ database errors are explained without leaking the connection string (0.241667ms)
✔ seed is repeatable and demo lead scores come from the scoring model (5.800208ms)
✔ Groq adapter: OpenAI-compatible request with JSON mode and bearer key; parses content (224.516833ms)
✔ Gemini adapter: generateContent with x-goog-api-key and JSON mime type; parses candidates (0.507167ms)
✔ providers: HTTP errors, timeouts and empty responses become LlmErrors (never hang, never leak the key) (152.799375ms)
✔ GET /llm/health: demo mode, healthy provider, unavailable provider (11.883125ms)
✔ rate limit answers 429 in the JSON error envelope (5.2615ms)
✔ database outage errors map to 503 SERVICE_UNAVAILABLE with a clear message (7.651625ms)
✔ duplicate concurrent requests: two simultaneous "yes" book exactly once, no confusing failure (105.893291ms)
✔ invalid slot requests: out-of-hours time via agent is never booked; malformed/out-of-policy via API rejected (22.866959ms)
✔ SQL injection payloads are treated as data (parameterized queries) (61.644792ms)
✔ stored XSS payloads are persisted and returned as inert text (20.92175ms)
✔ cross-tenant: every CRM/tool endpoint hides other tenants' records (185.272166ms)
✔ prompt injection in a customer message cannot trigger a booking or reveal configuration (10.115334ms)
✔ chunker keeps section headings for attribution (111.229166ms)
✔ chunker flags prompt-injection text (0.171042ms)
✔ BM25 ranks the matching document first and bounds relevance to 0..1 (2.114625ms)
✔ retrieval answers pricing question from the pricing document with a section (2.475583ms)
✔ retrieval returns nothing for an off-topic query (no forced citation) (0.150958ms)
✔ Hindi price query is expanded to English keywords (2.499834ms)
✔ flagged chunks are excluded from retrieval (2.527084ms)
✔ tokenizer does not split words containing "rs" (regression) (0.311708ms)
✔ parenthetical notes are not indexed as standalone chunks (0.1425ms)
✔ reindex replaces old chunks with the current chunker output (12.355417ms)
✔ "three bedroom" and "3 bed room" retrieve the same documents as "3BHK" (regression) (0.250458ms)
✔ registry exposes exactly the nine controlled tools with metadata (111.490375ms)
✔ every execution returns a structured record and writes an audit row (even rejections) (7.643542ms)
✔ authorization: resources from another tenant are rejected and never recorded (3.040458ms)
✔ consent: agent needs the customer's confirmation; a signed-in staff member is the confirming human (31.270167ms)
✔ saveLead deduplicates by phone; calculateLeadScore is pure; audit args are PII-masked (8.465084ms)
✔ generateCallSummary and escalateToHuman persist their results (10.953834ms)
ℹ tests 96
ℹ suites 0
ℹ pass 96
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7171.513542
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
| `cd backend && npm run lint` (syntax check) | 79/79 files passed |
| `cd frontend && npm run lint` (ESLint + react-hooks) | 0 problems |
| `cd frontend && npm run build` (Vite) | success, pages code-split |
| `npm audit` backend (prod) / frontend | 0 vulnerabilities / 0 vulnerabilities |
| `docker compose config` | valid |
| Backend booted against the Supabase `DATABASE_URL` (probe on port 4100) | Direct host unreachable over IPv4: logs `database_unreachable`, `/api/health` → `503 DB_UNAVAILABLE` with the pooler hint |
| Manual browser run (Chrome pane, 1440px and 375px) | Full scenario completed via UI; all 8 pages loaded with no console errors |
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

## Not tested

- Live Gemini requests (no key). Groq was verified live; the Gemini adapter is covered by request/response tests with a mocked fetch.
- Docker image build/run (Docker daemon was not running).
- Real microphone input and a genuinely speech-unsupported browser: the browser pane blocks the mic (denied path tested live), and the unsupported path (no `SpeechRecognition`) was verified by code review only.
- nginx security headers (Docker not available).
- Load/performance testing: none performed; no throughput claims are made.
