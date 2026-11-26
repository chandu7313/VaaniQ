# Source Reconciliation Final Report

**Tenant:** `abc-developers` · **Project:** GreenHaven Residences (fictional demo) · **Date:** 2026-11-26  
**Scope:** Full reconciliation across `VaaniQ_Knowledge_Base/` (69 documents, 8 config files, 264-unit inventory CSV), `backend/src/db/seedData.js`, PostgreSQL (`tenants.settings`, `knowledge_documents`, `knowledge_chunks`), `backend/src/controllers/public.controller.js`, `frontend/src/components/customer/*`, and `backend/test/*.test.js`.

---

## 1. Canonical Baseline Enforced

| Attribute | Canonical Value | Source of Truth |
|---|---|---|
| Project Name | GreenHaven Residences | Canonical brief & `project_catalog.json` |
| Location | Gachibowli, Hyderabad | Canonical brief & `project_catalog.json` |
| 2BHK Area | Approximately 1,180 sq.ft (**built-up**; carpet area `NOT_PROVIDED`) | `project_catalog.json` & `ABC-GHR-KB-15` |
| 2BHK Indicative Base Price | ₹67,50,000 – ₹69,00,000 (₹67.5–69 lakh) | `pricing_catalog.json` & `ABC-GHR-KB-28` |
| 3BHK Area | Approximately 1,560 sq.ft (**built-up**; carpet area `NOT_PROVIDED`) | `project_catalog.json` & `ABC-GHR-KB-16` |
| 3BHK Indicative Base Price | ₹89,50,000 – ₹92,00,000 (₹89.5–92 lakh) | `pricing_catalog.json` & `ABC-GHR-KB-29` |

Old conflicting ranges (`2BHK: 1,150–1,290 sq.ft / ₹68–82 lakh`, `3BHK: 1,620–1,840 sq.ft / ₹88–115 lakh`, `carpet area 820–920 / 1,160–1,320 sq.ft`, placeholder RERA `P00000000000`, `Deccan Housing Bank`, `₹2 lakh festive discount`) have been removed from active seed data, catalog settings, active non-superseded KB chunks, and test expectations.

---

## 2. Conflict Resolution Matrix (`R-01` – `R-21`)

