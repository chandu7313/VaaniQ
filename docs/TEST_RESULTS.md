# Test Results

Run date: 2026-11-25 · Node v26.0.0 · PostgreSQL 18.1 (local) · LLM mode: DEMO_MODE plus injected mock providers in agent-guards tests.

## Backend: `cd backend && npm test`

```
✔ booking tool refuses to run without customer confirmation (82.780208ms)
✔ confirmation of a DIFFERENT slot than proposed is refused (0.680333ms)
✔ expired proposal is refused (0.10975ms)
✔ unknown tools and invalid arguments are rejected before execution (1.091458ms)
✔ LLM output: extra entities merged, but an LLM "confirm" cannot trigger a booking (23.111541ms)
✔ LLM failure falls back to rules and is recorded in the trace (6.368125ms)
✔ scenario: extracts requirements without inventing missing fields (7.3335ms)
✔ scenario: visit request is the primary intent and info request is secondary (2.717583ms)
✔ budget parsing across units and languages (0.247083ms)
✔ contact details, day and time parsing (2.132833ms)
✔ confirm/decline only recognised when something is pending (2.229125ms)
✔ human escalation request is detected (0.07375ms)
✔ sentiment: positive, negative, negated and neutral with evidence (56.828083ms)
✔ lead score for the scenario is explainable and lists missing info (1.420375ms)
✔ empty profile scores 0 and booking adds full appointment points (0.127833ms)
✔ budget below range earns partial points (0.112ms)
✔ "I'm <Name>" is a name, "I am looking" is not (regression) (0.125208ms)
✔ Hindi and Telugu names keep their vowel signs (regression) (0.61175ms)
✔ health check and authentication (170.120208ms)
✔ request validation returns a consistent error envelope (7.075875ms)
✔ full scenario: qualify, RAG answer, offer slots, collect contact, confirm, book, summarise (119.424375ms)
✔ declining a proposal books nothing (14.414125ms)
✔ unknown information is not invented (4.012792ms)
✔ human escalation and Hindi conversation (24.188375ms)
✔ tenant isolation: another tenant cannot read this tenant's data (68.510583ms)
✔ knowledge base: ingest, search with citations, delete (4.499041ms)
✔ slots respect visiting hours, working days and minimum lead time (75.41ms)
✔ booking is persisted, removes the slot, and blocks a second booking of that slot (4.603625ms)
✔ concurrent bookings of the same slot: exactly one succeeds (6.499166ms)
✔ a lead cannot hold two upcoming visits; out-of-policy times are rejected (2.301791ms)
✔ repeat caller: phone match merges the temporary lead into the existing one (3.220834ms)
✔ chunker keeps section headings for attribution (62.078958ms)
✔ chunker flags prompt-injection text (0.097833ms)
✔ BM25 ranks the matching document first and bounds relevance to 0..1 (1.10575ms)
✔ retrieval answers pricing question from the pricing document with a section (1.14525ms)
✔ retrieval returns nothing for an off-topic query (no forced citation) (0.093875ms)
✔ Hindi price query is expanded to English keywords (1.330917ms)
✔ flagged chunks are excluded from retrieval (1.313917ms)
✔ tokenizer does not split words containing "rs" (regression) (0.17975ms)
ℹ tests 39
ℹ suites 0
ℹ pass 39
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1425.952292
```

| Suite | Covers |
|---|---|
| `rag.test.js` | chunking with sections, injection flagging, BM25 ranking and relevance bounds, pricing retrieval, off-topic → no hits, Hindi query expansion, flagged chunks excluded, tokenizer regression |
| `analysis.test.js` | scenario extraction (no invented fields), intents, budget parsing EN/HI/TE, contact/day/time parsing, consent only when pending, escalation phrase, sentiment incl. negation and HI/TE, scenario score 74 with reasons, partial budget credit, name-parsing regressions |
| `booking.test.js` | slot policy (hours, Sunday, lead time), persistence and slot removal, SLOT_TAKEN, **5 concurrent bookings → exactly 1 succeeds**, one upcoming visit per lead, out-of-policy rejection, repeat-caller merge |
| `api.test.js` | health, auth (401s), validation envelope, **full scenario over HTTP** (74 → proposal → no booking yet → yes → booked → 77 → 87 → summary → ended → 409), decline books nothing, unknown info not invented, escalation, Hindi turn, **tenant isolation**, knowledge ingest/search/delete |
| `agent-guards.test.js` | booking refused without consent, for a different slot, or when expired; unknown tool / invalid args rejected; **LLM "confirm" cannot book**; fabricated sentiment evidence rejected; LLM failure → rule fallback recorded in trace |

## Other checks

| Check | Result |
|---|---|
| `cd backend && npm run lint` (syntax check) | 49/49 files passed |
| `cd frontend && npm run lint` (ESLint + react-hooks) | 0 problems |
| `cd frontend && npm run build` (Vite) | success, pages code-split |
| `npm audit` backend (prod) / frontend | 0 vulnerabilities / 0 vulnerabilities |
| `docker compose config` | valid |
| Manual browser run (Chrome pane, 1440px and 375px) | Full scenario completed via UI; all 8 pages loaded with no console errors |
| Manual API runs in EN, HI, TE (demo script lines) | Outcomes as documented in DEMO_SCRIPT.md |

## Not tested

- Live Groq/Gemini requests (no API key available). Request shapes follow the official docs; behaviour covered by mock providers only.
- Docker image build/run (Docker daemon was not running).
- Real microphone input in this environment (STT code path is feature-detected; text path tested).
- Load/performance testing: none performed; no throughput claims are made.
