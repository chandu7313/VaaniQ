---
doc_id: ABC-GHR-KB-08
tenant_slug: abc-developers
document_title: "Project Location and Connectivity"
category: project
subcategory: location
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
  - "seed:GreenHaven Residences - Location and Connectivity"
  - "seed:GreenHaven Residences - Neighbourhood Guide"
source_of_truth: "config/project_catalog.json"
approval_status: PENDING_REVIEW
---
# Project Location and Connectivity

> **FICTIONAL DEMONSTRATION DATA.** GreenHaven Residences is synthetic and has no real address. The locality (Gachibowli, Hyderabad) is CANONICAL; general descriptions of the area are public knowledge; **exact distances and travel times are `NOT_PROVIDED`** and must never be quoted.

## 1. Purpose
Answers "where is the project?" and "what is nearby?" accurately without inventing distances, landmarks or travel times. Replaces earlier seed text that quoted specific kilometres and minutes (see the reconciliation report).

## 2. Business context
Location is usually the second question after price. Customers want commute and amenity information, but quoting a distance that turns out wrong damages trust. This document gives the agent safe, useful answers.

## 3. Detailed information
### 3.1 Address
| Field | Value | Status |
|---|---|---|
| Locality | Gachibowli | CANONICAL |
| City / State / Country | Hyderabad, Telangana, India | CANONICAL |
| Street address, survey number, PIN code | — | NOT_PROVIDED |
| Map coordinates / pin | — | NOT_PROVIDED |

### 3.2 The neighbourhood (general, non-project-specific description)
Gachibowli is a well-known residential and commercial locality in western Hyderabad, part of the city's IT and financial corridor alongside areas such as HITEC City and the Financial District. The wider area has schools, hospitals, shopping centres and offices. This is a description of the locality, **not** a set of verified distances from the project.

### 3.3 Connectivity facts and their status
| Topic | Status | How to answer |
|---|---|---|
| Distance to Financial District / IT parks | NOT_PROVIDED | "It's in the same western corridor; exact travel time depends on the route. A sales executive can share directions." |
| Distance to the airport | NOT_PROVIDED | Do not estimate. |
| Nearest metro station | NOT_PROVIDED | Do not state planned or operational lines as facts. |
| Named schools and hospitals | NOT_PROVIDED | Mention that the locality has schools and hospitals; do not name any or give distances. |
| Road widths, access roads | NOT_PROVIDED | Escalate. |

### 3.4 Directions for visitors (SYNTHETIC_DEMO_ASSUMPTION)
The sales office is at the project site. Directions and a map pin are shared by a sales executive after a site visit is booked (`ABC-GHR-KB-48`).

## 4. Customer-facing explanation
"GreenHaven Residences is in Gachibowli, in western Hyderabad's IT and financial corridor. The area has schools, hospitals and shopping nearby, but I don't have verified distances from the project, so I won't guess. When you book a site visit, our sales executive shares directions and can talk you through commutes."

## 5. Important conditions
- Never give a number of kilometres or minutes for any landmark.
- Never name a specific school, hospital, mall or company as "near the project".
- Never describe future infrastructure (metro lines, flyovers) as committed.

## 6. Exceptions
- If the customer names a landmark and asks "how far?", the agent says the distance isn't verified and suggests checking a maps application or asking the sales executive during the site visit.
- Seed documents previously quoted distances; those statements are **superseded** (`reports/source_reconciliation_report.md`).

## 7. Common customer questions
| Question | Answer approach |
|---|---|
| "Where exactly is it?" | Gachibowli, Hyderabad; exact address NOT_PROVIDED until visit booking. |
| "How far is the airport?" | Not verified; do not estimate. |
| "Is there a metro nearby?" | Not verified. |
| "Are there good schools?" | The locality has schools; names and distances not provided. |

## 8. What the AI agent can confidently answer
Locality, city, state, the general character of Gachibowli, and that directions come with a booked visit.

## 9. What the AI must not claim
Distances, travel times, named nearby institutions, upcoming infrastructure, "prime location" superlatives presented as fact, or property appreciation.

## 10. Escalation
Specific location questions → **sales executive** (`ESC-08`). Road access, legal boundaries or land questions → **legal and compliance** (`ESC-02`).

Related documents: `ABC-GHR-KB-07`, `ABC-GHR-KB-54` (location FAQ), `ABC-GHR-KB-48`.
