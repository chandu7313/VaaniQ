# Source Reconciliation Report

**Tenant:** `abc-developers` · **Project:** GreenHaven Residences (fictional) · **Date:** 2026-11-26 · **Status:** PENDING_REVIEW

## 1. Scope and method

The brief asked for an audit of an existing "VaaniQ_RAG_Dataset" before generation. **No folder or file of that name exists** in the repository, the backend, the frontend or the database. The audit therefore covered every place in the running application where project facts live:

| Source | Location | What it holds |
|---|---|---|
| Seed knowledge documents (18) | `backend/src/db/seedData.js` (`demoDocuments`) | The text currently indexed for RAG |
| Seed tenant catalog | `backend/src/db/seedData.js:9-10` | Unit types, sizes and price ranges used by lead scoring and the UI |
| Live tenant settings | `tenants.settings` (local PostgreSQL and Supabase), seeded from the catalog | Same catalog values, read at runtime |
| Customer UI | `frontend/src/components/customer/WelcomeScreen.jsx`, `InlineConversationCards.jsx` | Displays catalog prices; one hard-coded amenity figure |
| Tests | `backend/test/*.test.js` | Assert the current seed values |
| Brief | Canonical facts supplied for this knowledge base | 2BHK ≈1,180 sq.ft, ₹67,50,000 – ₹69,00,000; 3BHK ≈1,560 sq.ft, ₹89,50,000 – ₹92,00,000; Gachibowli, Hyderabad; Towers A and B |

**Rule applied** (`config/data_authority_registry.json`): values were never chosen silently. The brief's canonical facts are the only CANONICAL values. Every conflicting value is listed below with its source and a resolution status. Values the brief forbids inventing were replaced by `NOT_PROVIDED`, `NOT_CONFIGURED` or `REQUIRES_HUMAN_CONFIRMATION`, even when the seed had a figure.

**Nothing in the running application was changed.** The live app still serves the seed values until a reviewed migration (section 4) is approved.

## 2. Conflict register

