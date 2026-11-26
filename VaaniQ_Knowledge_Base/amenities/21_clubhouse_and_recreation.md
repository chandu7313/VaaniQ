---
doc_id: ABC-GHR-KB-21
tenant_slug: abc-developers
document_title: "Clubhouse and Recreation"
category: amenities
subcategory: clubhouse
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
  - "seed:GreenHaven Residences - Amenities"
source_of_truth: "config/amenity_catalog.json"
approval_status: PENDING_REVIEW
---
# Clubhouse and Recreation

> **FICTIONAL DEMONSTRATION DATA.** The clubhouse size (approximately 25,000 sq.ft), its facilities and hours are `SYNTHETIC_DEMO_ASSUMPTION`, mastered in `config/amenity_catalog.json` (AM-01, AM-05). The date from which amenities will be operational is `NOT_PROVIDED`. Usage charges are `NOT_CONFIGURED`.

## 1. Purpose
Describes the planned clubhouse and its indoor recreation facilities so the agent can answer lifestyle questions accurately without promising operational dates or free use.

## 2. Business context
The clubhouse is the social centre of the community and a strong reason families choose a gated project. The demo customer experience shows "25,000 sq ft Clubhouse"; this document records that figure as a synthetic assumption (reconciliation item R-13) rather than an approved plan value.

## 3. Clubhouse details
| Item | Value | Status |
|---|---|---|
| Size | approximately 25,000 sq.ft | SYNTHETIC_DEMO_ASSUMPTION |
| Location | Central podium between Tower A and Tower B | SYNTHETIC_DEMO_ASSUMPTION |
| Hours | 06:00 – 22:00 daily | SYNTHETIC_DEMO_ASSUMPTION |
| Access | Residents and registered guests | SYNTHETIC_DEMO_ASSUMPTION |
| Operational from | — | NOT_PROVIDED |
| Membership / usage charges | — | NOT_CONFIGURED |

### 3.1 Facilities inside the clubhouse (SYNTHETIC_DEMO_ASSUMPTION)
- Reception and facility desk (bookings, guest registration).
- Indoor games room (AM-05): table tennis, carrom, chess; 08:00 – 22:00.
- Multipurpose hall (AM-12) for gatherings and celebrations; advance booking (`ABC-GHR-KB-25`).
- Swimming pool, gymnasium, yoga deck and badminton court (`ABC-GHR-KB-22`).
- Lounge and reading area with seating.
- Changing rooms and washrooms.

### 3.2 Recreation rules (SYNTHETIC_DEMO_ASSUMPTION)
- Guests must be registered at the facility desk by a resident.
- Children under 10 in the games room must be accompanied by an adult.
- Detailed rules after handover are set by the residents' association.

## 4. Customer-facing explanation
"The community is planned with a clubhouse of about 25,000 sq.ft at the centre, between the two towers. It includes an indoor games room, a multipurpose hall, a lounge, and the pool, gym, yoga deck and badminton court. It's planned to open from 6 am to 10 pm for residents and their registered guests. The date it becomes operational and any usage charges will be confirmed by our team."

## 5. Important conditions
- Say "planned" for every facility; nothing is described as built or operational.
- Never say amenities are free; charges are `NOT_CONFIGURED` and a clubhouse membership charge, if any, appears only on the cost sheet (`ABC-GHR-KB-32`).
- Facility lists may change in the approved plan.

## 6. Exceptions
- **Private events:** multipurpose-hall bookings follow society rules after handover.
- **Commercial use** (classes run by outsiders for profit): requires association approval (SYNTHETIC_DEMO_ASSUMPTION).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "How big is the clubhouse?" | About 25,000 sq.ft as planned (synthetic). |
| "When will the clubhouse be ready?" | NOT_PROVIDED; escalate to project team. |
| "Is clubhouse membership free?" | Charges NOT_CONFIGURED; cost sheet confirms. |
| "Can my parents use it when they visit?" | Yes as registered guests (synthetic rule). |

## 8. What the AI agent can confidently answer
Planned facilities, approximate size, location, planned hours and guest rule.

## 9. What the AI must not claim
Operational dates, free use, membership charges, or that the clubhouse is built.

## 10. Escalation
Opening-date questions → **project team** (`ESC-03`); charges → `ESC-05`; unsupported facility questions → `ESC-08`.

Related documents: `ABC-GHR-KB-22`, `ABC-GHR-KB-25`, `ABC-GHR-KB-26`, `ABC-GHR-KB-57`.