| ID | Field | Former Conflict | Final Resolution | Status |
|---|---|---|---|---|
| R-01 | 2BHK area | `[1150, 1290]` super built-up | `sizeSqft: [1180, 1180]`, `areaBasis: 'built-up'` in `seedData.js` & UI `fmtArea` (`≈1,180 sq.ft built-up`) | RESOLVED |
| R-02 | 3BHK area | `[1620, 1840]` super built-up | `sizeSqft: [1560, 1560]`, `areaBasis: 'built-up'` in `seedData.js` & UI `fmtArea` (`≈1,560 sq.ft built-up`) | RESOLVED |
| R-03 | 2BHK price | `[68, 82]` lakh | `priceLakh: [67.5, 69]` in `seedData.js` & `pricing_catalog.json` | RESOLVED |
| R-04 | 3BHK price | `[88, 115]` lakh | `priceLakh: [89.5, 92]` in `seedData.js` & `pricing_catalog.json` | RESOLVED |
| R-05 | Carpet area | Static seed `820–920` / `1,160–1,320` | `NOT_PROVIDED` in KB (`ABC-GHR-KB-18`) & `null` in `unit_inventory_seed.csv`; UI notes carpet area not provided | RESOLVED |
| R-06 | RERA number | Placeholder `P00000000000` | `NOT_PROVIDED`; excluded from extractive customer replies; routed to legal/compliance (`ESC-02`) | RESOLVED |
| R-07 | Possession dates | `Tower A Dec 2027, Tower B Jun 2028` | `NOT_PROVIDED`; project team confirms in writing (`ESC-03`) | RESOLVED |
| R-08 | Distances / travel times | Specific km / minute claims | `NOT_PROVIDED`; general Gachibowli locality description only | RESOLVED |
| R-09 | Unit availability | Static `49` / `33` counts | Removed from RAG prose; availability reported as live operational state / `NOT_CONFIGURED` | RESOLVED |
| R-10 | Festive discount | Seed ₹2 lakh discount | `NOT_CONFIGURED`; AI never offers or confirms discounts (`ABC-GHR-KB-36`) | RESOLVED |
| R-11 | Construction progress | Seed `11th floor` / `8th floor` | `REQUIRES_HUMAN_CONFIRMATION` (`ABC-GHR-KB-10`) | RESOLVED |
| R-12 | Bank partners | Named fictional banks | `NOT_PROVIDED`; lender decides approval (`ESC-07`) | RESOLVED |
| R-13 | Clubhouse size | Unlabelled `25,000 sq ft Clubhouse` in `WelcomeScreen.jsx` | Explicitly labelled `≈25,000 sq ft Clubhouse (Planned Demo)` in `WelcomeScreen.jsx` and `SYNTHETIC_DEMO_ASSUMPTION` in `ABC-GHR-KB-21` until client plan approval | RESOLVED (LABELLED SYNTHETIC) |
| R-14 | Cancellation charge | Fixed `2%` charge | `REQUIRES_HUMAN_CONFIRMATION` governed by sale agreement (`ABC-GHR-KB-37`) | RESOLVED |
| R-15 | Maintenance / corpus | `₹3/sq.ft` and `₹50/sq.ft` | `NOT_PROVIDED`; final charges on approved cost sheet (`ABC-GHR-KB-32`) | RESOLVED |
| R-16 | Unit inventory table | App has no `unit_inventory` table | 264-unit CSV + JSON schema kept in `VaaniQ_Knowledge_Base/structured_data/` (NOT ingested as RAG). Remains `NOT_CONFIGURED` as an explicit database backlog item; app does not claim live unit availability | OPEN (EXPLICITLY `NOT_CONFIGURED`) |
| R-17 | Token refund | Fixed 7-day refund promise | `REQUIRES_HUMAN_CONFIRMATION` (`ABC-GHR-KB-37`) | RESOLVED |
| R-18 | Area basis label | Seed said `super built-up` | Standardised as **approximate built-up** area across catalog, KB, UI, and tests | RESOLVED |
| R-19 | Escrow wording | Implied statutory project escrow account | Replaced by `"the account named on the demand letter"` | RESOLVED |
| R-20 | Lead-scoring input | Canonical floor `89.5` vs old `88` | Catalog updated to `89.5`; ₹90L acceptance threshold preserves score `77` (`hot`) pre-booking and `92` post-booking; `analysis.test.js` & `ai-lifecycle.test.js` updated | RESOLVED |
| R-21 | Outdated backend tests | 19 failing assertions on old values/titles | All updated to canonical values, plus new regression tests for `agent_internal` exclusion, `PENDING_REVIEW` preservation, idempotency, low budget mismatch, and `NOT_PROVIDED` RERA | RESOLVED |

---

## 3. Additional Reconciliation Applied During Handover

1. **Internal vs. Customer Document Filtering (`public.controller.js`, `rag/knowledge.js`, `tools/handlers.js`)**:
   - Upgraded from title-only regex matching (`/sales and booking policies/i`) to database-backed `retrieval_scope` enforcement (`customer_facing` vs `agent_internal`), ensuring the 16 `agent_internal` documents never surface in customer chat, public `/overview` highlights, or `/public/*/knowledge/search`.
2. **UI Honest Review/Demo Signalling (`WelcomeScreen.jsx`, `InlineConversationCards.jsx`)**:
   - Replaced `"Verified Facts / Official Brochure"` with `"Demo Knowledge Base / Pending Review · Synthetic Demo Data"`.
   - Labelled parking slots (`1 Covered Parking (demo)` / `2 Covered Parking (demo)`) and card footnotes as indicative/demo assumptions with carpet area not provided.
3. **Extractive Responder Cleanliness (`backend/src/services/agent/responder.js`)**:
   - Filtered internal reconciliation sentences (`reconciliation item`, `superseded`, `placeholder number`) so stale superseded identifiers (e.g., `P00000000000`) are never echoed to customers during extractive demo fallback, and prioritised `Customer-facing explanation` prose sections.
