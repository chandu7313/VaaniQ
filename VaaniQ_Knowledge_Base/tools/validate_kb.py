"""Validates the knowledge base and writes reports/validation_results.json + reports/document_manifest.json.
Exit code 1 if any ERROR-level check fails. Usage: python3 tools/validate_kb.py"""
import hashlib, json, math, os, re, sys
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(__file__))
import registry

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
REQ_FM = ["doc_id", "tenant_slug", "document_title", "category", "subcategory", "version", "status", "authority_level",
          "data_classification", "language", "fictional_demo_data", "created_at", "last_updated", "effective_from",
          "effective_to", "supersedes", "source_of_truth", "approval_status"]
STATUSES = {"CANONICAL", "SYNTHETIC_DEMO_ASSUMPTION", "NOT_PROVIDED", "NOT_CONFIGURED", "REQUIRES_HUMAN_CONFIRMATION"}
UNKNOWN = ["NOT_PROVIDED", "NOT_CONFIGURED", "REQUIRES_HUMAN_CONFIRMATION"]
# Superseded / forbidden values. Allowed only on a line that explicitly marks them as superseded or unconfirmed.
STALE = {
 "2BHK area 1,150–1,290": r"1,?150\s*[–-]\s*1,?290|\b1,?290\b", "3BHK area 1,620–1,840": r"1,?620|1,?840",
 "2BHK price ₹68–82L": r"68\s*[–-]\s*82", "3BHK price ₹88–115L": r"88\s*[–-]\s*115",
 "seed carpet areas": r"\b820\b|\b920\b|1,?160\s*[–-]\s*1,?320", "placeholder RERA no.": r"P0{6,}",
 "seed possession dates": r"December 2027|June 2028|Dec 2027|Jun 2028",
 "fictional partner banks": r"Deccan Housing Bank|Charminar Finance|Godavari Home Loans",
 "seed maintenance/corpus": r"₹\s?3\s*(per|/)\s*sq|₹\s?50\s*(per|/)\s*sq", "seed cancellation 2%": r"\b2\s?%",
 "seed discount ₹2 lakh": r"₹\s?2 lakh", "static availability 49/33": r"\b49\b.*\b33\b",
}
ALLOW_MARK = re.compile(r"supersed|R-\d\d|unconfirmed|not confirmed|cannot confirm|must not|never|superseded|older|seed", re.I)
DYNAMIC = {"remaining-unit count": r"\b\d+\s+(units?|flats?|apartments?)\s+(left|remaining|still available)",
           "sold out claim": r"\bsold out\b(?!\")", "calendar date in body": r"\b20\d\d-\d\d-\d\d\b"}
CANON_PRICE_TOKENS = {"67,50,000", "69,00,000", "89,50,000", "92,00,000"}
LEGAL_TOPICS = {38: "RERA", 39: "approvals", 67: "possession", 34: "bank partners", 32: "taxes/charges", 37: "cancellation"}

res = {"errors": [], "warnings": [], "info": {}}
err = lambda m: res["errors"].append(m)
warn = lambda m: res["warnings"].append(m)

def parse_fm(text):
    m = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    if not m: return None, text
    fm, key = {}, None
    for line in m.group(1).split("\n"):
        if line.startswith("  - "): fm[key].append(line[4:].strip().strip('"')); continue
        k, _, v = line.partition(":"); key = k.strip(); v = v.strip()
        fm[key] = [] if v == "" else v.strip('"')
    return fm, text[m.end():]

