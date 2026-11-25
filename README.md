# VaaniQ: Conversational Intelligence

**An autonomous AI sales agent (MVP).** VaaniQ talks to customers by voice or text in **English, Hindi and Telugu**. It answers only from verified company documents (RAG with citations), qualifies leads with an explainable 100-point score, and books site visits through validated backend tools, **only after the customer explicitly confirms**. Everything is saved in PostgreSQL, and every decision is shown on an auditable **Agent Decision Trace**.

> **All business data is fictional.** "ABC Developers", the *ABC Heights* project in Gachibowli, Hyderabad, its prices, inventory, RERA number and every seeded customer are demonstration data, labelled `DEMO` in the UI.

**Docs:** [Project report](docs/PROJECT_REPORT.md) · [Architecture](docs/ARCHITECTURE.md) · [Explanation guide](docs/EXPLANATION_GUIDE.md) · [API reference](docs/API_REFERENCE.md) · [Technical Q&A](docs/TECHNICAL_QA.md) · [Demo script (5 min)](docs/DEMO_SCRIPT.md) · [Scalability & security](docs/SCALABILITY_AND_SECURITY.md) · [QA report](docs/QA_REPORT.md) · [Test results](docs/TEST_RESULTS.md)

## Feature status

**Implemented** = built and covered by automated tests or live checks · **Partial** = works within stated limits · **Mocked/Demo** = deterministic stand-in, labelled in the UI · **Planned** = designed, not built.

| Area | Status | Notes |
|---|---|---|
| AI Voice Agent: live transcript, listening/thinking/speaking state, replay, mute, retry | Implemented | browser Web Speech API |
| Speech-to-text / text-to-speech coverage | **Partial** | depends on the browser and installed voices (Telugu voices are often missing); feature-detected, text input always available |
| English / Hindi / Telugu | Implemented · **Partial** in DEMO_MODE | DEMO_MODE understanding is keyword-based and quotes English documents |
| LLM provider abstraction | Implemented | **Groq verified live**; Gemini adapter-tested only |
| DEMO_MODE (no API key) | **Mocked/Demo** | rule-based NLU + verbatim extractive answers; shown in the header badge and every trace |
| RAG: ingestion, chunking, BM25 top-3, threshold, citations, injection flagging | Implemented | embeddings / pgvector **Planned** |
| Numeric grounding guard on LLM answers | Implemented | figures not in the sources trigger a verbatim fallback |
| Conversation memory, follow-ups, session isolation | Implemented | turn serialization is per process (multi-instance lock **Planned**) |
| Intent and entity extraction, sentiment (text-based) | Implemented | not acoustic emotion detection |
| Explainable lead score (25/25/20/15/15) with evidence and next action | Implemented | weights configurable per tenant (no settings UI for weights yet) |
| Tool executor: validate → authorize → consent → execute → audit (9 tools) | Implemented | |
| Appointments: availability, proposal, consent, transaction, conflict prevention | Implemented | calendar sync **Planned** |
| CRM CRUD: leads, customers, conversations, appointments, call summaries | Implemented | |
| Call summaries, Executive Dashboard, Call Intelligence (live SQL) | Implemented | |
| Decision Trace + tool audit log (PII-masked) | Implemented | OpenTelemetry **Planned** |
| Auth (JWT + scrypt), multi-tenancy, admin-only deletes, rate limits | Implemented | refresh tokens / SSO **Planned** |
| Docker Compose (db, API, nginx frontend) | **Partial** | config validated; images not built here (Docker daemon unavailable) |
| Telephony, SMS/WhatsApp, tenant sign-up UI | **Planned** | |
| Company, inventory and customer data | **Mocked/Demo** | fictional seed data |

## Quick start (local)

Requirements: **Node.js ≥ 20** (developed on Node 26) and **PostgreSQL ≥ 14**. No local Postgres? `docker compose up -d db` starts one on `localhost:5432` that matches `.env.example`.

```bash
cp .env.example .env
```
Edit `.env`: set `DATABASE_URL`, a random `JWT_SECRET` of 32+ characters, and `SEED_ADMIN_PASSWORD`.
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
```bash
cd backend && npm install && npm run setup
```
```bash
cd backend && npm run dev
```
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:5173 and sign in as `admin@abcdevelopers.demo` with your `SEED_ADMIN_PASSWORD` (if you left it empty, `npm run setup` prints a generated one once).

Useful scripts (from `backend/`):

| Command | What it does |
|---|---|
| `npm run setup` | migrate + idempotent seed |
| `npm run db:reset -- --yes` | **dev only, deletes all data**, then re-seeds the demo |
| `npm run kb:reindex` | re-chunk stored documents (CRM data untouched) |
| `npm test` | 96 tests (unit, PostgreSQL integration, HTTP end-to-end) |
| `npm run lint` | syntax check of every source file |

