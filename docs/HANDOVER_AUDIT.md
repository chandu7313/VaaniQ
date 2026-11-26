# VaaniQ Engineering Handover Audit (Phase 0)

**Audit Date:** 2026-11-26  
**Repository Root:** `/Volumes/My Files/Projects/VaaniQ`  
**Git HEAD:** `e3e3f0a` (`Make RAG reliable: 18 company documents, one project name, better retrieval`)  
**Scope:** Independent read-only inspection prior to modifying source, schema, or live database state.

---

## 1. Git Working Tree Summary

- **Modified tracked files:** 39
- **Untracked paths:** 8 (`VaaniQ_Knowledge_Base/`, `backend/scripts/loadtest.mjs`, `backend/src/controllers/speech.controller.js`, `backend/src/db/knowledgeBase.js`, `backend/src/routes/speech.js`, `backend/src/services/speech.js`, `backend/test/speech.test.js`, `docs/LOAD_TEST.md`)
- Note: Several uncommitted files (`backend/src/services/speech.js`, `frontend/src/hooks/useSpeech.js`, `backend/scripts/loadtest.mjs`, `frontend/src/lib/format.js`, `frontend/src/pages/Settings.jsx`) belong to concurrent speech/loadtest/UI refinements alongside the knowledge-base migration. None were discarded or reset.

---

## 2. Independent Verification Status

### 2.1 Completed Work (Verified)

1. **Knowledge Base Corpus (`VaaniQ_Knowledge_Base/`)**:
   - Contains **69 Markdown documents** across 9 categories (`company`: 6, `project`: 8, `apartments`: 6, `amenities`: 6, `commercial`: 11, `legal`: 6, `sales_operations`: 9, `customer_support`: 11, `post_sales`: 6), **36,886 words** total as measured by `python3 VaaniQ_Knowledge_Base/tools/validate_kb.py`.
   - Each document carries 18 YAML frontmatter fields; all documents preserve `approval_status: PENDING_REVIEW`.
   - Unknown markers verified (`NOT_PROVIDED: 203`, `NOT_CONFIGURED: 64`, `REQUIRES_HUMAN_CONFIRMATION: 50`, `SYNTHETIC_DEMO_ASSUMPTION: 165` per `validation_results.json`).
   - Validator passes with `ERRORS 0` and `WARNINGS 2` (document similarity `0.602` between `ABC-GHR-KB-28` and `ABC-GHR-KB-29`; 64 documents below 700-word target).
2. **Structured Configs & Inventory Seed**:
   - **8 JSON config files** + JSON schemas under `VaaniQ_Knowledge_Base/config/` (`company_facts.json`, `project_catalog.json`, `pricing_catalog.json`, `amenity_catalog.json`, `sales_policy.json`, `escalation_matrix.json`, `lead_scoring_rules.json`, `data_authority_registry.json`).
   - **264-unit inventory CSV** (`VaaniQ_Knowledge_Base/structured_data/unit_inventory_seed.csv`) + JSON schema (`unit_inventory.schema.json`), explicitly flagged as database-only (`NOT retrievable by RAG`), with `carpet_area_sqft: null` and `base_price_inr: null` (`NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`).
   - No pre-chunked `VaaniQ_Knowledge_Base/rag/` directory exists in the workspace (only Markdown docs exist), eliminating duplicate Markdown+JSONL ingestion risk at the source level.
3. **Seed Catalog & Loader Updated (`backend/src/db/`)**:
   - `backend/src/db/knowledgeBase.js` reads the 69 `.md` files sorted by document number, parses YAML frontmatter, and strips frontmatter from `content`.
   - `backend/src/db/seedData.js` updates `demoTenantSettings.catalog.units` to canonical values:
     - `2BHK`: `sizeSqft: [1180, 1180]`, `areaBasis: 'built-up'`, `priceLakh: [67.5, 69]`
     - `3BHK`: `sizeSqft: [1560, 1560]`, `areaBasis: 'built-up'`, `priceLakh: [89.5, 92]`
   - `backend/src/db/seed.js` calls `syncDemoDocuments(tenantId, demoDocuments)` and recomputes seeded lead scores.
4. **Frontend Build**:
   - `cd frontend && npm run build` exits cleanly with status `0` (`vite v8.3.8`, built in 380ms).