# ---------- 1. documents, frontmatter, structure ----------
reg = registry.docs(); docs = {}
ids = [d["doc_id"] for d in reg]
if len(set(ids)) != len(ids): err("duplicate doc_id in registry")
for d in reg:
    p = os.path.join(ROOT, d["path"])
    if not os.path.exists(p): err(f"{d['doc_id']}: file missing {d['path']}"); continue
    raw = open(p, encoding="utf-8").read(); fm, body = parse_fm(raw)
    if fm is None: err(f"{d['doc_id']}: no frontmatter"); continue
    for k in REQ_FM:
        if k not in fm: err(f"{d['doc_id']}: frontmatter missing {k}")
    if fm.get("doc_id") != d["doc_id"]: err(f"{d['path']}: doc_id {fm.get('doc_id')} != registry {d['doc_id']}")
    if fm.get("fictional_demo_data") != "true": err(f"{d['doc_id']}: fictional_demo_data must be true")
    if fm.get("tenant_slug") != registry.TENANT: err(f"{d['doc_id']}: wrong tenant_slug")
    if str(fm.get("authority_level")) != str(d["authority_level"]): err(f"{d['doc_id']}: authority_level mismatch")
    secs = [int(x) for x in re.findall(r"^## (\d+)\.", body, re.M)]
    if secs != list(range(1, 11)): err(f"{d['doc_id']}: sections {secs} (expected 1..10 in order)")
    if "FICTIONAL" not in body[:600]: err(f"{d['doc_id']}: fictional-data disclaimer missing near top")
    syn = "SYNTHETIC_DEMO_ASSUMPTION" in body
    if fm.get("contains_synthetic_assumptions") != str(syn).lower(): err(f"{d['doc_id']}: contains_synthetic_assumptions flag out of date")
    docs[d["doc_id"]] = dict(meta=d, fm=fm, body=body, raw=raw, words=len(re.findall(r"\S+", body)))

# ---------- 2. config JSON ----------
cfg_dir = os.path.join(ROOT, "config"); configs = {}
for f in sorted(os.listdir(cfg_dir)):
    if not f.endswith(".json"): continue
    try: j = json.load(open(os.path.join(cfg_dir, f), encoding="utf-8"))
    except Exception as e: err(f"config/{f}: invalid JSON {e}"); continue
    configs[f] = j
    for k in ["schema_version", "file_id", "tenant_slug", "fictional_demo_data", "authority_level", "last_updated", "approval_status", "retrievable_by_rag"]:
        if k not in j: err(f"config/{f}: envelope missing {k}")
    def walk(o, path):
        if isinstance(o, dict):
            if "status" in o and "value" in o:
                if o["status"] not in STATUSES: err(f"config/{f}:{path} invalid status {o['status']}")
                if o["status"] in UNKNOWN and o["value"] not in (None, [], ""): err(f"config/{f}:{path} unknown status but value set")
            for k, v in o.items(): walk(v, f"{path}.{k}")
        elif isinstance(o, list):
            for i, v in enumerate(o): walk(v, f"{path}[{i}]")
    walk(j, "")
for f in ["schemas/fact.schema.json", "schemas/config_file.schema.json"]:
    try: json.load(open(os.path.join(cfg_dir, f)))
    except Exception as e: err(f"config/{f}: invalid JSON {e}")
for f in ["sales_policy.json", "escalation_matrix.json", "lead_scoring_rules.json", "data_authority_registry.json"]:
    if configs.get(f, {}).get("retrievable_by_rag") is not False: err(f"config/{f}: must not be retrievable by RAG (trusted backend config)")
pc = configs.get("pricing_catalog.json", {}).get("unit_pricing", {})
canon = {"2BHK": (6750000, 6900000, 1180), "3BHK": (8950000, 9200000, 1560)}
for u, (lo, hi, area) in canon.items():
    if pc.get(u, {}).get("base_price_min_inr", {}).get("value") != lo or pc.get(u, {}).get("base_price_max_inr", {}).get("value") != hi:
        err(f"pricing_catalog {u} differs from canonical range")
ut = configs.get("project_catalog.json", {}).get("project", {}).get("unit_types", {})
for u, (_, _, area) in canon.items():
    v = json.dumps(ut.get(u, {}))
    if str(area) not in v: err(f"project_catalog {u} built-up area not {area}")
    if '"carpet_area' in v and '"NOT_PROVIDED"' not in v: err(f"project_catalog {u} carpet area must be NOT_PROVIDED")

