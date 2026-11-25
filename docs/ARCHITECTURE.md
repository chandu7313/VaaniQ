# VaaniQ Architecture

> Status legend used across the docs: **Implemented** (built and covered by tests) · **Partial** (works with stated limits) · **Mocked/Demo** (deterministic stand-in, clearly labelled in the UI) · **Planned** (designed, not built).

## 1. System overview

A **modular monolith**: one Node.js/Express process with clearly separated service modules, one PostgreSQL database, and a React SPA. No microservices: each module could be extracted later, but today the extra network hops and operational cost would buy nothing.

```mermaid
flowchart TB
  %% ---------- Customer side ----------
  subgraph CI["Customer interface · React SPA (browser)"]
    direction LR
    UI["AI Voice Agent screen<br/>transcript · sources · score · trace"]
    ADMIN["Admin console<br/>Dashboard · Leads · Appointments · Knowledge<br/>Conversations · Call Intelligence · Trace · Settings"]
  end

  subgraph VP["Voice processing · in the browser"]
    direction LR
    STT["Speech-to-Text<br/>Web Speech API · en-IN / hi-IN / te-IN"]
    TTS["Text-to-Speech<br/>speechSynthesis · per-language voice"]
  end

  STT -->|"final transcript: text only, no audio stored"| UI
  UI -->|reply text| TTS

  %% ---------- Backend ----------
  subgraph API["Backend API · Express (Node.js)"]
    MW["Security middleware<br/>Helmet · CORS allow-list · rate limits<br/>JWT auth → tenantId · Zod validation"]
    ROUTES["Routes → Controllers<br/>(42 REST endpoints)"]
    MW --> ROUTES
  end

  UI -->|"HTTPS /api + JWT"| MW
  ADMIN -->|"HTTPS /api + JWT"| MW

  subgraph CORE["Agent core"]
    ORCH["Agent Orchestrator<br/>one turn: analyse → retrieve → act → score → respond"]
    NLU["Intent & entity extraction<br/>rules always · LLM additive (Zod-validated)"]
    SENT["Sentiment analysis<br/>transcript text · confidence · evidence"]
    MEM["Conversation memory<br/>last 12 messages · session state · lead profile"]
    RESP["Response generation<br/>grounded LLM answer or extractive quote<br/>numeric grounding guard"]
  end

  ROUTES --> ORCH
  ORCH --> NLU
  ORCH --> SENT
  ORCH --> MEM
  ORCH --> RESP

  subgraph AI["LLM provider abstraction"]
    LLM["Groq · Gemini · DEMO_MODE (rules)<br/>timeouts · JSON mode · keys server-side"]
  end
  NLU -.->|optional| LLM
  RESP -.->|optional| LLM
  LLM -.->|HTTPS| EXT[("Groq / Gemini APIs")]

  subgraph TOOLS["Tool execution · the only path to business actions"]
    EXEC["Executor<br/>registered? → inputs valid? → actor authorized?<br/>→ resources in tenant? → consent gate → run → audit"]
    T1["searchKnowledge"]
    T2["qualifyLead · calculateLeadScore"]
    T3["checkAvailability · bookAppointment"]
    T4["saveLead · updateLead"]
    T5["generateCallSummary · escalateToHuman"]
    EXEC --> T1 & T2 & T3 & T4 & T5
  end

  ORCH --> EXEC
  ROUTES -->|staff actions| EXEC

  subgraph SVC["Domain services"]
    RAG["RAG retrieval<br/>BM25 top-3 · relevance threshold · citations"]
    KB["Knowledge base<br/>ingest · heading-aware chunking · injection flagging"]
    LQ["Lead qualification<br/>5 weighted factors · evidence · next action"]
    APPT["Appointment service<br/>policy slots · transaction · unique-slot index"]
    CRM["CRM<br/>leads · customers · conversations · summaries"]
    SUM["Call summarisation<br/>concerns · buying intent · outcome"]
  end

  T1 --> RAG
  RAG --> KB
  T2 --> LQ
  T3 --> APPT
  T4 --> CRM
  T5 --> SUM

  subgraph OBS["Analytics & execution tracing"]
    TRACE["Agent decision trace<br/>per turn · PII-masked"]
    AUDIT["Tool audit log<br/>every attempt · agent and staff"]
    ANA["Analytics<br/>live SQL aggregates"]
  end

  ORCH --> TRACE
  EXEC --> AUDIT

  DB[("PostgreSQL<br/>11 tables · tenant_id on every row<br/>FKs · indexes · RLS deny-all")]
  KB --> DB
  APPT --> DB
  CRM --> DB
  SUM --> DB
  MEM --> DB
  LQ --> DB
  TRACE --> DB
  AUDIT --> DB
  ANA --> DB
  ROUTES --> ANA
```

**Hard rule:** the LLM never touches the database or the tools. Model output is *data* that is validated, merged with deterministic rules, and turned into tool calls by backend code. Customer consent for a booking is recognised only by deterministic rules on the customer's own words.

| Component | Status | Notes |
|---|---|---|
| Customer interface (8 + 1 pages), responsive | Implemented | 375 / 768 / 1440 px checked |
| Voice processing (browser STT/TTS) | Partial | depends on browser support and installed voices; feature-detected with text fallback |
| Backend API, auth, validation, rate limits | Implemented | 42 endpoints |
| Agent orchestrator, memory, NLU, sentiment | Implemented | rule NLU is the always-on baseline |
| LLM provider | Implemented (Groq live-verified) · Gemini adapter-tested only | DEMO_MODE when no key |
| RAG (BM25) + knowledge base | Implemented | embeddings/pgvector **planned** |
| Tool execution, audit | Implemented | 9 tools |
| Lead qualification, appointments, CRM, summaries | Implemented | |
| Analytics & tracing | Implemented | OpenTelemetry **planned** |
| Telephony, calendar sync, SMS/WhatsApp | Planned | |
| Company data and customers | Mocked/Demo | fictional "ABC Developers", labelled DEMO |