5. **Retrieval Eval Script & Baseline Lexicon Fixes**:
   - `backend/src/services/lexicon.js` already includes `'पूल'` under `'swimming pool'`.
   - `backend/src/services/rag/bm25.js` already includes `'kya', 'hai', 'hain', 'ki', 'ka', 'ke', 'ko', 'mein', 'bhi'` in `STOP`, and `rate`/`rat` synonym normalization.
   - Running `node VaaniQ_Knowledge_Base/tools/retrieval_eval.mjs` currently scores **60/60 (100.0%) hit@4** (915 chunks across 69 documents, 9 tool-routing-only cases excluded).

---

### 2.2 Partially Completed Work

1. **Knowledge Metadata Preservation & Lifecycle States**:
   - `backend/src/db/knowledgeBase.js` parses `docId`, `authorityLevel`, and `retrievalScope` from frontmatter, **but `backend/src/db/seedData.js` strips them** (`loadKnowledgeBase().map(({ title, content }) => ({ title, content }))`).
   - `knowledge_documents` table (`001_init.sql`) only stores `(id, tenant_id, title, source_type, content, is_demo, created_at)` — no columns for `doc_id`, `category`, `version`, `authority_level`, `retrieval_scope`, `approval_status`, `lifecycle_status`, `content_hash`, or `index_version`.
   - Therefore:
     - Documents marked `PENDING_REVIEW` have no persisted review/lifecycle tracking (`uploaded`, `indexed`, `pending_review`, `approved`, `published`, `superseded`, `failed`).
     - Superseded vs active document filtering and authority-level precedence are not enforced in PostgreSQL or `knowledge.js`.
2. **UI Reconciliation (`frontend/src/components/customer/`)**:
   - `frontend/src/lib/format.js` (`fmtArea`) and `WelcomeScreen.jsx` unit cards now show `≈1,180 sq.ft built-up` and `≈1,560 sq.ft built-up`.
   - **Still incomplete / conflicting in UI**:
     - `WelcomeScreen.jsx:152` displays `25,000 sq ft Clubhouse` without an explicit synthetic/indicative label (`R-17`).
     - `WelcomeScreen.jsx:161-162` displays `Verified Facts / Official Brochure` even though the 69 demo docs are fictional and `PENDING_REVIEW`.
     - `InlineConversationCards.jsx:31` hardcodes `'1 Covered Parking'` / `'2 Covered Parking'` (a synthetic demo assumption) and `₹{u.priceLakh[0]}–{u.priceLakh[1]} Lakhs*` without explicit area/indicative framing matching `built-up` notes on every card.
     - `public.controller.js:17-20, 34, 50, 138` still uses `INTERNAL_POLICY_PATTERN = /sales and booking policies/i` to filter customer-facing documents — **which does NOT match the 16 `retrieval_scope: agent_internal` documents** in the 69-doc KB (such as `ABC-GHR-KB-33` through `ABC-GHR-KB-41`, escalation/playbook/policy docs).

---

### 2.3 Missing Work

1. **Database Migration (`004_*.sql`)**: No `004_*` migration exists yet for KB metadata, lifecycle/approval states, content checksums, and index versioning.
2. **Idempotent Hash-Based Sync & Failure Safety**: `syncDemoDocuments` matches strictly by `title` rather than `doc_id` + content hash, does not skip/track `index_version` / lifecycle state, and renames fail to match prior titles cleanly without deleting/re-inserting.
3. **Evaluation Metrics Beyond Hit@4**: No automated script/report yet computing **Recall@4, MRR, source attribution accuracy, and false-positive rate** cleanly across all 69 queries.
4. **Canonical Agent Behavior & Test Alignment**:
   - 19 of 111 backend tests fail after the switch to canonical pricing/sizes and the 69-document KB.
   - Orchestrator/analyzer/templates need verification against Workflows A–H (especially budget mismatch messaging when budget falls well below canonical range, `NOT_PROVIDED` RERA escalation, and loan-amount isolation).
5. **Live Database Application**: Live database (Supabase) has **NOT** yet been updated with the new seed catalog or 69 KB documents.

---

### 2.4 Existing Defects Found During Audit