# ---------- 3. stale / conflicting values, prices and areas ----------
stale_hits = defaultdict(list); price_tokens = Counter(); area_claims = []
for did, d in docs.items():
    for ln, line in enumerate(d["body"].split("\n"), 1):
        for name, rx in STALE.items():
            if re.search(rx, line):
                quoted_q = re.match(r'^\|\s*"[^"]+"\s*\|', line) is not None  # a customer's question quoting a value is not a claim
                key = "allowed_in_supersession_context" if ALLOW_MARK.search(line) else "quoted_in_customer_question" if quoted_q else "UNMARKED"
                stale_hits[key].append(f"{did}:{ln} [{name}]")
        for tok in re.findall(r"₹\s?(\d{1,2}(?:,\d\d)*,\d{3})", line): price_tokens[tok] += 1
        for m in re.finditer(r"([23])BHK([^|\n]{0,50}?)([\d,]{4,5})\s*sq\.?\s?ft", line):
            if re.search(r"\bfor\b|BHK|\band\b", m.group(2)): continue  # number belongs to another clause
            area_claims.append((did, ln, m.group(1), m.group(3).replace(",", "")))
        for m in re.finditer(r"([\d,]{4,5})\s*sq\.?\s?ft for (?:the |a )?([23])BHK", line):
            area_claims.append((did, ln, m.group(2), m.group(1).replace(",", "")))
for h in stale_hits["UNMARKED"]: err(f"stale/conflicting value without supersession marker: {h}")
# ₹1,00,000 = token (sales_policy); ₹60,748 = labelled EMI illustration (KB-33, KB-59)
bad_prices = {t: n for t, n in price_tokens.items() if t not in CANON_PRICE_TOKENS and t not in {"1,00,000", "60,748"}}
LAKH_OK = {"67.5", "69", "89.5", "92", "1", "1.5"}            # canonical bounds, token, width of 2BHK range
LAKH_EXAMPLE = {"60", "65", "70", "75", "80", "85", "90", "95"}  # customer budgets / EMI illustration loan amounts
LAKH_SUPERSEDED = {"68", "82", "88", "115", "2"}
lakh_use = Counter()
for did, d in docs.items():
    for ln, line in enumerate(d["body"].split("\n"), 1):
        for v in re.findall(r"(\d+(?:\.\d+)?)\s*(?:–\s*\d+(?:\.\d+)?\s*)?lakh", line):
            kind = "canonical_or_policy" if v in LAKH_OK else "example_budget" if v in LAKH_EXAMPLE else "superseded" if v in LAKH_SUPERSEDED else "unknown"
            lakh_use[kind] += 1
            if kind == "unknown": err(f"{did}:{ln} unexplained amount {v} lakh")
            if kind == "superseded" and not (ALLOW_MARK.search(line) or re.match(r'^\|\s*"', line) or re.search(r"cites|said|quoting|older", line, re.I)):
                err(f"{did}:{ln} superseded amount {v} lakh outside a supersession/quoted context")
for t, n in bad_prices.items(): err(f"non-canonical rupee amount ₹{t} appears {n}x")
for did, ln, b, a in area_claims:
    if (b, a) not in {("2", "1180"), ("3", "1560")}: err(f"{did}:{ln} {b}BHK paired with {a} sq.ft")
for did, d in docs.items():
    if re.search(r"carpet area\s*(?:is|of|=|:)?\s*(?:about|approximately|approx\.?|≈)?\s*[\d,]{3,5}\s*sq", d["body"], re.I):
        err(f"{did}: states a numeric carpet area")

# ---------- 4. cross references ----------
esc_ids = {r["id"] for r in configs.get("escalation_matrix.json", {}).get("rules", [])}
am_ids = {a["id"] for a in configs.get("amenity_catalog.json", {}).get("amenities", [])}
xref = Counter(); inbound = Counter()
for did, d in docs.items():
    for ref in set(re.findall(r"ABC-GHR-KB-\d\d", d["body"])):
        xref["kb"] += 1
        if ref not in docs: err(f"{did}: broken reference {ref}")
        elif ref != did: inbound[ref] += 1
    for ref in set(re.findall(r"ESC-\d\d", d["body"])):
        if ref not in esc_ids: err(f"{did}: unknown escalation {ref}")
    for ref in set(re.findall(r"AM-\d\d", d["body"])):
        if ref not in am_ids: err(f"{did}: unknown amenity {ref}")
    for ref in set(re.findall(r"config/[a-z_]+\.json", d["body"])):
        if not os.path.exists(os.path.join(ROOT, ref)): err(f"{did}: missing config reference {ref}")
