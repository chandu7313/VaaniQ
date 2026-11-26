---
doc_id: ABC-GHR-KB-60
tenant_slug: abc-developers
document_title: "Customer Objection Library"
category: customer_support
subcategory: objection_library
version: 1.0.0
status: active_demo
authority_level: 4
data_classification: internal
retrieval_scope: agent_internal
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/*.json (FAQ answers restate structured records)"
approval_status: PENDING_REVIEW
---
# Customer Objection Library

> **FICTIONAL DEMONSTRATION DATA — INTERNAL GUIDANCE (authority level 4).** A catalogue of objections as customers actually phrase them, grouped by theme and mapped to the response pattern in `ABC-GHR-KB-49`. It adds phrasing variety for retrieval; it adds no new facts.

## 1. Purpose
Helps the agent recognise an objection however it is phrased (including Hindi and Telugu wording) and choose the right pattern and escalation.

## 2. Business context
`ABC-GHR-KB-49` defines how to respond; this library captures how objections sound. Recognising "bahut mehenga hai" and "ధర ఎక్కువ" as the same price objection improves consistency across languages.

## 3. Library
| Theme | Example phrasings | Pattern / facts | Escalation |
|---|---|---|---|
| Price | "too costly", "out of my budget", "bahut mehenga hai", "ధర చాలా ఎక్కువ" | Indicative ranges, no discount (`ABC-GHR-KB-27`, `ABC-GHR-KB-35`) | ESC-04 |
| Hidden costs | "what else will I pay?", "extra charges kitne hain?" | Name charge categories; amounts on cost sheet (`ABC-GHR-KB-32`) | ESC-05 |
| Size | "carpet area is less", "flat chhota lagta hai" | Built-up area only; carpet not provided (`ABC-GHR-KB-18`) | ESC-08 |
| Trust | "is the builder genuine?", "fraud toh nahi?", "నమ్మకమైన బిల్డరా?" | Company profile; verify documents (`ABC-GHR-KB-01`, `ABC-GHR-KB-39`) | ESC-02 |
| Legal | "RERA hai kya?", "title clear?" | Not provided; RERA portal (`ABC-GHR-KB-38`) | ESC-02 |
| Delay | "projects always get delayed", "possession kab?" | Possession not provided (`ABC-GHR-KB-67`) | ESC-03 |
| Location | "too much traffic", "far from my office" | No distances; visit at commute time (`ABC-GHR-KB-54`) | ESC-08 |
| Timing | "I'll wait", "prices may fall" | No forecast; offer updates with consent | — |
| Loan | "loan nahi milega", "EMI zyada hai" | Lender decides; EMI illustration (`ABC-GHR-KB-33`) | ESC-07 |
| Competition | "other project is cheaper" | Own facts only; no disparagement | ESC-04 |
| Amenities | "pool ready hai?", "clubhouse kab banega?" | Planned; dates not provided (`ABC-GHR-KB-21`) | ESC-03 |
| Pressure | "stop pushing me" | Apologise; stop; offer to end or callback | ESC-06 if upset |

### 3.1 Recognition hints
- Objections often combine with intent ("too expensive, but I like it") — treat as interest, not rejection.
- Negative sentiment plus objection → empathy first.

## 4. Customer-facing explanation
Responses follow `ABC-GHR-KB-49` patterns.

## 5. Important conditions
- Never argue; never use scarcity or urgency not shown by live data.

## 6. Exceptions
- If the customer ends the conversation, respect it.

## 7. Common customer questions
The library rows are the questions.

## 8. What the AI agent can confidently answer
Recognition and routing.

## 9. What the AI must not claim
New facts beyond referenced documents.

## 10. Escalation
As listed per theme.

Related documents: `ABC-GHR-KB-49`, `ABC-GHR-KB-61`.
