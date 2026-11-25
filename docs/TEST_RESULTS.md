# Test Results

Run date: 2026-11-25 · Node v26.0.0 · PostgreSQL 18.1 (local) · LLM mode: DEMO_MODE plus injected mock providers in agent-guards tests.

## Backend: `cd backend && npm test`

```
✔ booking tool refuses to run without customer confirmation (137.80675ms)
✔ confirmation of a DIFFERENT slot than proposed is refused (1.10175ms)
✔ expired proposal is refused (0.183833ms)
✔ unknown tools and invalid arguments are rejected before execution (1.85425ms)
✔ LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking (41.931292ms)
✔ LLM failure falls back to rules and is recorded in the trace (11.817333ms)
✔ response contract: every structured field is present and the pipeline events are recorded (285.204375ms)
✔ 1. pricing question: answered from the Price list with sources, no invented figures (12.937375ms)
✔ 2. unsupported question: explicit fallback, no sources, nothing made up (9.929792ms)
✔ 3. budget change mid-conversation: newer value wins and the score is recomputed (20.70575ms)
✔ 4. follow-up question uses the previous topic from memory (15.491583ms)
✔ 5. language switch: replies follow the newly selected language and it is persisted (107.584542ms)
✔ 6. incomplete information: nothing is invented and the agent asks for what is missing (8.18025ms)
✔ sessions never mix: two concurrent customers keep separate memory, leads and slots (42.738667ms)
✔ structured action proposal: suggestedAction mirrors backend state, not model text (22.38825ms)
✔ memory never turns an unsupported question into an answer about the previous topic (19.418709ms)
✔ scenario: extracts requirements without inventing missing fields (13.066292ms)
✔ scenario: visit request is the primary intent and info request is secondary (4.673875ms)
✔ budget parsing across units and languages (0.409417ms)
✔ contact details, day and time parsing (3.42375ms)
✔ confirm/decline only recognised when something is pending (3.821708ms)
✔ human escalation request is detected (0.137625ms)
✔ sentiment: positive, negative, negated and neutral with evidence (127.261833ms)
✔ lead score for the scenario is explainable and lists missing info (45.3385ms)
✔ empty profile scores 0 and booking adds full appointment points (0.296375ms)
✔ budget below range earns partial points (0.281167ms)
✔ "I'm <Name>" is a name, "I am looking" is not (regression) (0.808167ms)
✔ Hindi and Telugu names keep their vowel signs (regression) (3.404958ms)
✔ "This is great!" is not a name, "This is Priya" is (regression) (0.381417ms)
✔ health check and authentication (287.976625ms)
✔ request validation returns a consistent error envelope (13.499458ms)
✔ full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise (203.419709ms)
✔ declining a proposal books nothing (22.143042ms)
✔ unknown information is not invented (7.774209ms)
✔ human escalation and Hindi conversation (41.380916ms)
✔ tenant isolation: another tenant cannot read this tenant's data (126.473042ms)
✔ deleting a user revokes their existing token immediately (123.428083ms)
✔ knowledge base: ingest, search with citations, delete (10.504083ms)
✔ slots respect visiting hours, working days and minimum lead time (130.814792ms)
✔ booking is persisted, removes the slot, and blocks a second booking of that slot (7.481416ms)
✔ concurrent bookings of the same slot: exactly one succeeds (9.591667ms)
✔ a lead cannot hold two upcoming visits; out-of-policy times are rejected (3.448667ms)
✔ repeat caller: phone match merges the temporary lead into the existing one (4.738083ms)
✔ RLS: a non-owner role (like Supabase anon) sees no rows even with SELECT granted (109.555375ms)
✔ database errors are explained without leaking the connection string (0.248125ms)
✔ seed is repeatable and demo lead scores come from the scoring model (5.199958ms)
✔ chunker keeps section headings for attribution (105.8255ms)
✔ chunker flags prompt-injection text (0.15225ms)
✔ BM25 ranks the matching document first and bounds relevance to 0..1 (1.930042ms)
✔ retrieval answers pricing question from the pricing document with a section (2.489208ms)
✔ retrieval returns nothing for an off-topic query (no forced citation) (0.17875ms)
✔ Hindi price query is expanded to English keywords (2.357875ms)
✔ flagged chunks are excluded from retrieval (2.392084ms)
✔ tokenizer does not split words containing "rs" (regression) (0.328417ms)
✔ parenthetical notes are not indexed as standalone chunks (0.146167ms)
✔ reindex replaces old chunks with the current chunker output (13.003958ms)
ℹ tests 56
ℹ suites 0
ℹ pass 56
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3919.96525
```

