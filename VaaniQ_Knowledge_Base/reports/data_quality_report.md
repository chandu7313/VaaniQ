# Data Quality Report

**Date:** 2026-11-26 · **Validator:** `python3 tools/validate_kb.py` → 0 errors, 2 warnings · **Retrieval:** `node tools/retrieval_eval.mjs` → 58/60 scored cases hit@4
Machine-readable results: `reports/validation_results.json`, `reports/retrieval_eval_results.json`, `reports/document_manifest.json` (SHA-256 of every document and config file).

## 1. Inventory

| Category | Docs | Words (min / mean / max) |
|---|---|---|
| company | 6 | 617 / 697 / 808 |
| project | 8 | 430 / 552 / 675 |
| apartments | 6 | 562 / 624 / 716 |
| amenities | 6 | 494 / 541 / 569 |
| commercial | 11 | 388 / 538 / 650 |
| legal | 6 | 410 / 490 / 519 |
| sales_operations | 9 | 371 / 493 / 595 |
| customer_support | 11 | 367 / 485 / 711 |
| post_sales | 6 | 376 / 440 / 475 |
| **Total** | **69** | **36,852 words** (367 / 534 / 808) |

- **Authority levels:** 28 documents at level 2 (policy), 36 at level 3 (reference), 5 at level 4 (guidance and examples).
- **Retrieval scope:** 53 customer-facing, 16 agent-internal.
- **Languages:** 66 English, 1 trilingual glossary (en/hi/te), 1 Telugu set of examples, 1 Hindi set of examples.
- **Configuration:** 8 config files plus 2 JSON Schemas, 264-row inventory seed, 69 evaluation cases.

## 2. Checks performed

| # | Check | Result |
|---|---|---|
| 1 | All 69 files exist; IDs unique; frontmatter has all 18 required fields and agrees with `tools/registry.py` | ✅ |
| 2 | Every document has sections 1–10 in order, a fictional-data disclaimer at the top, and a `contains_synthetic_assumptions` flag that matches its text | ✅ |
| 3 | Config JSON parses; envelope fields present; every fact status is one of the 5 allowed values; unknown-status facts carry no value | ✅ |
| 4 | Sales policy, escalation matrix, lead-scoring rules and the authority registry are `retrievable_by_rag: false` (trusted backend configuration) | ✅ |
| 5 | Canonical prices and areas in `pricing_catalog.json` / `project_catalog.json` equal the brief; carpet area `NOT_PROVIDED` | ✅ |
| 6 | **Conflicting prices and areas:** every BHK/sq.ft pairing is 2BHK–1,180 or 3BHK–1,560; full-figure rupee amounts are only the four canonical bounds, the ₹1,00,000 token and one labelled EMI illustration | ✅ |
| 7 | **Superseded values** (12 patterns: old ranges, seed carpet areas, RERA placeholder, possession dates, bank names, maintenance rates, 2%, ₹2 lakh, 49/33): 21 occurrences, all on lines marked as superseded or unconfirmed, plus 2 inside quoted customer questions whose answers deny them | ✅ |
| 8 | Lakh amounts: 61 canonical or policy, 26 customer-budget examples, 13 superseded (all in marked context), 0 unexplained | ✅ |
| 9 | No numeric carpet area anywhere | ✅ |
| 10 | Cross-references: all `ABC-GHR-KB-NN`, `ESC-NN`, `AM-NN` and `config/*.json` references resolve; every document is referenced by at least one other | ✅ |
| 11 | **No dynamic data in static RAG:** no remaining-unit counts, "sold out" claims or calendar dates in document bodies | ✅ |
| 12 | Agent system rules not present in retrievable text | ✅ |
| 13 | Telugu and Devanagari scripts present where expected (docs 61–63) | ✅ |
| 14 | Inventory seed: 264 rows, 66+66 per tower, no carpet area, areas canonical | ✅ |
| 15 | Evaluation: 69 cases, all fields present, unique IDs, all expected document IDs and escalation IDs exist | ✅ |
| 16 | Similarity (TF-IDF cosine) | ⚠️ highest pair 0.602 (see 3.2) |
| 17 | Word-count target 700–1,500 | ⚠️ 5 of 69 meet it (see 3.1) |

The validator was mutation-tested on a scratch copy. One injected paragraph contained an old price, a carpet area, a possession date, a remaining-unit count, a broken document reference and an unknown escalation ID; a section number was also corrupted. All 9 resulting errors were reported.

## 3. Warnings and limitations

### 3.1 Document length below the brief's 700–1,500 words
- The mean is 534 words; only 5 documents reach 700.
- The shortest are legal, FAQ and post-sales documents (367–410 words). Their subjects are mostly facts the brief forbids inventing (RERA, approvals, possession, taxes, bank partners).
- Making them longer would mean either repeating the same "not provided" statements or inventing synthetic detail, which would lower retrieval precision or add made-up content.
- **Expanding selected documents is a reviewable follow-up, not done here.**