## 2. One agent turn (request flow)

`POST /api/conversations/:id/messages { text, language }` → `services/agent/orchestrator.js#handleTurn`

```mermaid
sequenceDiagram
  participant C as Customer (browser)
  participant O as Orchestrator
  participant A as Analyzer
  participant T as Tool Registry
  participant DB as PostgreSQL
  C->>O: text (+language)
  O->>DB: load conversation state + last 12 messages + lead
  O->>A: analyze(text, state)
  A-->>O: intent, entities, sentiment (rules, LLM additions validated)
  O->>DB: save customer message + sentiment
  O->>T: updateLead(new facts), validated + audited
  alt human request / sustained negative
    O->>T: escalateToHuman
  else customer said "yes" to a pending proposal
    O->>T: bookAppointment (consent gate checks exact proposal)
    T->>DB: BEGIN · lock lead · INSERT (unique slot index) · COMMIT
  else
    O->>T: searchKnowledge (BM25) → grounded answer + citations
    O->>T: checkAvailability → offer slots / ask contact / PROPOSE booking
  end
  O->>T: qualifyLead → score from stored facts, persisted
  O->>DB: save agent message, state, decision trace
  O-->>C: reply, sources, score, trace, pendingConfirmation, offeredSlots
  C->>C: speak reply (TTS)
```

## 3. Booking state machine (stored in `conversations.state`)

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> SlotsOffered: request_visit / slot preference<br/>(checkAvailability)
  SlotsOffered --> AwaitingContact: slot chosen, name/phone missing<br/>(state.desiredSlot)
  SlotsOffered --> AwaitingConfirmation: slot chosen + contact known<br/>(state.pendingProposal, 10-min TTL)
  AwaitingContact --> AwaitingConfirmation: name + phone given
  AwaitingConfirmation --> Booked: explicit "yes" (rule-detected)<br/>bookAppointment
  AwaitingConfirmation --> Idle: "no" (nothing booked)
  AwaitingConfirmation --> SlotsOffered: slot taken meanwhile (SLOT_TAKEN) → re-offer
  Booked --> [*]
```

## 4. Data model

```mermaid
erDiagram
  tenants ||--o{ users : has
  tenants ||--o{ leads : owns
  tenants ||--o{ conversations : owns
  tenants ||--o{ knowledge_documents : owns
  knowledge_documents ||--o{ knowledge_chunks : "chunked into"
  leads ||--o{ conversations : "talks in"
  leads ||--o{ appointments : books
  conversations ||--o{ messages : contains
  conversations ||--o| call_summaries : "summarised by"
  conversations ||--o{ agent_execution_logs : "traced by"
  conversations ||--o{ appointments : "booked in"
  tenants ||--o{ tool_audit_log : audits
  conversations ||--o{ tool_audit_log : "actions in"
```

Key constraints (from `backend/src/db/migrations/001_init.sql`):
- Every business table has `tenant_id` (FK, `ON DELETE CASCADE`) and indexes that lead with `tenant_id`.
- `appointments_slot_uq`: `UNIQUE (tenant_id, starts_at) WHERE status = 'confirmed'`. The database itself prevents double-booking.
- `leads_tenant_phone_uq`: one lead per phone per tenant (repeat-caller merge).
- `call_summaries.conversation_id UNIQUE`: one summary per call, upserted.
- CHECK constraints on every status/enum column and on `score BETWEEN 0 AND 100`.

## 5. Module responsibilities

| Module | Responsibility |
|---|---|
| `agent/orchestrator.js` | Runs a turn: decides the primary action, calls tools, composes the reply, persists the trace |
| `agent/analyzer.js` | Rule NLU always; optional LLM JSON analysis validated with Zod and merged *additively* |
| `agent/responder.js` | Answers from retrieved chunks only (LLM-grounded or extractive) |
| `agent/context.js` | Follow-up context for retrieval (previous topic + stated BHK), only when the message refers back |
| `agent/output.js` | Zod schema for the structured turn output, suggested action, explanation |
| `agent/templates.js` | EN/HI/TE fragments. Booking/slot statements are always templated |
| `controllers/*` | HTTP layer: read validated input, call services, shape the `{ data }` response (routes only declare paths, middleware and schemas) |
| `tools/definitions.js` | The 9 tool definitions: schema, actors, scope, consent requirement (no behaviour) |
| `tools/handlers.js` | Tool implementations, reachable only through the executor |
| `tools/executor.js` | validate → authorize (actor + tenant scope) → consent gate → execute → audit row |
| `rag/*` | Chunking, BM25, ingestion, retrieval with relevance threshold, query expansion |
| `nlu.js` / `sentiment.js` / `lexicon.js` | Deterministic multilingual extraction, intent flags, sentiment with evidence |
| `leadScoring.js` | Configurable 100-point model with reasons and missing info |
| `memory.js` | Conversations, messages, 12-message window, state persistence |
| `crm.js` | Leads, fact merge (never overwrite with empty), phone merge, status rules |
| `appointments.js` | Slot policy, availability, transactional booking, reschedule, cancel |
| `summary.js` | Structured call summary + rule-based next actions (+ optional LLM narrative) |
| `analytics.js` | Live SQL aggregates for the dashboard and analytics pages |
| `llm/*` | Provider abstraction: `chat({system, messages, json})`, timeouts, no key logging |
