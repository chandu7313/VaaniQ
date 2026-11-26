---
doc_id: ABC-GHR-KB-23
tenant_slug: abc-developers
document_title: "Outdoor and Landscape Facilities"
category: amenities
subcategory: outdoor
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
source_of_truth: "config/amenity_catalog.json"
approval_status: PENDING_REVIEW
---
# Outdoor and Landscape Facilities

> **FICTIONAL DEMONSTRATION DATA.** Outdoor facilities and the open-space share (approximately 70%) are `SYNTHETIC_DEMO_ASSUMPTION` (amenity catalog AM-07, AM-08; `config/project_catalog.json`). Landscape drawings and tree counts are `NOT_PROVIDED`.

## 1. Purpose
Describes the planned jogging track, landscaped gardens and other open areas, so the agent can discuss outdoor living without inventing measurements or certifications.

## 2. Business context
Open space is scarce in the IT corridor. Customers value walking paths and greenery, particularly families with children and senior citizens. The seed materials described "over 70% open space"; this figure is carried forward as a synthetic assumption, not an approved plan value.

## 3. Facilities
| ID | Facility | Location | Planned hours | Status |
|---|---|---|---|---|
| AM-07 | Jogging track | Landscaped periphery of the site | 05:00 – 22:00 | SYNTHETIC_DEMO_ASSUMPTION |
| AM-08 | Landscaped gardens | Open areas around and between towers | Open access | SYNTHETIC_DEMO_ASSUMPTION |
| — | Central lawn with seating | Between the towers | Open access | SYNTHETIC_DEMO_ASSUMPTION |
| — | Shaded seating pavilions | Garden zone | Open access | SYNTHETIC_DEMO_ASSUMPTION |

### 3.1 Landscape principles (SYNTHETIC_DEMO_ASSUMPTION)
- Native and drought-tolerant plant species to reduce water use (`ABC-GHR-KB-12`).
- Treated water from the sewage treatment plant used for gardening (`ABC-GHR-KB-13`).
- Vehicle-free podium: cars stay in the basements, keeping the ground level pedestrian.
- Lighting along paths for evening use.

| Field | Status |
|---|---|
| Track length | NOT_PROVIDED |
| Number of trees | NOT_PROVIDED |
| Landscape architect | NOT_PROVIDED |
| Green-building certification | NOT_PROVIDED (`ABC-GHR-KB-12`) |

## 4. Customer-facing explanation
"About 70% of the site is planned as open space. There's a jogging track around the landscaped edge, gardens between the towers and a central lawn with seating. Cars are kept to the basements, so the ground level is meant for walking and play. The exact track length isn't in my information."

## 5. Important conditions
- Present 70% as an approximate planned share, not an approved figure.
- Do not claim certifications, tree counts or measurements.

## 6. Exceptions
- Use of lawns for private events requires association permission after handover.
- Pets on lawns: allowed on leash in designated areas only (SYNTHETIC_DEMO_ASSUMPTION; society rules govern).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "How much open space is there?" | About 70%, planned (synthetic). |
| "How long is the jogging track?" | NOT_PROVIDED. |
| "Can I walk my dog?" | On leash in designated areas (synthetic). |
| "Is it a green-certified project?" | NOT_PROVIDED; do not claim. |

## 8. What the AI agent can confidently answer
Facility list, approximate open-space share, landscape principles, vehicle-free podium.

## 9. What the AI must not claim
Track length, tree counts, certifications, completion dates.

## 10. Escalation
Unsupported measurements → **sales executive** (`ESC-08`); certification questions → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-09`, `ABC-GHR-KB-12`, `ABC-GHR-KB-24`.