| Defect | Location | Observed Cause |
|---|---|---|
| Public endpoints leak `agent_internal` docs | `backend/src/controllers/public.controller.js:17-50,138` | `INTERNAL_POLICY_PATTERN` only matches `/sales and booking policies/i` from old 18-doc set; 16 `agent_internal` docs in 69-doc KB are exposed in highlights/search. |
| Metadata dropped before DB sync | `backend/src/db/seedData.js:26` | Maps `{ title, content }` only, discarding `docId`, `authorityLevel`, `retrievalScope`, etc. |
| 19 backend tests failing | `backend/test/*.test.js` | See Section 3 below. |
| Live DB out of sync with repo | Supabase PostgreSQL | Still runs 18 old docs (70 chunks) and `[1150, 1290]` / `[68, 82]` + `[1620, 1840]` / `[88, 115]` catalog. |
| `WelcomeScreen.jsx` unlabelled synthetic badge | `frontend/src/components/customer/WelcomeScreen.jsx:152,162` | Shows `25,000 sq ft Clubhouse` without synthetic disclaimer and `Official Brochure` without demo/review qualifier. |

---

## 3. Baseline Test Suite & Evaluation Results

### 3.1 Backend Test Suite (`cd backend && npm test`)

- **Total tests:** 111 (`--test-concurrency=1`, against local `vaaniq_test` DB after `resetDb()`)
- **Passed:** 92
- **Failed:** 19
- **Root causes of the 19 failures:**
  1. **Stale unit pricing / area assertions & section names from pre-migration 18-doc KB (17 failures):**
     - `acceptance.test.js` (`B`): expected `'Price list'` / `Rs 88 lakh to Rs 115 lakh`; got `'3BHK Pricing Details'`.
     - `ai-lifecycle.test.js` (`1`, `3`, `4`, `5`, `demo-mode answer`): expected old section titles (`'Price list'`, `'Apartment configurations'`, parking section match) and old ranges (`88 lakh to Rs 115 lakh`, `1620 to 1840 sq ft`, `slightly above that budget` at ₹75L vs ₹88L floor instead of `₹89.5–92 lakh`).
     - `analysis.test.js` (3 tests): expected `3BHK range ₹88–115 lakh` / `3BHK 88-115` and `budget: 18` at ₹80L (computed against 88L instead of canonical 89.5L).
     - `api.test.js` (`full scenario`): expected `/fits our 3BHK range/` (`templates.budget_ok` now reads `is within our {type} indicative base price...`).
     - `database.test.js`: expected `d: 18` documents; `resetDb()` seeded `d: 69`.
     - `rag.test.js` (5 failures): expected old section titles (`Price list`, `Kitchen specification`, `Apartment configurations`, `Pricing|Overview`) and old numbers (`Rs 88 lakh to Rs 115 lakh`, `carpet area of 1160 to 1320 sq ft`). Notice `'What is the 3BHK price in Gachibowli'` matched `'Call Scenarios and Sales Dialogues'` (`agent_internal` doc!) at #1 and Hindi price query failed to rank Pricing top-4 — indicating `agent_internal` scripts/dialogues outranking customer-facing pricing docs!
  2. **Mock LLM / Regression failures (2 failures + 1 lifecycle regression):**
     - `agent-guards.test.js:79` (`LLM analysis with null fields`): `ungroundedNumbers` or answer guard rejected `Rs 88 lakh to Rs 115 lakh` from the mock LLM string because the retrieved canonical 69-doc KB context contains `₹89,50,000–₹92,00,000` (NOT `88` or `115`), falling back to `extractive`!
     - `agent-guards.test.js:112` (`offer-llm` EMI test) & `ai-lifecycle.test.js:150` (`a loan amount is not mistaken for a budget`): `'70 लाख के लोन पर EMI कितनी होगी?'` / `'What would my EMI be for a 70 lakh loan?'` failed to match the EMI doc or lacked `Rs 60,748` because the new KB doc `ABC-GHR-KB-30` / EMI content replaced the synthetic EMI figure with `NOT_PROVIDED` or different wording! Must inspect `VaaniQ_Knowledge_Base/` EMI docs before updating tests or guards.

### 3.2 Retrieval Evaluation Discrepancy Reconciliation

