---
doc_id: ABC-GHR-KB-18
tenant_slug: abc-developers
document_title: "Area Measurement Guide"
category: apartments
subcategory: area_definitions
version: 1.0.0
status: active_demo
authority_level: 3
data_classification: public
retrieval_scope: customer_facing
language: "en"
fictional_demo_data: true
contains_synthetic_assumptions: false
created_at: 2026-11-26
last_updated: 2026-11-26
effective_from: 2026-11-26
effective_to: null
supersedes: []
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Area Measurement Guide

> **FICTIONAL DEMONSTRATION DATA** for project values. The definitions of area terms are general real-estate terminology, with the RERA definition of carpet area noted as the statutory reference. Project-specific carpet and super built-up areas are `NOT_PROVIDED`.

## 1. Purpose
Explains carpet area, built-up area and super built-up (saleable) area so the agent uses each term correctly and never converts one into another for GreenHaven Residences.

## 2. Business context
Area terminology is the most common source of confusion and disputes in apartment sales. The canonical figures for this project are **built-up** areas (approximately 1,180 sq.ft for 2BHK and 1,560 sq.ft for 3BHK). No carpet or super built-up figure exists in the records.

## 3. Definitions
| Term | General meaning | GreenHaven value |
|---|---|---|
| **Carpet area** | Net usable floor area inside the apartment walls. Under RERA it excludes external walls, service shafts, exclusive balconies or verandahs and open terraces, and includes internal partition walls. | NOT_PROVIDED (both configurations) |
| **Built-up area** | Carpet area plus wall thickness and usually balconies; the usable footprint including walls. | 2BHK ≈ 1,180 sq.ft; 3BHK ≈ 1,560 sq.ft (CANONICAL) |
| **Super built-up / saleable area** | Built-up area plus a proportionate share of common areas (lobbies, staircases, clubhouse). | NOT_PROVIDED |
| **Plot / UDS (undivided share of land)** | The owner's share of the land. | NOT_PROVIDED |

### 3.1 Rules for the AI agent
1. Use "built-up area" for 1,180 and 1,560 sq.ft, every time.
2. **Never derive carpet area** from built-up area using a ratio or "loading" percentage, even if the customer asks for an estimate.
3. Never convert to square metres without stating it is a unit conversion of the *built-up* figure (1 sq.ft = 0.0929 m²; 1,180 sq.ft ≈ 109.6 m²; 1,560 sq.ft ≈ 144.9 m²).
4. Under RERA, sale agreements for registered projects state carpet area; the agreement is the authoritative source (`ABC-GHR-KB-40`).

## 4. Customer-facing explanation
"The figures I have, about 1,180 sq.ft for the 2BHK and 1,560 sq.ft for the 3BHK, are built-up areas, which include walls. Carpet area is the usable floor area inside the walls, and it's usually lower; the exact carpet area will be stated on the approved plan and your agreement. I won't estimate it."

## 5. Important conditions
- Prices in this knowledge base are indicative base prices for a configuration; no per-sq.ft rate is published.
- If a document or screen shows a different area for the same configuration, report it; do not pick one (`config/data_authority_registry.json`).

## 6. Exceptions
- Customers comparing with another project's "carpet area": the agent explains it cannot compare without a verified GreenHaven carpet figure.

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Is 1,560 the carpet area?" | No, it's built-up area. |
| "Roughly what's the carpet area?" | Not estimated; escalate. |
| "What's the loading percentage?" | NOT_PROVIDED. |
| "How much is that in square metres?" | Convert the built-up figure, labelled as such. |

## 8. What the AI agent can confidently answer
Definitions, which figure the project publishes, and conversions of that figure.

## 9. What the AI must not claim
Carpet area, super built-up area, loading percentage or UDS for this project.

## 10. Escalation
Requests for carpet area or loading → **sales executive** (`ESC-08`); area disputes → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-15`, `ABC-GHR-KB-16`, `ABC-GHR-KB-17`, `ABC-GHR-KB-40`.
