# VaaniQ Knowledge Base — ABC Developers / GreenHaven Residences

> **Fictional demonstration data.** ABC Developers and GreenHaven Residences (Gachibowli, Hyderabad; Towers A and B) were created for a technical assessment. Nothing here describes a real company, project, person or regulatory record.

A validated source set for VaaniQ's retrieval-augmented sales agent. It contains:
- 69 Markdown documents;
- 8 structured configuration files with JSON Schemas;
- a database-import seed;
- 69 evaluation cases;
- reconciliation and data-quality reports.

**Status:** all content is `PENDING_REVIEW` except two approved config files. **Not yet loaded into the running app:** see `reports/source_reconciliation_report.md` §4.

## Canonical facts

| Fact | Value |
|---|---|
| 2BHK | ≈1,180 sq.ft **built-up**; indicative base price ₹67,50,000 – ₹69,00,000 |
| 3BHK | ≈1,560 sq.ft **built-up**; indicative base price ₹89,50,000 – ₹92,00,000 |
| Location | Gachibowli, Hyderabad, Telangana |
| Towers | Tower A and Tower B (fictional) |

Carpet area, RERA details, approvals, title, possession dates, taxes, charges, bank partners and discounts are **never invented**. They appear as `NOT_PROVIDED`, `NOT_CONFIGURED` or `REQUIRES_HUMAN_CONFIRMATION`. Any other invented detail is labelled `SYNTHETIC_DEMO_ASSUMPTION`.

## Layout

```
VaaniQ_Knowledge_Base/
├── company/            01–06   identity, history, organisation, sales team, service standards, channels
├── project/            07–14   overview, location, master plan, construction, specifications, sustainability, utilities, security
├── apartments/         15–20   2BHK, 3BHK, room dimensions, area guide, parking, customization
├── amenities/          21–26   clubhouse, fitness, outdoor, family, community, facility management
├── commercial/         27–37   pricing policy, 2BHK/3BHK pricing, payment schedule, booking, charges, loans, banks, discounts, offers, cancellation
├── legal/              38–43   RERA, approvals, agreements, customer rights, privacy, legal escalation
├── sales_operations/   44–52   enquiry workflow, lead scoring, pipeline, follow-up, site visits, objections, escalation matrix, dialogues, SLAs
├── customer_support/   53–63   FAQs, objection library, trilingual glossary, Telugu and Hindi examples
├── post_sales/         64–69   booking confirmation, documents, construction updates, handover, after-sales, complaints
├── config/             8 JSON config files + schemas/ (fact.schema.json, config_file.schema.json)
├── structured_data/    unit_inventory_seed.csv + schema (DB import only, never RAG)
├── evaluation/         6 JSONL sets, 69 cases
├── reports/            source_reconciliation_report.md, data_quality_report.md, document_manifest.json, validation_results.json, retrieval_eval_results.json
└── tools/              registry.py, add_frontmatter.py, build_config.py, build_eval.py, build_structured.py, validate_kb.py, retrieval_eval.mjs
```

## Authority hierarchy and conflict rule

Defined in `config/data_authority_registry.json`:

| Rank | Source | Governs |
|---|---|---|
| 1 | Live inventory database (not configured yet), live appointment service | Availability, slots, bookings |
| 2 | `pricing_catalog`, `sales_policy`, `escalation_matrix`, `lead_scoring_rules` | Prices, commitments, routing, scores |
| 3 | `company_facts`, `project_catalog`, `amenity_catalog` | Company, project, unit and amenity facts |
| 4 | Documents at authority level 2–3 | Policy text and explanations |
| 5 | Documents at authority level 4 | Tone and handling only; never facts |

**Conflict rule:** never pick a value silently. Flag the conflict. Answer with the higher-ranked value only if it is CANONICAL; otherwise escalate for human review.

**Kept out of RAG:**
- Live inventory and appointments.
- Lead-scoring rules (deterministic application config).
- Agent operating rules (trusted backend config; `retrievable_by_rag: false`).

## Document format

- Every document starts with YAML frontmatter generated from `tools/registry.py`. Fields: `doc_id` (`ABC-GHR-KB-NN`), `tenant_slug`, `document_title`, `category`, `subcategory`, `version`, `status`, `authority_level`, `data_classification`, `retrieval_scope`, `language`, `fictional_demo_data`, `contains_synthetic_assumptions`, `created_at`, `last_updated`, `effective_from`, `effective_to`, `supersedes`, `source_of_truth`, `approval_status`.
- The frontmatter is followed by ten sections:
  1. Purpose
  2. Business context
  3. Details
  4. Customer-facing explanation
  5. Important conditions
  6. Exceptions
  7. Common customer questions
  8. What the AI agent can confidently answer
  9. What the AI must not claim
  10. Escalation
- The frontmatter is metadata: strip it at ingestion and store its fields alongside the chunks.

## Commands

```bash
python3 tools/build_config.py        # regenerate config/*.json
```
```bash
python3 tools/add_frontmatter.py     # refresh frontmatter from the registry
```
```bash
python3 tools/build_eval.py          # regenerate evaluation/*.jsonl
```
```bash
python3 tools/validate_kb.py         # validate everything; writes reports/validation_results.json and document_manifest.json
```
```bash
node tools/retrieval_eval.mjs --json reports/retrieval_eval_results.json   # retrieval baseline using the app's BM25 pipeline
```

## Current results

- Validator: **0 errors**, 2 warnings (document length below the 700-word target; one similar pair of parallel pricing documents).
- Retrieval: **58/60** scored cases hit@4. The two misses need small app-lexicon changes, listed in `reports/data_quality_report.md`.
- Reconciliation: **21 conflicts** between the brief and the running app's seed, UI and tests, each recorded with source line references.
- **No Cloudinary assets were uploaded or changed.**
