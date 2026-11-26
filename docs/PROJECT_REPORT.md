# VaaniQ: Project Report

**Autonomous AI sales agent / conversational-intelligence platform** · demo tenant: *ABC Developers* (fictional), 2BHK/3BHK apartments in Gachibowli, Hyderabad.

**1. Business problem.** Inbound property enquiries arrive in several languages and at all hours. Sales teams answer slowly, qualify inconsistently, and schedule visits by hand, so warm leads go cold. Generic chatbots either cannot act or act unsafely: they invent prices, or book without consent.

**2. Proposed solution.** A digital sales employee that talks to customers by voice or text in English, Hindi or Telugu. It answers **only from verified company documents** with citations, qualifies leads with a **transparent score**, books site visits **only after explicit confirmation**, records everything in a CRM, and exposes an **auditable decision trace** for every turn.

**3. Core features (implemented and tested).** Voice agent (browser STT/TTS with text fallback) · intent and entity extraction · sentiment with evidence · BM25 RAG with source and section citations · conversation memory and follow-ups · explainable 100-point lead score (25/25/20/15/15) with evidence and next action · availability, consent, transactional booking and conflict prevention · CRM CRUD (leads, customers, conversations, appointments, call summaries) · structured call summaries · executive dashboard and call-intelligence analytics from live SQL · agent decision trace and tool audit log · 9-page admin console.

**4. Technical architecture.** Modular monolith: React + Vite SPA → Express API (Helmet, CORS allow-list, rate limits, JWT, Zod) → agent orchestrator → **tool executor** (validate → authorize → consent → execute → audit) → domain services → PostgreSQL (11 tables, tenant-owned rows, FKs, indexes, deny-all RLS). See `ARCHITECTURE.md`.

**5. AI and RAG implementation.** Rule-based NLU always runs; an LLM (Groq or Gemini through one provider abstraction) may *add* intents and entities after Zod validation, but can never confirm a booking. Retrieval is BM25 over 18 heading-aware company documents (top 3, relevance threshold 0.20, unseen topic words lower relevance); prompt-injection-like chunks are excluded. Answers are LLM-grounded in `<context>`, with a **numeric grounding guard** that rejects any figure not in the sources. Without a key, DEMO_MODE quotes the best-matching source sentences verbatim. Groq was verified live; Gemini is adapter-tested only.

**6. Technology stack.** React 19, Vite, Tailwind CSS 4, React Router, Recharts, Lucide · Node.js (ES modules), Express 5, Zod, `pg` with parameterized SQL, jsonwebtoken, scrypt · PostgreSQL · Groq/Gemini REST · Web Speech API · Docker Compose · `node:test` (105 tests).

**7. Security considerations.** Keys only on the server · env validated at boot · JWT with live user check (deleted users lose access immediately) · tenant id only from the token, tenant filter on every query (cross-tenant tests return 404) · admin-only deletes · Zod on every input · parameterized SQL · JSON-envelope rate limits including failed logins · PII masked in traces and audit · no audio stored · prompt-injection controls · deny-all RLS for hosted DBs.

**8. Scalability strategy.** Stateless API (all memory in PostgreSQL) → horizontal autoscaling behind a load balancer · PgBouncer and read replicas · Redis for cache, distributed rate limits and locks · queues for summaries and ingestion · an LLM gateway with quotas and failover · OpenTelemetry. *Registered users ≠ concurrent calls: capacity is sized by concurrent turns, and the main constraint is LLM rate limits.* **No load test has been run.**

**9. Commercial feasibility.** Multi-tenant by design (tenant settings for catalogue, scoring weights and booking policy) and industry-agnostic beyond the knowledge base, so it can be sold per seat or per conversation. Main running costs are LLM tokens per turn and speech services in production; DEMO_MODE shows a zero-LLM-cost degraded mode. No revenue, savings or usage figures are claimed.

**10. Current limitations.** Browser STT/TTS depends on the browser and installed voices · DEMO_MODE Hindi/Telugu understanding is keyword-based · English documents only (LLM translates; demo mode quotes English) · BM25 is lexical (no semantic retrieval) · single tenant seeded, no self sign-up UI · turn serialization is per process · Docker images and nginx headers not executed · no load testing.

**11. Future scope.** Telephony (SIP/Twilio) with streaming STT/TTS · pgvector or hybrid retrieval · PDF/DOCX ingestion · calendar sync and SMS/WhatsApp confirmations · per-tenant RLS policies, SSO, RBAC UI · Redis, queues and an LLM gateway · OpenTelemetry dashboards · calibrating scoring weights from conversion data.

*Status labels used in all docs: Implemented · Partial · Mocked/Demo · Planned. Evidence: `TEST_RESULTS.md`, `QA_REPORT.md`.*
