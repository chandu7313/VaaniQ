# VaaniQ: Autonomous AI Sales Agent (MVP)

VaaniQ is a configurable B2B SaaS "digital sales employee". It talks to customers by voice or text in **English, Hindi and Telugu**. It answers from verified company documents (RAG), qualifies the lead with an explainable 100-point score, and books site visits through validated backend tools, only after the customer explicitly confirms. Everything is saved in PostgreSQL, and every decision is shown on an auditable **Agent Decision Trace**.

> **All business data is fictional.** "ABC Developers", the *ABC Heights* project in Gachibowli, Hyderabad, its prices, inventory, RERA number and every seeded customer are demonstration data. The UI labels them `DEMO`.

## What works today (tested)

| Capability | Status |
|---|---|
| Voice in/out (browser Speech Recognition + Speech Synthesis), live listening state and interim transcript | ✅ feature-detected, text fallback |
| EN / HI / TE conversations (templates, extraction, sentiment lexicon, STT/TTS language codes) | ✅ |
| Contextual memory: persisted history, session state (offered slots, pending proposal), cross-turn lead profile, repeat-caller merge by phone | ✅ |
| Lead qualification: requirement, budget fit, timeline, decision-maker, appointment intent → explainable score with reasons and missing info | ✅ |
| Sentiment per message: label, confidence, evidence phrases, trajectory | ✅ |
| RAG: ingestion, heading-aware chunking, BM25 top-K, relevance threshold, source + section citations, prompt-injection flagging | ✅ |
| Agentic tools: intent → structured proposal → Zod validation → consent gate → execution → trace; human escalation | ✅ |
| Appointments: real availability, conflict prevention (transaction + DB unique index), explicit confirmation, reschedule/cancel | ✅ |
| CRM, call summaries, live analytics dashboard, 8 UI pages | ✅ |
| LLM providers (Groq, Gemini) behind one abstraction | ⚠️ implemented and covered by mock-provider tests; **not exercised against a live key in this build** (no key was available). The app ran in DEMO_MODE |

## Quick start (local, no Docker)

Requirements: Node.js ≥ 20 (developed on Node 26) and PostgreSQL ≥ 14.

```bash
cp .env.example .env
```
Edit `.env`: set `DATABASE_URL`, a 32+ character `JWT_SECRET`, and `SEED_ADMIN_PASSWORD`.

```bash
cd backend && npm install && npm run setup
```
```bash
npm run dev
```
In a second terminal:
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:5173 and sign in as `admin@abcdevelopers.demo` with your `SEED_ADMIN_PASSWORD`. If you left it empty, `npm run setup` prints a generated password once.

To get a clean demo database before presenting (dev only, deletes all data):
```bash
cd backend && npm run db:reset -- --yes
```

## Quick start (Docker Compose)

```bash
cp .env.example .env
```
Set `JWT_SECRET` (and optionally `SEED_ADMIN_PASSWORD`, `LLM_*`), then:
```bash
docker compose up --build
```
UI at http://localhost:8080. The backend container runs migrations and the idempotent seed on start. *Note: `docker compose config` was validated in this build, but the images were **not** built or run, because the Docker daemon was not running on the build machine.*

## Enabling a real LLM

```
LLM_PROVIDER=groq        # or gemini
LLM_API_KEY=...          # stays on the backend only
LLM_MODEL=...            # check the provider's current model list
```
Without a key and model, the system runs in **DEMO_MODE**: rule-based NLU, deterministic templates and *extractive* answers quoted from retrieved documents. The header badge and every trace say which mode produced a reply.

## Tests and checks

```bash
cd backend && npm test        # 39 tests: unit + PostgreSQL integration + HTTP end-to-end
cd backend && npm run lint    # syntax check of all source files
cd frontend && npm run lint && npm run build
```
Tests need a database named in `.env.test` (it must contain `_test`; the helper refuses anything else). Latest results: [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md).

## Repository layout

```
backend/
  src/
    app.js, server.js, config.js          Express app, security middleware, env validation
    db/                                    pool, migrations/001_init.sql, migrate, seed (+ fictional seedData), reset
    middleware/                            auth (JWT + tenant), validate (Zod), error envelope
    routes/                                auth, conversations, leads, appointments, knowledge, insights
    services/
      agent/orchestrator.js                one conversational turn, end to end
      agent/analyzer.js                    rules NLU + optional validated LLM merge
      agent/responder.js                   grounded answer (LLM) or extractive answer (demo)
      agent/templates.js                   EN/HI/TE reply fragments
      tools/registry.js, tools/index.js    tool registry, validation, consent gate; the 5 tools
      rag/chunker.js, bm25.js, knowledge.js
      nlu.js, sentiment.js, lexicon.js, leadScoring.js
      crm.js, appointments.js, memory.js, summary.js, analytics.js, tenants.js
      llm/index.js, groq.js, gemini.js, http.js
  test/                                    node:test suites
frontend/src/
  pages/        Dashboard, Agent, Leads, Appointments, Knowledge, Conversations, Analytics, Traces, Login
  components/   ui kit, TraceView, ScoreBreakdown, SummaryCard, charts, agent/*
  hooks/        useApi, useSpeech (STT/TTS), useToast
docs/           architecture, API, report, explanation guide, demo script, scalability & security, test results
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): system diagram, request flow, data model
- [docs/API.md](docs/API.md): REST contracts
- [docs/EXPLANATION_GUIDE.md](docs/EXPLANATION_GUIDE.md): how every part works (interview prep)
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md): a 7-minute live demo, step by step
- [docs/SCALABILITY_AND_SECURITY.md](docs/SCALABILITY_AND_SECURITY.md)
- [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md): one-page report

## Assumptions

- One tenant is seeded. Multi-tenancy is enforced in the schema and in every query (tenant id comes from the verified JWT), but there is no tenant sign-up UI.
- Staff use the admin console. The "customer" on the Agent page is role-played by the operator. A public customer widget is future scope.
- Site visits are 1-hour slots, Mon–Sat, 10:00–18:00 IST, capacity one visit per slot, at least 2 hours ahead, within 7 days (all in tenant settings).
- No raw audio is stored. Browser speech recognition may be processed by the browser vendor's speech service (for example, Chrome); VaaniQ receives text only.
# VaaniQ