| Suite | Covers |
|---|---|
| `rag.test.js` | chunking with sections, injection flagging, BM25 ranking and relevance bounds, pricing retrieval, off-topic → no hits, Hindi query expansion, flagged chunks excluded, tokenizer regression |
| `analysis.test.js` | scenario extraction (no invented fields), intents, budget parsing EN/HI/TE, contact/day/time parsing, consent only when pending, escalation phrase, sentiment incl. negation and HI/TE, scenario score 74 with reasons, partial budget credit, name-parsing regressions |
| `booking.test.js` | slot policy (hours, Sunday, lead time), persistence and slot removal, SLOT_TAKEN, **5 concurrent bookings → exactly 1 succeeds**, one upcoming visit per lead, out-of-policy rejection, repeat-caller merge |
| `api.test.js` | health, auth (401s), validation envelope, **full scenario over HTTP** (74 → proposal → no booking yet → yes → booked → 77 → 87 → summary → ended → 409), decline books nothing, unknown info not invented, escalation, Hindi turn, **tenant isolation**, knowledge ingest/search/delete |
| `database.test.js` | **row-level security hides every row from a non-owner role** (as Supabase's anon key would be), DB error messages never leak the URL, seed is repeatable and demo lead scores equal the scoring model's output |
| `ai-lifecycle.test.js` | **the six AI situations over HTTP**: pricing (Price list cited, 3BHK figure quoted), unsupported question (fallback, no sources, no figures), budget change (75L replaces 90L, budget factor 25→10), follow-up ("How big are they?" uses remembered topic), language switch (EN→HI persisted), incomplete info (nothing invented, asks budget); response contract + pipeline events; concurrent sessions never mix; suggested action mirrors backend state; memory never answers an unsupported question with the old topic |
| `agent-guards.test.js` | booking refused without consent, for a different slot, or when expired; unknown tool / invalid args rejected; **LLM "confirm" cannot book**; fabricated sentiment evidence rejected; LLM failure → rule fallback recorded in trace |

## Other checks

| Check | Result |
|---|---|
| `cd backend && npm run lint` (syntax check) | 63/63 files passed |
| `cd frontend && npm run lint` (ESLint + react-hooks) | 0 problems |
| `cd frontend && npm run build` (Vite) | success, pages code-split |
| `npm audit` backend (prod) / frontend | 0 vulnerabilities / 0 vulnerabilities |
| `docker compose config` | valid |
| Backend booted against the Supabase `DATABASE_URL` (probe on port 4100) | Direct host unreachable over IPv4: logs `database_unreachable`, `/api/health` → `503 DB_UNAVAILABLE` with the pooler hint |
| Manual browser run (Chrome pane, 1440px and 375px) | Full scenario completed via UI; all 8 pages loaded with no console errors |
| Manual API runs in EN, HI, TE (demo script lines) | Outcomes as documented in DEMO_SCRIPT.md |
| Live run of the six AI situations through the Vite proxy | All six behaved as specified (pricing, fallback, budget change, follow-up, EN→HI→TE switch, incomplete info) |
| Live auth/health checks via proxy | health 200; 401 for missing/bad token, wrong password and unknown user (same message); 400 for invalid body and malformed JSON; 404 envelope for unknown routes; Helmet headers present; CORS allows only `http://localhost:5173` |

## Not tested

- Live Groq/Gemini requests (no API key available). Request shapes follow the official docs; behaviour covered by mock providers only.
- Docker image build/run (Docker daemon was not running).
- Real microphone input in this environment (STT code path is feature-detected; text path tested).
- Load/performance testing: none performed; no throughput claims are made.
