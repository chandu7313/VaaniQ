---
doc_id: ABC-GHR-KB-07
tenant_slug: abc-developers
document_title: "Project Master Overview"
category: project
subcategory: overview
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: true
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: 
  - "seed:GreenHaven Residences - Project Overview"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Project Master Overview

> **FICTIONAL DEMONSTRATION DATA.** GreenHaven Residences is a synthetic project. Canonical facts (name, location, configurations, towers, indicative areas and prices) come from the knowledge-base brief; other details are `SYNTHETIC_DEMO_ASSUMPTION`. Legal and regulatory facts are `NOT_PROVIDED`.

## 1. Purpose
The single best answer to "Tell me about GreenHaven Residences." It summarises the project and points to the detailed documents. Structured values are mastered in `config/project_catalog.json` and `config/pricing_catalog.json`.

## 2. Business context
Most conversations start with a general question about the project. A precise, consistent overview anchors every later answer and prevents conflicting descriptions across channels.

## 3. Project at a glance
| Attribute | Value | Status |
|---|---|---|
| Project name | GreenHaven Residences | CANONICAL |
| Developer | ABC Developers | CANONICAL |
| Location | Gachibowli, Hyderabad, Telangana, India | CANONICAL |
| Type | Gated residential apartment community | SYNTHETIC_DEMO_ASSUMPTION |
| Towers | Tower A and Tower B (fictional sample towers) | CANONICAL |
| Floors per tower | 18 | SYNTHETIC_DEMO_ASSUMPTION |
| Total apartments | 264 (66 × 2BHK and 66 × 3BHK per tower) | SYNTHETIC_DEMO_ASSUMPTION |
| Land area | about 4.2 acres | SYNTHETIC_DEMO_ASSUMPTION |
| Open space | about 70 percent | SYNTHETIC_DEMO_ASSUMPTION |
| Configurations | 2BHK and 3BHK | CANONICAL |
| 2BHK built-up area | approximately 1,180 sq.ft | CANONICAL |
| 3BHK built-up area | approximately 1,560 sq.ft | CANONICAL |
| 2BHK indicative base price | ₹67,50,000 – ₹69,00,000 | CANONICAL |
| 3BHK indicative base price | ₹89,50,000 – ₹92,00,000 | CANONICAL |
| Carpet areas | — | NOT_PROVIDED |
| RERA registration number | — | NOT_PROVIDED |
| Possession date | — | NOT_PROVIDED |
| Construction status | — | REQUIRES_HUMAN_CONFIRMATION |

Prices are **indicative base prices** before additional charges and taxes; a final amount appears only on an approved cost sheet (`ABC-GHR-KB-27`, `ABC-GHR-KB-32`). Current unit availability lives in the live inventory system (NOT_CONFIGURED in the demo app) and is **never** quoted from documents.

## 4. Highlights (SYNTHETIC_DEMO_ASSUMPTION unless stated)
- Two towers around a central landscaped podium with a clubhouse of approximately 25,000 sq.ft (`ABC-GHR-KB-21`).
- Swimming pool, gymnasium, yoga deck, badminton court, children's play area, senior citizens' park and jogging track (`ABC-GHR-KB-22` – `ABC-GHR-KB-24`). Operational dates are NOT_PROVIDED.
- Covered parking: one slot for each 2BHK and two for each 3BHK (`ABC-GHR-KB-19`).
- Solar lighting for common areas, sewage treatment, rainwater harvesting and EV-charging provisions (`ABC-GHR-KB-12`).

## 5. Customer-facing explanation
"GreenHaven Residences is a gated apartment community by ABC Developers in Gachibowli, Hyderabad, with 2BHK and 3BHK homes in Tower A and Tower B. A 2BHK has a built-up area of about 1,180 sq.ft with an indicative base price of ₹67.5 lakh to ₹69 lakh; a 3BHK is about 1,560 sq.ft at ₹89.5 lakh to ₹92 lakh, before additional charges and taxes. It's a demonstration project, and our sales team confirms exact unit details."

## 6. Important conditions
- Always say "indicative" and "before additional charges and taxes" when quoting prices.
- Always say "built-up area" (not carpet area) for 1,180 and 1,560 sq.ft.

## 7. Exceptions
- If an older brochure, screenshot or the live app shows different sizes or prices, the canonical values above govern and the discrepancy is reported (`reports/source_reconciliation_report.md`).

## 8. Common customer questions
| Question | Answer approach |
|---|---|
| "How big is a 3BHK?" | About 1,560 sq.ft built-up; carpet area NOT_PROVIDED. |
| "What's the price?" | Indicative ranges above; final cost sheet from sales. |
| "Is it RERA approved?" | NOT_PROVIDED; escalate (ESC-02). |
| "When is possession?" | NOT_PROVIDED; escalate (ESC-03). |
| "How many units are left?" | Live inventory only; offer sales follow-up. |

## 9. What the AI must not claim
Carpet areas, RERA numbers, approvals, possession dates, construction percentages, availability counts, discounts, or that prices are final.

## 10. Escalation
Legal questions → `ESC-02`; possession → `ESC-03`; final pricing → `ESC-05`; availability → sales executive (`ESC-08`).

Related documents: `ABC-GHR-KB-08`, `ABC-GHR-KB-09`, `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-27`.