| ID | Field | Conflicting values and sources | Resolution in this knowledge base | Status |
|---|---|---|---|---|
| R-01 | 2BHK area | Seed catalog `sizeSqft: [1150, 1290]` (`seedData.js:9`); seed text "super built-up area of 1150 to 1290 sq ft" (`seedData.js:187`) vs canonical ≈1,180 sq.ft **built-up** | ≈1,180 sq.ft built-up (CANONICAL) | RESOLVED_BY_CANONICAL |
| R-02 | 3BHK area | Seed `[1620, 1840]` (`seedData.js:10`, `:190`); test `ai-lifecycle.test.js:84` vs ≈1,560 sq.ft built-up | ≈1,560 sq.ft built-up (CANONICAL) | RESOLVED_BY_CANONICAL |
| R-03 | 2BHK price | Seed `priceLakh: [68, 82]`; UI `WelcomeScreen.jsx:245,290`, `InlineConversationCards.jsx:61` (render the catalog) vs ₹67,50,000 – ₹69,00,000 | Canonical range; old range listed as superseded in `pricing_catalog.json` | RESOLVED_BY_CANONICAL |
| R-04 | 3BHK price | Seed `[88, 115]`; tests `rag.test.js:81,134`, `acceptance.test.js:44`, `analysis.test.js:79,116`, `ai-lifecycle.test.js:47,166` vs ₹89,50,000 – ₹92,00,000 | Canonical range | RESOLVED_BY_CANONICAL |
| R-05 | Carpet area | Seed "carpet area of 820 to 920" (2BHK) and "1160 to 1320" (3BHK) (`seedData.js:187,190`) | `NOT_PROVIDED`. Not derived from built-up area. | UNKNOWN_BY_RULE |
| R-06 | RERA number | Seed placeholder "P00000000000" (`seedData.js:91`) | `NOT_PROVIDED`; agent must never quote a number | UNKNOWN_BY_RULE |
| R-07 | Possession dates | Seed "Tower A December 2027, Tower B June 2028" (`seedData.js:88`) | `NOT_PROVIDED`; project team confirms in writing (`ESC-03`) | UNKNOWN_BY_RULE |
| R-08 | Distances and travel times | Seed "10 minutes from the Financial District", "within 3 km", metro "2.5 km", school "1.8 km", hospital "2.6 km", mall "2.9 km" (`seedData.js:77,80,262-271`) | `NOT_PROVIDED`; locality only | UNKNOWN_BY_RULE |
| R-09 | Unit availability | Seed "2BHK available: 49 … 3BHK available: 33" (`seedData.js:133`) | Removed from static text; availability is live data only | MOVED_TO_LIVE_SOURCE |
| R-10 | Discount | Seed "festive discount of Rs 2 lakh" (`seedData.js:55`) | `NOT_CONFIGURED`; the AI never offers discounts | UNKNOWN_BY_RULE |
| R-11 | Construction progress | Seed "Tower A 11th floor slab, Tower B 8th floor slab" (`seedData.js:38`) | `REQUIRES_HUMAN_CONFIRMATION` | UNKNOWN_BY_RULE |
| R-12 | Bank partners | Seed "pre-approved by … Deccan Housing Bank, Charminar Finance and Godavari Home Loans" (`seedData.js:245`) | `NOT_PROVIDED`; any lender may be approached | UNKNOWN_BY_RULE |
| R-13 | Clubhouse size | UI hard-codes "25,000 sq ft Clubhouse" (`WelcomeScreen.jsx:152`); no document or catalog value | Kept as `SYNTHETIC_DEMO_ASSUMPTION` (`amenity_catalog.json` AM-01) | NEEDS_REVIEW |
| R-14 | Cancellation charge | Seed "cancellation charge of 2 percent of the agreement value" (`seedData.js:150`) | `REQUIRES_HUMAN_CONFIRMATION`; sale agreement governs | UNKNOWN_BY_RULE |
| R-15 | Maintenance and corpus | Seed "Rs 3 per sq ft per month", "corpus fund of Rs 50 per sq ft" (`seedData.js:167,299`) | `NOT_PROVIDED` | UNKNOWN_BY_RULE |
| R-16 | Inventory source | `data_authority_registry` requires a live inventory source; the app has **no unit-inventory table** | `NOT_CONFIGURED`; synthetic import seed prepared (`structured_data/`) | OPEN |
| R-17 | Token refund | Seed "token is fully refundable if the booking is cancelled within 7 days" (`seedData.js:150`) | `REQUIRES_HUMAN_CONFIRMATION` | UNKNOWN_BY_RULE |
| R-18 | Area basis label | Seed labels the sizes "super built-up"; the brief labels the canonical figures "built-up" | "Built-up" everywhere; super built-up `NOT_PROVIDED` | RESOLVED_BY_CANONICAL |
| R-19 | Escrow wording | Seed "project escrow account" (`seedData.js:237`) implies a RERA-registered project account | Replaced by "the account named on the demand letter" | UNKNOWN_BY_RULE |
| R-20 | Lead-scoring input | Scoring compares budget with the catalog's lowest price (₹88 lakh today); canonical lowest is ₹89.5 lakh | `lead_scoring_rules.json` reads `pricing_catalog.json`. Budgets of ₹88–89.4 lakh move from 1.0 to 0.7 of the budget weight after migration. The ₹90 lakh acceptance scenario is unchanged (77 → 92). | OPEN (migration) |
| R-21 | Tests | Tests listed in R-02 and R-04 assert seed values | Must be updated in the same change as the migration | OPEN (migration) |

**Totals:** 21 items. 5 resolved by canonical facts, 11 replaced by an unknown marker under the brief's rules, 1 moved to a live source, 1 synthetic value needing review, 3 open until migration.

## 3. Synthetic values carried forward (not conflicts)

Values that exist only in the seed and are not prohibited were kept, each labelled `SYNTHETIC_DEMO_ASSUMPTION` (165 labels across the documents):
- company history (founded 2009, about 1,800 homes);
- 18 floors, 264 units, 4.2 acres, about 70% open space;
- the ten-instalment payment plan, ₹1 lakh token for 7 days, 10% booking amount;
- site-visit hours;
- specifications and amenities with hours.

## 4. Recommended migration (not executed)

1. Update `backend/src/db/seedData.js` catalog to 2BHK `[1180, 1180]` sq.ft / `[67.5, 69]` lakh and 3BHK `[1560, 1560]` / `[89.5, 92]`, labelled built-up.
2. Replace the 18 seed documents with the 69 documents here (strip YAML frontmatter at ingestion; store `doc_id`, `authority_level` and `retrieval_scope` as document metadata).
3. Update the tests in R-21.
4. Update the live tenant settings (local and Supabase) through the Settings screen or a migration.
5. Decide R-13 (clubhouse figure) and R-16 (inventory table).
6. Re-run `node tools/retrieval_eval.mjs` and the backend test suite.
