---
doc_id: ABC-GHR-KB-42
tenant_slug: abc-developers
document_title: "Data Privacy and Customer Consent"
category: legal
subcategory: privacy
version: 1.0.0
status: active_demo
authority_level: 2
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: true
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "authorised legal representative (facts NOT_PROVIDED in this knowledge base)"
approval_status: PENDING_REVIEW
---
# Data Privacy and Customer Consent

> **FICTIONAL DEMONSTRATION DATA.** VaaniQ's technical behaviour (no audio storage, PII masking in traces, consent-gated booking) is CANONICAL — it is how the application is built. Retention periods, the named data-protection contact and the formal privacy notice are `NOT_CONFIGURED` / `REQUIRES_HUMAN_CONFIRMATION`.

## 1. Purpose
Explains what personal data VaaniQ collects, why, how consent works, and how customers exercise privacy choices. Aligns the agent's statements with India's Digital Personal Data Protection Act, 2023 (DPDP Act) in general terms.

## 2. Business context
A sales agent necessarily collects names, phone numbers and budgets. Customers must know what is collected and be able to stop contact or request deletion. Over-promising (for example "we never store anything") is as wrong as under-disclosing.

## 3. Data practices
| Data | Purpose | Practice | Status |
|---|---|---|---|
| Name, phone (with consent) | Follow-up and appointment | Stored in CRM; masked in decision traces and audit logs | CANONICAL |
| Budget, preferences, timeline | Lead qualification | Stored in CRM with evidence | CANONICAL |
| Conversation text | Service quality, summaries | Stored as transcript | CANONICAL |
| Audio | Speech recognition only | Not stored by VaaniQ; processed transiently (browser or server speech-to-text) | CANONICAL |
| Retention period | — | NOT_CONFIGURED | NOT_CONFIGURED |
| Data-protection contact | — | NOT_CONFIGURED | NOT_CONFIGURED |

### 3.1 Consent rules
- The agent asks before recording contact details for follow-up.
- An appointment is created only after the customer explicitly confirms the exact slot; the LLM cannot grant consent (CANONICAL).
- A customer can withdraw consent at any time ("stop calling me", "delete my data").

### 3.2 Handling privacy requests (SYNTHETIC_DEMO_ASSUMPTION)
1. Agent acknowledges and confirms the request is recorded.
2. Marketing contact stops for that customer.
3. The data-protection contact processes deletion or access requests (`ESC-09`).

## 4. Customer-facing explanation
"We store your name and number only with your permission, to follow up and schedule visits, and we keep a text record of our conversation. Audio isn't stored. If you'd like us to stop contacting you or delete your details, just tell me and I'll record the request."

## 5. Important conditions
- Never claim certifications (ISO, SOC) or legal compliance status.
- Never read back a full phone number aloud unless the customer asked to confirm it.

## 6. Exceptions
- Records required by law or for an existing contract may be retained after a deletion request; the data-protection contact explains (REQUIRES_HUMAN_CONFIRMATION).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Are you recording my voice?" | Audio not stored; transcript yes. |
| "Delete my number." | Record request; `ESC-09`. |
| "Who sees my data?" | ABC Developers' sales and CRM teams. |

## 8. What the AI agent can confidently answer
What is collected, why, consent rules, how to make a request.

## 9. What the AI must not claim
Retention periods, compliance certifications, absolute security.

## 10. Escalation
Privacy requests → **data-protection contact** (`ESC-09`).

Related documents: `ABC-GHR-KB-05`, `ABC-GHR-KB-41`, `ABC-GHR-KB-44`.
