---
doc_id: ABC-GHR-KB-45
tenant_slug: abc-developers
document_title: "Lead Qualification Process"
category: sales_operations
subcategory: lead_qualification
version: 1.0.0
status: active_demo
authority_level: 3
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
source_of_truth: "config/lead_scoring_rules.json"
approval_status: PENDING_REVIEW
---
# Lead Qualification Process

> **FICTIONAL DEMONSTRATION DATA — INTERNAL.** Scoring weights and thresholds are **deterministic application configuration** (`config/lead_scoring_rules.json`, APPROVED, authority level 1), mirrored from the VaaniQ scoring service. This document explains them; it does not define them. If the two differ, the configuration wins.

## 1. Purpose
Explains how VaaniQ scores a lead out of 100, what evidence each factor needs and how the score maps to a temperature and next action, so sales staff can trust and explain the score.

## 2. Business context
Qualification decides which leads get immediate human attention. A transparent, evidence-based score avoids arbitrary judgements and lets managers audit why a lead was marked hot. Scores are never set by the LLM.

## 3. Scoring model
| Factor | Weight | Scoring rule (fraction of weight) |
|---|---|---|
| Budget | 25 | ≥ lowest price of the stated configuration: 1.0; up to 10% below: 0.7; 10–20% below: 0.4; more than 20% below: 0.15; not stated: 0 |
| Requirements | 25 | Bedrooms 9, location 8, purpose 4, preferences 4 |
| Timeline | 20 | ≤ 1 month: 1.0; ≤ 3 months: 0.7; ≤ 6 months: 0.4; > 6 months: 0.15; unknown: 0 |
| Decision authority | 15 | Self: 1.0; joint: 0.67; other: 0.33; unknown: 0 |
| Appointment | 15 | Visit booked: 1.0; visit requested: 0.8; none: 0 |

| Temperature | Score |
|---|---|
| Hot | ≥ 75 |
| Warm | 50 – 74 |
| Cold | < 50 |

### 3.1 Rules
- Unknown information scores 0; the agent never assumes.
- Points require evidence from customer-stated facts or system records; each factor stores its evidence.
- Budget comparison uses the lowest indicative base price from `config/pricing_catalog.json` (2BHK ₹67,50,000; 3BHK ₹89,50,000).

### 3.2 Worked example
A customer wants a 3BHK in Gachibowli, budget ₹90 lakh, buying within a month, deciding alone, no visit yet: budget 25 (≥ ₹89.5 lakh), timeline 20, authority 15, requirements partly met (bedrooms 9 + location 8 = 17), appointment 0 → **77, hot**. After confirming a visit, appointment adds 15 → 92.

## 4. Customer-facing explanation
The score is internal and is not read out to customers. If asked, the agent says: "I note your requirements so our team can help you better."

## 5. Important conditions
- The LLM may extract facts; it cannot set or change a score.
- Weights per tenant may be configured by an administrator in settings; the configuration file is authoritative.

## 6. Exceptions
- A lead requesting a human callback is routed regardless of score (`ESC-01`).

## 7. Common questions (from sales staff)
| Question | Answer |
|---|---|
| "Why is this lead only warm?" | Check missing evidence (often timeline or authority). |
| "Can I override the score?" | Status can be changed in the CRM; the computed score remains auditable. |

## 8. What the AI agent can confidently answer
Internal explanation only; never quote a score to a customer.

## 9. What the AI must not claim
That a customer is "pre-qualified" for a loan or a unit.

## 10. Escalation
Hot leads → **sales executive** follow-up per `ABC-GHR-KB-52`; scoring disputes → **sales manager**.

Related documents: `ABC-GHR-KB-44`, `ABC-GHR-KB-46`, `ABC-GHR-KB-52`.
