---
doc_id: ABC-GHR-KB-10
tenant_slug: abc-developers
document_title: "Construction Process and Quality Standards"
category: project
subcategory: construction
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
supersedes: []
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Construction Process and Quality Standards

> **FICTIONAL DEMONSTRATION DATA.** The construction process and quality practices are a `SYNTHETIC_DEMO_ASSUMPTION` describing typical good practice. **Current construction status, completion percentages and possession dates are `NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`.**

## 1. Purpose
Explains how ABC Developers builds and checks quality, and how construction progress is communicated, without stating any progress figure or date.

## 2. Business context
Under-construction buyers worry about delays and quality. Honest process information builds confidence; invented progress figures destroy it. Seed text previously described slab-level progress for each tower; that is now treated as unverified (reconciliation item R-11).

## 3. Construction process (SYNTHETIC_DEMO_ASSUMPTION)
| Stage | Description | Linked payment milestone (`ABC-GHR-KB-30`) |
|---|---|---|
| Foundation | Excavation, footing and foundation | Completion of foundation |
| Superstructure | RCC frame, slab by slab | 2nd, 5th, 8th, 11th, 14th and top (18th) slab |
| Masonry | Solid concrete block walls | — |
| Services | Plumbing, electrical, fire systems | — |
| Finishing | Plastering, flooring, painting, fixtures | Flooring and finishing |
| Handover | Inspection, snag rectification, possession | Possession |

## 4. Quality standards (SYNTHETIC_DEMO_ASSUMPTION)
- **Structural design** for seismic zone II (Hyderabad), by licensed structural consultants (names NOT_PROVIDED).
- **Material testing:** cube tests for concrete and supplier certificates for steel, recorded per batch.
- **Stage inspections:** a quality checklist at each stage, signed by the site engineer.
- **Snag inspection before handover** with the customer (`ABC-GHR-KB-67`).
- **Defect liability:** structural defects reported within 5 years of possession are rectified at no cost, as required under RERA (statutory obligation; the claim itself is not a project-specific certification).

Third-party audits, quality certifications and test reports are `NOT_PROVIDED`.

## 5. Customer-facing explanation
"Construction follows a stage-wise plan (foundation, slabs, services and finishing), with material tests and stage inspections. For the current progress of Tower A or Tower B, our project team shares verified updates, and I can request one for you."

## 6. Important conditions
- Never state a completion percentage, the current slab or a completion date.
- Payment milestones are triggered by **certified** stage completion, communicated by the CRM team (`ABC-GHR-KB-66`).

## 7. Exceptions
- If a customer quotes progress seen on site, the agent does not confirm or deny; it requests an official update.
- Delay or compensation questions go to the project and legal teams.

## 8. Common customer questions
| Question | Answer approach |
|---|---|
| "How much is complete?" | REQUIRES_HUMAN_CONFIRMATION; request an update (ESC-03). |
| "Is the project delayed?" | Not answerable; escalate (ESC-03). |
| "What cement / steel brand?" | NOT_PROVIDED. |
| "Can I visit the construction site?" | Yes, during a booked site visit with safety rules (`ABC-GHR-KB-48`). |

## 9. What the AI agent can confidently answer / must not claim
**Can answer:** the general process, the quality practices listed, that updates come from the project team.
**Must not claim:** progress status, dates, delays, certifications, brand names, guarantees beyond statutory defect liability.

## 10. Escalation
Progress, delay and possession questions → **project team** (`ESC-03`). Legal remedies → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-11`, `ABC-GHR-KB-30`, `ABC-GHR-KB-66`, `ABC-GHR-KB-67`.
