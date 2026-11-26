"""Prepends (or refreshes) YAML frontmatter on every registered document from tools/registry.py."""
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
import registry

SOT = {
    "company": "config/company_facts.json", "project": "config/project_catalog.json", "apartments": "config/project_catalog.json",
    "amenities": "config/amenity_catalog.json", "commercial": "config/pricing_catalog.json + config/sales_policy.json",
    "legal": "authorised legal representative (facts NOT_PROVIDED in this knowledge base)", "sales_operations": "config/sales_policy.json + config/escalation_matrix.json",
    "customer_support": "config/*.json (FAQ answers restate structured records)", "post_sales": "config/sales_policy.json",
}
OVERRIDE = {45: "config/lead_scoring_rules.json", 46: "config/lead_scoring_rules.json", 48: "live appointment service + config/sales_policy.json", 50: "config/escalation_matrix.json"}

def yaml_list(v):
    return "[]" if not v else "\n" + "\n".join(f'  - "{x}"' for x in v)

def build(d, body):
    synthetic = "SYNTHETIC_DEMO_ASSUMPTION" in body
    fm = f"""---
doc_id: {d['doc_id']}
tenant_slug: {registry.TENANT}
document_title: "{d['document_title']}"
category: {d['category']}
subcategory: {d['subcategory']}
version: 1.0.0
status: active_demo
authority_level: {d['authority_level']}
data_classification: {d['data_classification']}
retrieval_scope: {d['retrieval_scope']}
language: "{d['language']}"
fictional_demo_data: true
contains_synthetic_assumptions: {str(synthetic).lower()}
created_at: {registry.TODAY}
last_updated: {registry.TODAY}
effective_from: {registry.TODAY}
effective_to: null
supersedes: {yaml_list(d['supersedes'])}
source_of_truth: "{OVERRIDE.get(d['number'], SOT[d['category']])}"
approval_status: PENDING_REVIEW
---
"""
    return fm + body

done = missing = 0
for d in registry.docs():
    p = os.path.join(os.path.dirname(__file__), "..", d["path"])
    if not os.path.exists(p): missing += 1; continue
    text = open(p, encoding="utf-8").read()
    body = re.sub(r"\A---\n.*?\n---\n", "", text, flags=re.S)  # refresh if present
    open(p, "w", encoding="utf-8").write(build(d, body)); done += 1
print(f"frontmatter applied: {done}, not yet written: {missing}")
