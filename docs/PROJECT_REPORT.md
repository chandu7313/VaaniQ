# VaaniQ: Project Report

**Product:** an autonomous AI sales agent and conversational-intelligence platform (B2B SaaS, multi-tenant).
**Demo tenant:** ABC Developers, *ABC Heights*, Gachibowli, Hyderabad, 2BHK/3BHK (all fictional).

**Problem.** Sales teams lose leads to slow responses, inconsistent qualification and manual scheduling. VaaniQ answers instantly in the customer's language, qualifies transparently, and books visits, without letting a language model take uncontrolled actions.

**Solution.** A modular-monolith Node/Express API with PostgreSQL and a React dashboard. Each customer turn runs: analysis (rule NLU, optionally augmented by a validated LLM) → CRM update → RAG answer with citations → booking flow (availability → proposal → explicit consent → transactional booking) → explainable re-scoring → persisted decision trace.

**Key design decisions**
1. **AI proposes, backend disposes:** five allow-listed tools behind Zod validation; booking requires a pending proposal plus a rule-detected "yes" plus identical arguments plus a 10-minute expiry.
2. **Two-layer conflict safety:** a row lock on the lead plus a partial unique index on `(tenant_id, starts_at)` for confirmed visits.
3. **Explainability over opacity:** a deterministic 100-point score with reasons and missing info; BM25 relevance scores; a stored per-turn trace (no hidden chain-of-thought).
4. **Never invent:** extractors return nothing when unsure, retrieval has a relevance threshold, and slot times and confirmations are templated.
5. **Graceful degradation:** DEMO_MODE without keys, and automatic fallback to rules/extractive answers when the LLM fails, recorded in the trace.

**Delivered.** 8 UI pages (Dashboard, AI Voice Agent, Leads, Appointments, Knowledge Base, Conversations, Analytics, Agent Trace); browser STT/TTS in EN/HI/TE with a text fallback; 9 core tables plus knowledge chunks; seed and reset scripts; Docker Compose; API and architecture docs.

**Verification (actual results).** 39/39 automated tests pass (unit, PostgreSQL integration, HTTP end-to-end), including the full scenario, the consent gate, 5-way concurrent booking (exactly one succeeds), tenant isolation, LLM-output guards and LLM-failure fallback. Frontend lint and production build are clean; `npm audit` reports 0 vulnerabilities. The full scenario was also completed manually in the browser UI.

**Not verified / limitations.** Live Groq/Gemini calls (no key available; covered by mock-provider tests only); Docker images not built (daemon offline; compose config validated); no load testing; Hindi/Telugu understanding in DEMO_MODE is keyword-based; browser Telugu TTS depends on an installed voice.

**Scale path (100k registered users ≠ concurrent calls).** Stateless pods behind a load balancer, PgBouncer, read replicas for analytics, Redis for cache, rate limits and index invalidation, queues for summaries and ingestion, an LLM gateway with quotas and failover, OpenTelemetry, and Postgres RLS for tenant isolation in depth. Details: `SCALABILITY_AND_SECURITY.md`.