## Docker Compose

```bash
cp .env.example .env
```
Set `JWT_SECRET` (and optionally `SEED_ADMIN_PASSWORD`, `LLM_*`), then:
```bash
docker compose up --build
```
UI at http://localhost:8080; the API container migrates and seeds on start. *Status: `docker compose config` is valid, but the images were not built or run during development.*

## Hosted PostgreSQL (Supabase)

Use **Connect → Session pooler** as `DATABASE_URL` with `DATABASE_SSL=require`, then run `npm run setup`. The direct host `db.<ref>.supabase.co` is IPv6-only and fails on most IPv4 networks (the backend logs `database_unreachable`, and `/api/health` returns `503`). Migration `002` enables deny-all row-level security, so Supabase's public anon key cannot read the tables.

## Enabling a live LLM

Put the key in **`.env`**, never in `.env.example` (that file is committed):
```
LLM_PROVIDER=groq            # or gemini
LLM_API_KEY=...              # stays on the server
LLM_MODEL=openai/gpt-oss-20b # the Groq model used for live verification; check the provider's current list
```
Then **Settings & Language → Test AI connection** (or `GET /api/llm/health`). Without a key the app runs in DEMO_MODE.

## Tests

```bash
cd backend && npm test
```
```bash
cd frontend && npm run lint && npm run build
```
Tests use the database in `.env.test`, whose name must contain `_test`; the helper refuses anything else. Run a single test (from `backend/`):
```bash
node --env-file-if-exists=../.env.test --test --test-concurrency=1 --test-name-pattern="concurrent bookings" test/booking.test.js
```
Latest results: [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md) (96/96 passing).

## Repository layout

```
backend/src
  app.js, server.js, config.js     Express app, security middleware, env validation, graceful shutdown
  db/                              pool (+TLS), migrations 001–003, migrate, seed (+ fictional seedData), reset, reindex
  middleware/                      auth (JWT + live user check), validate (Zod), errors, rate limits
  routes/ → controllers/           thin routes (paths, middleware, schemas) → HTTP controllers
  services/agent/                  orchestrator, analyzer, responder (+ grounding guard), context, output schema, templates
  services/tools/                  definitions | handlers | executor (9 tools)
  services/rag/                    chunker, BM25, knowledge base
  services/                        nlu, sentiment, lexicon, leadScoring, crm, customers, callSummaries, appointments,
                                   memory, summary, analytics, traces, users, tenants, llm/{groq,gemini,http}
backend/test                       11 node:test suites incl. acceptance, CRM, tools, QA/security
frontend/src
  pages/                           Dashboard, Agent, Leads, Appointments, Knowledge, Conversations,
                                   CallIntelligence, Traces, Settings, Login
  components/                      ui kit, TraceView, ScoreBreakdown, SummaryCard, charts, agent/*
  hooks/ · context/                useSpeech (STT/TTS), useApi, useToast · Auth, Settings
docs/                              see the links at the top
```

## GitHub setup

```bash
git clone https://github.com/<your-account>/VaaniQ.git
```
```bash
cd VaaniQ && cp .env.example .env
```
Then follow **Quick start**. Never commit `.env`, `.env.test` or `.pgdata/` (already in `.gitignore`). Before pushing, scan staged files for real keys:
```bash
git diff --cached | grep -nE "gsk_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{20,}" || echo "no secrets found"
```

## Submission checklist

- [ ] `.env.example` contains placeholders only (no real keys or passwords)
- [ ] `cd backend && npm test` → 96/96 passing
- [ ] `cd backend && npm run lint` and `cd frontend && npm run lint && npm run build` clean
- [ ] `npm run db:reset -- --yes` run on the demo database
- [ ] App starts, `/api/health` returns `ok`, and you can log in
- [ ] **Settings → Test AI connection** shows the intended mode (demo or live)
- [ ] Full scenario run once in the browser ([demo script](docs/DEMO_SCRIPT.md))
- [ ] Docs reviewed: [project report](docs/PROJECT_REPORT.md), [architecture](docs/ARCHITECTURE.md), [Q&A](docs/TECHNICAL_QA.md)
- [ ] Repository pushed; GitHub renders the Mermaid diagrams in `docs/ARCHITECTURE.md`
- [ ] Known limitations stated honestly ([QA report §4](docs/QA_REPORT.md))

## Assumptions

- One tenant is seeded. Multi-tenancy is enforced in the schema and in every query, but there is no tenant sign-up UI.
- Staff use the admin console; on the Agent page the operator role-plays the customer. A public customer widget is future scope.
- Site visits are 1-hour slots, Mon–Sat, 10:00–18:00 IST, one visit per slot, at least 2 hours ahead and within 7 days (tenant settings).
- No raw audio is stored. Browser speech recognition may be processed by the browser vendor's service (for example, Chrome); VaaniQ receives text only.