- **Previous report claim:** `data_quality_report.md` reported `58/60` overall hit@4 (`MULT-12` failed on missing Hindi `'पूल'`, `PARA-02` failed on Hinglish `'kya'`/`'hai'`), while the user handover prompt noted that displayed rows summed to 57 across 5 rows instead of 58 across 6 sets.
- **Actual files on disk:**
  - `VaaniQ_Knowledge_Base/reports/data_quality_report.md:102-110` actually lists **all 6 sets**:
    `factual (15/15)` + `paraphrase (11/12)` + `multilingual (11/12)` + `conflict (10/10)` + `unsupported (10/10)` + `tool_routing (1/1)` = **58/60** (with 9 tool-routing queries excluded because they route via orchestrator tools rather than RAG).
  - The apparent 57/5-row discrepancy in the handover brief came from omitting the 6th `tool_routing (1/1)` row when summarizing.
  - Meanwhile, the current working tree ALREADY contains `'पूल'` in `backend/src/services/lexicon.js:17` and `'kya', 'hai'` in `backend/src/services/rag/bm25.js:8`, and regenerating/running `node VaaniQ_Knowledge_Base/tools/retrieval_eval.mjs` yields **60/60 (100.0%) hit@4** (matching `VaaniQ_Knowledge_Base/reports/retrieval_eval_results.json`, timestamp `2026-11-26T02:51:38.547Z`).
- **Remaining retrieval issue observed in test failures:** Customer queries like `"3BHK price in Gachibowli"` matched `ABC-GHR-KB-45` (`Call Scenarios and Sales Dialogues`, `retrieval_scope: agent_internal`) ahead of customer-facing pricing docs when unscoped! Filtering customer RAG search by `retrieval_scope = 'customer_facing'` (or boosting/scoping customer queries away from `agent_internal`) is essential.

---

## 4. Database & RAG Index Status

- **Migrations Applied (Live Supabase PostgreSQL):**
  - `001_init.sql` (2026-11-26T01:20:53Z)
  - `002_enable_rls.sql` (2026-11-26T01:20:55Z)
  - `003_tool_audit_log.sql` (2026-11-26T01:20:56Z)
- **Live DB Demo Tenant (`abc-developers`, id `6c1436f7-00ed-44ba-9e65-c97b5b5a6508`):**
  - `catalog`: OLD values (`2BHK: [1150, 1290] / [68, 82]`, `3BHK: [1620, 1840] / [88, 115]`).
  - `knowledge_documents`: **18 old documents** (`is_demo: true`).
  - `knowledge_chunks`: **70 old chunks**.
- **Test DB (`vaaniq_test`, after `resetDb()`):**
  - `knowledge_documents`: 69 migrated documents, 915 chunks, canonical catalog — but missing metadata/lifecycle columns.

---

## 5. Exact Next Steps (Phases 1–7)

1. **Phase 1 (Reconciliation):** Inspect EMI / carpet area / RERA / clubhouse KB docs, reconcile UI badges (`WelcomeScreen.jsx`, `InlineConversationCards.jsx`), public internal-doc filtering (`public.controller.js`), and write `docs/SOURCE_RECONCILIATION_FINAL.md`.
2. **Phase 2 & 3 (Metadata & DB Migration):** Create `004_kb_metadata_and_lifecycle.sql` (adding `doc_id`, `category`, `version`, `authority_level`, `retrieval_scope`, `approval_status`, `lifecycle_status`, `content_hash`, `index_version`, `updated_at` on `knowledge_documents`; keeping existing migration history untouched). Update `knowledgeBase.js`, `seedData.js`, and `knowledge.js` for metadata preservation, transactional hash-based idempotent `syncDemoDocuments`, and failure-safe status handling (`PENDING_REVIEW` preserved, never auto-approved). Verify all 8 config schemas + confirm 264-unit inventory stays `NOT_CONFIGURED` unless approved schema exists.
3. **Phase 4 (Retrieval, Orchestrator & Tests):** Enforce `retrieval_scope` filtering for customer-facing queries vs internal queries, active/non-superseded lifecycle filtering, and deduplication. Verify orchestrator/NLU edge cases (loan vs budget, budget mismatch messaging, `NOT_PROVIDED` RERA escalation). Update outdated tests to canonical values and run full 69-query retrieval evaluation with Recall@4, MRR, attribution, and false-positive metrics.
4. **Phase 5 (Safe Live DB Migration):** Snapshot/verify live demo tenant settings & documents, run migration + `seed()` against active `DATABASE_URL`, rebuild BM25 index, verify 69 docs, chunks, citations, and zero stale values.
5. **Phase 6 & 7 (E2E Verification & Final Report):** Run full backend test suite, backend/frontend lint & build, verify running server Workflows A–H, leave Cloudinary untouched, and write `docs/MIGRATION_COMPLETION_REPORT.md` without committing or pushing.