orphans = [x for x in docs if inbound[x] == 0]
if orphans: warn(f"documents with no inbound cross-reference: {orphans}")

# ---------- 5. unknown handling, dynamic data, rules leakage ----------
unknown_counts = {did: {u: d["body"].count(u) for u in UNKNOWN} for did, d in docs.items()}
for n, topic in LEGAL_TOPICS.items():
    did = f"ABC-GHR-KB-{n:02d}"
    if did in docs and sum(unknown_counts[did].values()) == 0: err(f"{did} ({topic}) has no unknown marker")
for did, d in docs.items():
    for name, rx in DYNAMIC.items():
        for m in re.finditer(rx, d["body"], re.I):
            line = d["body"][:m.start()].count("\n") + 1
            ctx = d["body"].split("\n")[line - 1]
            if not ALLOW_MARK.search(ctx) and "never" not in ctx.lower(): err(f"{did}:{line} dynamic data [{name}]: {m.group(0)}")
    if re.search(r"system prompt|you are an ai assistant whose", d["body"], re.I): err(f"{did}: agent system rules must not be in RAG content")
for n, rx in [(62, r"[ఀ-౿]"), (63, r"[ऀ-ॿ]"), (61, r"[ఀ-౿]")]:
    if not re.search(rx, docs[f"ABC-GHR-KB-{n:02d}"]["body"]): err(f"ABC-GHR-KB-{n}: expected script missing")
csvp = os.path.join(ROOT, "structured_data", "unit_inventory_seed.csv")
if os.path.exists(csvp):
    import csv
    rows = list(csv.DictReader(open(csvp, encoding="utf-8")))
    if len(rows) != 264: err(f"inventory seed has {len(rows)} rows, expected 264")
    if any(r["carpet_area_sqft"] for r in rows): err("inventory seed must not contain carpet area")
    if any((r["configuration"], r["built_up_area_sqft"]) not in {("2BHK", "1180"), ("3BHK", "1560")} for r in rows): err("inventory seed area mismatch")

# ---------- 6. similarity and duplicate sentences ----------
tok = lambda s: [w for w in re.findall(r"[a-z]{3,}", s.lower())]
tf = {did: Counter(tok(d["body"])) for did, d in docs.items()}
df = Counter(w for c in tf.values() for w in c)
N = len(tf); vec = {}
for did, c in tf.items():
    v = {w: (1 + math.log(n)) * math.log(N / df[w]) for w, n in c.items() if df[w] < N}
    norm = math.sqrt(sum(x * x for x in v.values())) or 1; vec[did] = {w: x / norm for w, x in v.items()}
pairs = []
keys = sorted(vec)
for i, a in enumerate(keys):
    for b in keys[i + 1:]:
        s = sum(x * vec[b].get(w, 0) for w, x in vec[a].items())
        pairs.append((round(s, 3), a, b))
pairs.sort(reverse=True)
for s, a, b in pairs:
    if s >= 0.6: warn(f"high similarity {s} between {a} and {b}")
distinct = {did: [w for w, _ in sorted(vec[did].items(), key=lambda kv: -kv[1])[:6]] for did in keys}
sent_docs = defaultdict(set)
for did, d in docs.items():
    for s in re.split(r"(?<=[.!?])\s+", re.sub(r"[|#>*`]", " ", d["body"])):
        s = " ".join(s.split())
        if len(s) >= 80: sent_docs[s].add(did)
dups = sorted(((len(v), k[:110]) for k, v in sent_docs.items() if len(v) > 1), reverse=True)

# ---------- 7. evaluation sets ----------
eval_dir = os.path.join(ROOT, "evaluation"); ev_total = 0; ev_by = {}
REQ_EV = ["id", "query", "language", "expected_doc_ids", "expected_route", "expected_facts", "must_not_claim", "expected_escalation"]
seen = set()
for f in sorted(os.listdir(eval_dir)):
    if not f.endswith(".jsonl"): continue
    n = 0
    for i, line in enumerate(open(os.path.join(eval_dir, f), encoding="utf-8"), 1):
        if not line.strip(): continue
        try: c = json.loads(line)
        except Exception as e: err(f"evaluation/{f}:{i} invalid JSON"); continue
        n += 1
        for k in REQ_EV:
            if k not in c: err(f"evaluation/{f}:{i} missing {k}")
        if c.get("id") in seen: err(f"duplicate eval id {c.get('id')}")
        seen.add(c.get("id"))
        for x in c.get("expected_doc_ids", []):
            if x not in docs: err(f"evaluation/{f}:{i} unknown doc {x}")
        if c.get("expected_escalation") and c["expected_escalation"] not in esc_ids: err(f"evaluation/{f}:{i} unknown escalation")
    ev_by[f] = n; ev_total += n