### 3.2 Near-duplicate pairs (intentional, distinct retrieval value)
| Pair | Cosine | Why both exist |
|---|---|---|
| KB-28 / KB-29 (2BHK / 3BHK pricing) | 0.602 | Same structure, different configuration, range and budget guidance |
| KB-15 / KB-16 (2BHK / 3BHK specifications) | 0.586 | Same structure, different configuration |
| KB-08 / KB-54 (location / location FAQ) | 0.547 | Policy explanation vs short Q&A |
| KB-62 / KB-63 (Telugu / Hindi examples) | 0.540 | Parallel examples in different languages |

Top distinctive terms per document are listed in `validation_results.json` (`distinct_terms`).

### 3.3 Repeated sentences
3 long sentences repeat across 2 documents each: a config pointer and a facts-used header in the language examples. They are harmless; no fact is stated differently anywhere.

## 4. Unknown-information report

| Marker | Occurrences | Meaning |
|---|---|---|
| `NOT_PROVIDED` | 203 | The fact does not exist in any verified source |
| `NOT_CONFIGURED` | 64 | A capability or setting is not set up (inventory table, offers, store timings, contacts) |
| `REQUIRES_HUMAN_CONFIRMATION` | 50 | A value exists only with a person's confirmation (final price, refunds, construction stage) |
| `SYNTHETIC_DEMO_ASSUMPTION` | 165 | Invented for the demo and labelled as such |

**Always unknown, with how the agent responds:**
| Fact | Response |
|---|---|
| Carpet and super built-up area | Escalate (ESC-08) |
| RERA number and status, approvals, land title, litigation, occupancy certificate | ESC-02 |
| Possession dates | ESC-03 |
| GST and stamp-duty amounts, all additional charges, final payable amount | ESC-05 |
| Floor-rise or location premiums | Cost sheet |
| Bank partners, pre-approvals, interest rates | ESC-07 |
| Offers and discounts | ESC-04 |
| Cancellation and refund terms | ESC-10 |
| Maintenance, corpus | Cost sheet |
| Distances and travel times, school and hospital names | ESC-08 |
| Construction progress | ESC-03 |
| Live unit availability | Live inventory (not configured) |

Twelve documents have no unknown marker. They are process and guidance documents (workflows, scoring, escalation matrix, dialogues, glossary, examples) that state no project facts of their own.

## 5. Retrieval evaluation (baseline)

Method: `tools/retrieval_eval.mjs` indexes the 69 documents in memory with the **app's own** chunker, tokenizer, BM25, Hindi/Telugu expansion and two-part-question logic (k = 4, relevance ≥ 0.20; frontmatter stripped). It produced 914 chunks.

| Set | Scored | Hit@4 | Top-1 |
|---|---|---|---|
| factual | 15 | 15 | 12 |
| paraphrase | 12 | 11 | 11 |
| multilingual | 12 | 11 | 10 |
| conflict | 10 | 10 | 8 |
| unsupported | 10 | 10 | 6 / 7 |
| tool_routing | 1 | 1 | 0 |
| **Total** | **60** | **58 (96.7%)** | |

- 9 tool-routing cases (availability, booking, cancellation, human/privacy/complaint escalation) are routed by the orchestrator, not retrieval. They are kept for an end-to-end run and not scored here.
- "Unsupported" passes when nothing clears the threshold (helipad, nonsense) or when the "not provided" document is retrieved.

**Two misses, both fixable only in the application's lexicon (not changed):**
1. `स्विमिंग पूल है क्या?` → glossary/examples instead of the amenity documents: the Hindi word for pool is not in `retrievalSynonyms`.
2. `3 bhk rate kya hai` → glossary/objection library. The Hinglish filler words *kya* and *hai* are not stop words, and they match romanised phrases in docs 60–61.

**Fixed during evaluation (knowledge-base side):** paraphrase coverage for "work out", "apart from the flat price" and the "installments" spelling. The first run scored 59/69 with all cases counted.

**Ablation:** excluding level-4 guidance documents lowers multilingual hit@4 from 11/12 to 6/12, so the examples and glossary carry real retrieval value for Hindi and Telugu.

## 6. Recommendations
1. Approve the migration in `source_reconciliation_report.md` §4 (catalog, documents, tests, tenant settings).
2. Add `pool: ['स्विमिंग पूल', 'पूल', 'ఈత కొలను', 'పూల్']` to `retrievalSynonyms`, and Hinglish fillers (`kya`, `hai`, `ki`, `ka`, `ke`, `hain`) to the BM25 stop list.
3. At ingestion, store `doc_id`, `authority_level` and `retrieval_scope`; prefer level 2–3 chunks when a level-4 chunk ties on a factual question.
4. Run the 9 tool-routing cases end to end through the orchestrator tests after migration.
5. Have a human review every `PENDING_REVIEW` document and config before production use.
