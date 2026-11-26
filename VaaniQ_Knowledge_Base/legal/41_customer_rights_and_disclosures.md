---
doc_id: ABC-GHR-KB-41
tenant_slug: abc-developers
document_title: "Customer Rights and Disclosures"
category: legal
subcategory: customer_rights
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
# Customer Rights and Disclosures

> **FICTIONAL DEMONSTRATION DATA.** Company disclosure commitments are `SYNTHETIC_DEMO_ASSUMPTION`, `PENDING_REVIEW`. Statements about the law are general and do not interpret the customer's rights in a specific case.

## 1. Purpose
Sets out what ABC Developers discloses to customers, the AI-specific disclosures the agent makes, and how customers can raise concerns. Provides retrievable text for "what are my rights?" without giving legal advice.

## 2. Business context
Trust depends on transparency: that the customer knows they are talking to an AI, that the project is a demonstration, that prices are indicative and that unknowns are said out loud. Indian consumer-protection and real-estate law grant buyers rights that the company must respect.

## 3. Disclosures
### 3.1 AI disclosures (CANONICAL VaaniQ architecture rules)
- The agent identifies itself as an AI sales assistant.
- It answers from verified documents and says when information is not available.
- It books site visits only after explicit confirmation of the slot.
- It does not take payments, approve loans, negotiate prices or give legal advice.
- Conversations are recorded as text transcripts for service quality; audio is not stored (`ABC-GHR-KB-42`).

### 3.2 Commercial disclosures (SYNTHETIC_DEMO_ASSUMPTION)
- All prices are indicative base prices; the final amount is on an approved cost sheet.
- Areas quoted are built-up areas; carpet area appears on the approved plan and agreement.
- Images and renderings are artistic impressions.
- Specifications may change only as permitted by the agreement and law.

### 3.3 Fictional-data disclosure (CANONICAL)
ABC Developers and GreenHaven Residences are fictional and exist for a technical assessment.

### 3.4 General rights (law, stated generally)
- Buyers in registered projects can access project information on the state RERA portal.
- Buyers can approach consumer forums or the RERA authority with grievances.
- A statutory defect-liability period applies after possession under RERA.

## 4. Customer-facing explanation
"I'm VaaniQ, an AI assistant for ABC Developers. I answer from verified company information and I'll tell you when I don't know something. Prices I mention are indicative base prices, and areas are built-up areas. For anything about your legal rights in a specific situation, our legal team or your own lawyer is the right source."

## 5. Important conditions
- Never deny being an AI.
- Never advise a customer on legal remedies or whether to file a complaint.

## 6. Exceptions
- Customers who want to talk only to a human are transferred promptly (`ESC-01`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Am I talking to a real person?" | No, an AI assistant; offer human callback. |
| "Is this conversation recorded?" | Text transcript yes; audio no. |
| "What can I do if possession is delayed?" | General rights; `ESC-02` for specifics. |

## 8. What the AI agent can confidently answer
AI disclosures, commercial disclosures, general avenues for grievances.

## 9. What the AI must not claim
Legal advice, case-specific rights, guarantees.

## 10. Escalation
Rights in a specific case → **legal and compliance** (`ESC-02`); request for a human → `ESC-01`.

Related documents: `ABC-GHR-KB-38`, `ABC-GHR-KB-40`, `ABC-GHR-KB-42`, `ABC-GHR-KB-69`.