if ev_total < 60: err(f"only {ev_total} evaluation cases (need >= 60)")

# ---------- 8. word counts ----------
wc = {did: d["words"] for did, d in docs.items()}
short = sorted([(w, did) for did, w in wc.items() if w < 700])
if short: warn(f"{len(short)} documents below the 700-word target (min {short[0][0]}, {short[0][1]})")

# ---------- outputs ----------
cat = Counter(d["meta"]["category"] for d in docs.values())
res["info"] = dict(documents=len(docs), categories=dict(cat), words_total=sum(wc.values()), words_min=min(wc.values()),
    words_max=max(wc.values()), words_mean=round(sum(wc.values()) / len(wc)), below_700=len(short), word_counts=wc,
    configs=sorted(configs), stale_values_in_supersession_context=stale_hits["allowed_in_supersession_context"], stale_values_quoted_in_customer_questions=stale_hits["quoted_in_customer_question"],
    rupee_amounts=dict(price_tokens), lakh_amount_usage=dict(lakh_use), unknown_marker_counts=unknown_counts,
    unknown_marker_totals={u: sum(v[u] for v in unknown_counts.values()) for u in UNKNOWN},
    synthetic_label_count=sum(d["body"].count("SYNTHETIC_DEMO_ASSUMPTION") for d in docs.values()),
    kb_cross_references=xref["kb"], orphan_documents=orphans,
    top_similar_pairs=pairs[:10], distinct_terms=distinct, duplicate_long_sentences=dups[:15], duplicate_long_sentence_count=len(dups),
    evaluation_cases=ev_by, evaluation_total=ev_total,
    by_authority=dict(Counter(d["meta"]["authority_level"] for d in docs.values())),
    by_scope=dict(Counter(d["meta"]["retrieval_scope"] for d in docs.values())))
os.makedirs(os.path.join(ROOT, "reports"), exist_ok=True)
json.dump(res, open(os.path.join(ROOT, "reports", "validation_results.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
manifest = dict(generated_at=registry.TODAY, tenant_slug=registry.TENANT, hash_algorithm="SHA-256", documents=[
    dict(doc_id=did, path=d["meta"]["path"], title=d["meta"]["document_title"], category=d["meta"]["category"],
         subcategory=d["meta"]["subcategory"], version=d["fm"]["version"], status=d["fm"]["status"],
         authority_level=d["meta"]["authority_level"], retrieval_scope=d["meta"]["retrieval_scope"], language=d["meta"]["language"],
         approval_status=d["fm"]["approval_status"], words=d["words"], sha256=hashlib.sha256(d["raw"].encode("utf-8")).hexdigest())
    for did, d in sorted(docs.items())],
    config_files=[dict(path=f"config/{f}", file_id=configs[f].get("file_id"), retrievable_by_rag=configs[f].get("retrievable_by_rag"),
         sha256=hashlib.sha256(open(os.path.join(cfg_dir, f), "rb").read()).hexdigest()) for f in sorted(configs)])
json.dump(manifest, open(os.path.join(ROOT, "reports", "document_manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"documents {len(docs)} | words {res['info']['words_total']} (min {res['info']['words_min']}, mean {res['info']['words_mean']}, max {res['info']['words_max']}) | eval cases {ev_total}")
print(f"categories {dict(cat)}")
print(f"ERRORS {len(res['errors'])}"); [print("  E", e) for e in res["errors"][:60]]
print(f"WARNINGS {len(res['warnings'])}"); [print("  W", w) for w in res["warnings"][:20]]
print("top similar:", pairs[:4]); print("duplicate long sentences:", len(dups))
sys.exit(1 if res["errors"] else 0)
