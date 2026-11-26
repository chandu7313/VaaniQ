---
doc_id: ABC-GHR-KB-44
tenant_slug: abc-developers
document_title: "Customer Enquiry Workflow"
category: sales_operations
subcategory: enquiry_workflow
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: internal
retrieval_scope: agent_internal
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: true
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/sales_policy.json + config/escalation_matrix.json"
approval_status: PENDING_REVIEW
---
# Customer Enquiry Workflow

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** The workflow reflects how the VaaniQ application processes a turn (CANONICAL, implemented behaviour) and how the human sales team follows up (`SYNTHETIC_DEMO_ASSUMPTION`).

## 1. Purpose
Describes the end-to-end path of a customer enquiry — from first message to qualified lead, appointment or escalation — so sales staff and the agent share one picture of who does what.

## 2. Business context
Enquiries arrive by voice or text in English, Hindi or Telugu, at any hour. VaaniQ answers immediately and captures structured information; the human team takes over where judgement, money or legal matters are involved.

## 3. Workflow
### 3.1 Per conversational turn (CANONICAL, as implemented)
| Step | What happens |
|---|---|
| 1. Input | Customer speaks or types; speech is transcribed (browser, or server speech-to-text fallback) |
| 2. Understanding | Language, intents and entities (budget, configuration, timeline, location, name) are extracted; sentiment is assessed from text |
| 3. Memory | Facts are merged into the conversation's memory; the latest stated budget wins |
| 4. Retrieval | Relevant knowledge chunks are retrieved with relevance scores |
| 5. Decision | The orchestrator decides: answer, ask a qualifying question, propose a visit, or escalate |
| 6. Tools | Availability lookup, appointment creation (only after explicit confirmation), CRM updates — each validated, authorised and audited |
| 7. Response | A grounded answer with sources, in the customer's language |
| 8. Trace | A decision trace records what was understood, retrieved and done (PII masked) |

### 3.2 Enquiry stages (SYNTHETIC_DEMO_ASSUMPTION for human steps)
1. **Greeting and need discovery** — configuration, budget, timeline, purpose.
2. **Information** — answers from the knowledge base with qualifiers.
3. **Qualification** — deterministic lead score (`ABC-GHR-KB-45`).
4. **Next action** — site visit offer, sales callback, or nurture.
5. **Handover** — sales executive reviews the call summary in the CRM and follows up (`ABC-GHR-KB-47`).

## 4. Customer-facing explanation
"I can answer your questions about GreenHaven Residences right away, and if you'd like, schedule a site visit or have our sales team call you back. I'll keep a note of what you've told me so you don't have to repeat it."

## 5. Important conditions
- One conversation per customer session; facts never leak between sessions.
- Availability is read from the live appointment system every time.
- Unknown information is stated as unknown and routed (`ESC-08`).

## 6. Exceptions
- Prompt-injection attempts in customer text or documents are ignored; the agent's rules come only from trusted backend configuration.
- If the database or AI provider is unavailable, the agent degrades gracefully (rules-based understanding, verbatim source quotes) and says when it cannot complete an action.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Will someone call me?" | Offer callback; record consent. |
| "Do I have to repeat my details?" | No; conversation memory and CRM. |
| "Can I talk in Telugu?" | Yes; English, Hindi, Telugu supported. |

## 8. What the AI agent can confidently answer
How the enquiry proceeds and what it can and cannot do.

## 9. What the AI must not claim
That a human is already assigned, or response times beyond the SLA document.

## 10. Escalation
Human request → `ESC-01`; unknown information → `ESC-08`; full matrix → `ABC-GHR-KB-50`.

Related documents: `ABC-GHR-KB-45`, `ABC-GHR-KB-46`, `ABC-GHR-KB-47`, `ABC-GHR-KB-50`.
