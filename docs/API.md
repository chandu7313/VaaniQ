# VaaniQ REST API

Base path `/api`. JSON in, JSON out.

**Envelope.** Success: `{ "data": ... }`. Error: `{ "error": { "code", "message", "details?", "requestId" } }`.
Every response carries an `x-request-id` header.

**Auth.** All endpoints except `/health` and `/auth/login` need `Authorization: Bearer <JWT>`. The tenant is taken **only** from the verified token, never from the request.

**Validation.** Every body, query and path parameter is validated with Zod. Failures return `400 VALIDATION_ERROR` with `details: [{ path, message }]`.

**Rate limits.** 300 req/min/IP on `/api` (configurable), 20 logins per 15 min, 60 agent turns/min.

| Status | Codes you may see |
|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON` |
| 401 | `UNAUTHENTICATED`, `INVALID_TOKEN` (bad/expired signature, or the user no longer exists), `INVALID_CREDENTIALS` |
| 404 | `NOT_FOUND` (also returned for other tenants' resources, so their existence is not revealed) |
| 409 | `SLOT_TAKEN`, `LEAD_ALREADY_BOOKED`, `CONVERSATION_ENDED` |
| 422 | `SLOT_OUTSIDE_POLICY` |
| 429 | rate limited |
| 500 | `INTERNAL_ERROR` (details only in server logs, keyed by `requestId`) |

---

## Health and auth

### `GET /health`
`200 { data: { status: "ok", database: "ok", time } }`, or `503 { error: { code: "DB_UNAVAILABLE", message } }` with a human-readable reason (never the connection string).

### `POST /auth/login`
Body `{ email, password }` → `200 { data: { token, user: { id, email, fullName, role, tenantName } } }`. Wrong email or password: `401 INVALID_CREDENTIALS` (same message for both).

### `GET /auth/me`
Current user and tenant name.

### `GET /meta`
`{ demoMode, provider, configuredProvider, languages, tenant: { name, isDemo, catalog, scoring, booking }, tools: [{ name, description, sideEffect, requiresConfirmation }] }`

## Conversations and the agent

### `POST /conversations`
Body `{ language?: "en"|"hi"|"te" = "en", channel?: "voice"|"text" = "voice" }`.
Creates a lead and a conversation, and stores the greeting. → `201 { data: { conversation, greeting, leadId } }`

### `POST /conversations/:id/messages`: one agent turn
Body `{ text: string (1..1000), language?: "en"|"hi"|"te" }`

```json
{
  "data": {
    "reply": "Noted: a 3BHK, in Gachibowli, budget around ₹90 lakh, ... Which one suits you?",
    "messageId": "uuid",
    "outcome": "slots_offered",
    "language": "en",
    "sources": [{ "documentId": "uuid", "title": "ABC Heights - Project Overview", "section": "Apartment configurations", "relevance": 0.42 }],
    "analysis": {
      "source": "rules",
      "intent": "request_visit",
      "secondaryIntents": ["ask_info", "provide_info"],
      "entities": { "bedrooms": 3, "location": "Gachibowli", "budgetMax": 9000000, "budgetApprox": true, "timelineMonths": 1 },
      "entitySources": { "bedrooms": "rules" },
      "sentiment": { "label": "neutral", "confidence": 0.5, "evidence": [], "method": "lexicon" }
    },
    "score": { "total": 74, "classification": "warm", "factors": [{ "key": "budget", "label": "Budget fit", "max": 25, "points": 25, "reason": "Budget ₹90 lakh fits the 3BHK range ₹88–115 lakh" }], "missing": ["purpose", "preferences", "decisionMaker"] },
    "lead": { "id": "uuid", "full_name": null, "status": "qualified", "score": 74, "profile": {}, "is_demo": true },
    "pendingConfirmation": null,
    "offeredSlots": [{ "startsAt": "2026-11-26T05:30:00.000Z", "endsAt": "...", "label": "Thursday, 26 Nov, 11:00 am" }],
    "conversationStatus": "active",
    "trace": { "...": "see Agent Decision Trace below" }
  }
}
```
**Structured fields** (validated with Zod in `services/agent/output.js` *before* anything is persisted or returned):

| Field | Meaning |
|---|---|
| `reply` | assistant response text |
| `intent`, `secondaryIntents`, `entities`, `sentiment` | analysis result (entities PII-masked) |
| `leadQualification` | `{ total, classification, factors[5], missing[] }` |
| `sources` | ≤ 3 retrieved chunks `{ documentId, title, section, relevance }` |
| `suggestedAction` | `{ type: confirm_booking \| choose_slot \| provide_contact \| ask_qualification \| human_handoff \| prepare_visit \| none, tool?, args?, field?, requiresConfirmation, executed, reason }`, derived from backend state, never from model text |
| `explanation` | one concise, auditable sentence chain built from recorded facts, e.g. `Intent: ask_info via rules. Answered from 3 source(s), top "Price list" (relevance 0.468). Tools: update_lead, search_knowledge_base. Lead score 0→9 (cold). Next: ask qualification.` |
| `session` | `{ conversationId, leadId, turn, language, status, historyMessagesUsed }` |

The older fields (`analysis`, `score`, `lead`, `pendingConfirmation`, `offeredSlots`, `conversationStatus`, `trace`) are still returned for the UI.

`outcome` is one of: `slots_offered`, `awaiting_contact`, `confirmation_requested`, `appointment_booked`, `proposal_declined`, `booking_conflict`, `booking_failed`, `already_booked`, `no_availability`, `info_provided`, `info_not_found`, `escalated`, `greeted`, `goodbye`, `responded`.
Errors: `404` unknown/other-tenant conversation, `409 CONVERSATION_ENDED`.

### `POST /conversations/:id/end`
Generates and upserts the call summary and marks the call ended. → `{ data: summary }`:
`{ generatedAt, language, customer:{name, phoneOnFile, isDemo}, requirements:{configuration, location, budget, timeline, decisionMaker, purpose, preferences}, topicsDiscussed, sentiment:{overall, start, end, trend, sequence}, leadScore, outcome, appointment, turns, recommendedNextActions[], narrative, narrativeMethod }`

### `GET /conversations` · `GET /conversations/:id` · `GET /conversations/:id/traces`
List (with lead name, score, message count, first message); detail (messages with sentiment, evidence, sources; lead; summary); the full decision traces for a conversation.

## Leads (CRM)
- `GET /leads?status=&search=`: list
- `GET /leads/:id`: lead + conversations + appointments + summaries
- `PATCH /leads/:id` body `{ status?, fullName?, email? }` (strict: unknown fields are rejected)

## Appointments
- `GET /appointments?from=ISO&status=confirmed|cancelled|completed|no_show`
- `GET /appointments/availability?date=YYYY-MM-DD&daypart=morning|afternoon|evening&limit=`: free slots read from the database
- `POST /appointments` body `{ leadId, startsAt, notes? }`: manual booking by signed-in staff (the staff member is the confirming human)
- `PATCH /appointments/:id/status` body `{ status }`
- `PATCH /appointments/:id/reschedule` body `{ startsAt }` → `409 SLOT_TAKEN` / `422 SLOT_OUTSIDE_POLICY`

## Knowledge base
- `GET /knowledge`: documents with `chunk_count`, `flagged_chunks`
- `POST /knowledge` body `{ title (3..150), content (20..200000), sourceType? }` → `201 { id, title, chunkCount, flaggedChunks }`
- `GET /knowledge/:id`: document + chunks
- `DELETE /knowledge/:id` → `204`
- `POST /knowledge/search` body `{ query, k? }` → `[{ chunkId, documentId, title, section, content, score, relevance }]` (no threshold, for the tester UI)

## Analytics and traces
- `GET /analytics/overview` → `{ kpi, leadsByStatus, scoreBuckets, daily[14], sentiment, intents, outcomes, tools[{tool, calls, succeeded}], latency{avg_ms, p95_ms}, upcoming, generatedAt }`
- `GET /traces?conversationId=&limit=`: turn index, intent, outcome, provider, latency, step count, score
- `GET /traces/:id`: one full trace row

### Agent Decision Trace (stored in `agent_execution_logs.trace`)
```json
{
  "turn": 3, "language": "en", "provider": "demo-rules", "demoMode": true,
  "input": "Yes, please confirm",
  "events": [{ "step": "memory", "ms": 2, "summary": "Session 64d6edba: 4 prior message(s) loaded, booking proposal pending" },
             { "step": "intent", "ms": 4, "summary": "confirm [rules]" }, { "step": "tool", "ms": 9, "summary": "book_appointment: validated and executed" },
             { "step": "scoring", "ms": 11, "summary": "Lead score 74 → 77 (hot)" }, { "step": "output_validated", "ms": 11, "summary": "Structured output valid; suggested action: prepare_visit" }],
  "explanation": "Intent: confirm via rules. Tools: book_appointment. Lead score 74→77 (hot). Next: prepare visit.",
  "suggestedAction": { "type": "prepare_visit", "tool": "book_appointment", "requiresConfirmation": true, "executed": true, "reason": "..." },
  "analysis": { "source": "rules", "intent": "confirm", "entities": {}, "sentiment": {} },
  "retrieval": { "query": "...", "hits": [{ "title": "...", "section": "...", "score": 3.1, "relevance": 0.61 }], "answerMethod": "extractive" },
  "proposal": { "tool": "book_appointment", "args": { "startsAt": "..." }, "requiresConfirmation": true, "status": "confirmed_by_customer" },
  "steps": [{ "tool": "book_appointment", "reason": "...", "sideEffect": "write",
              "validation": { "ok": true, "checks": ["tool registered", "arguments valid", "customer confirmed this exact proposal"] },
              "ok": true, "result": {}, "durationMs": 4 }],
  "scoring": { "previous": 74, "total": 77, "classification": "hot", "factors": [], "missing": [] },
  "response": { "text": "...", "sources": [], "outcome": "appointment_booked" },
  "errors": [], "latencyMs": 12
}
```
Phone numbers and e-mails are masked (`******70`, `***@domain`) before the trace is stored. Hidden model reasoning is never requested, stored or shown.
