"""Builds config/*.json (structured master data). Re-run after editing; output is deterministic."""
import json, os
D = "2026-11-26"
def env(n, auth, retrievable=True, approval="PENDING_REVIEW"):
    return {"schema_version": "1.0", "file_id": f"ABC-GHR-CFG-{n:02d}", "tenant_slug": "abc-developers", "fictional_demo_data": True,
            "authority_level": auth, "last_updated": D, "approval_status": approval, "retrievable_by_rag": retrievable}
F = lambda value, status, source="", **kw: {"value": value, "status": status, "source": source, **kw}
C, S, NP, NC, RH = "CANONICAL", "SYNTHETIC_DEMO_ASSUMPTION", "NOT_PROVIDED", "NOT_CONFIGURED", "REQUIRES_HUMAN_CONFIRMATION"
BRIEF = "knowledge-base brief 2026-11-26 (canonical starting facts)"
SEED = "VaaniQ seed data (backend/src/db/seedData.js), carried forward as synthetic"
files = {}

files["company_facts.json"] = {**env(1, 1), "company": {
  "legal_name": F(None, NP, note="Fictional company; no legal entity details exist."),
  "display_name": F("ABC Developers", C, BRIEF),
  "fictional_disclaimer": F("ABC Developers and GreenHaven Residences are fictional, created for a technical assessment. No information describes a real company, project, person or regulatory record.", C, BRIEF),
  "business": F("Residential apartment sales", C, BRIEF),
  "headquarters_city": F("Hyderabad, Telangana, India", S, SEED),
  "founded_year": F(2009, S, SEED),
  "projects_delivered": F(6, S, SEED, note="Count is illustrative only."),
  "homes_delivered_approx": F(1800, S, SEED),
  "current_project": F("GreenHaven Residences", C, BRIEF),
  "sales_office_location": F("At the GreenHaven Residences project site, Gachibowli", S, SEED),
  "sales_office_hours": F("Monday to Saturday, 10:00 to 18:00 IST", S, SEED),
  "phone": F(None, NC), "email": F(None, NC), "website": F(None, NC),
  "gstin": F(None, NP), "cin": F(None, NP),
}}

files["project_catalog.json"] = {**env(2, 1), "project": {
  "name": F("GreenHaven Residences", C, BRIEF),
  "developer": F("ABC Developers", C, BRIEF),
  "locality": F("Gachibowli", C, BRIEF), "city": F("Hyderabad", C, BRIEF), "state": F("Telangana", C, BRIEF), "country": F("India", C, BRIEF),
  "type": F("Gated residential apartment community", S, SEED),
  "towers": F(["Tower A", "Tower B"], C, BRIEF, note="Fictional sample towers."),
  "floors_per_tower": F(18, S, SEED),
  "total_apartments": F(264, S, SEED), "apartments_per_tower": F({"2BHK": 66, "3BHK": 66}, S, SEED),
  "land_area": F(4.2, S, SEED, unit="acres"), "open_space_share": F(70, S, SEED, unit="percent"),
  "configurations": F(["2BHK", "3BHK"], C, BRIEF),
  "construction_status": F(None, RH, note="Seed text described slab progress; treat as unverified. Live updates come from the project team."),
  "rera_registration_number": F(None, NP, note="Never invent. Escalate to an authorised representative."),
  "possession_date": F(None, NP, note="Never invent or estimate. Escalate."),
  "approvals": F(None, NP), "land_title_status": F(None, NP),
  "exact_landmark_distances": F(None, NP, note="Do not quote distances; describe the locality qualitatively."),
  "unit_types": {
    "2BHK": {"bedrooms": F(2, C, BRIEF), "bathrooms": F(2, S, SEED), "balconies": F(2, S, SEED),
             "built_up_area_sqft": F(1180, C, BRIEF, unit="sq.ft", note="Approximate built-up area."),
             "carpet_area_sqft": F(None, NP, note="Not provided. Must not be derived from built-up area."),
             "super_built_up_area_sqft": F(None, NP),
             "covered_parking_slots": F(1, S, SEED)},
    "3BHK": {"bedrooms": F(3, C, BRIEF), "bathrooms": F(3, S, SEED), "balconies": F(3, S, SEED),
             "built_up_area_sqft": F(1560, C, BRIEF, unit="sq.ft", note="Approximate built-up area."),
             "carpet_area_sqft": F(None, NP, note="Not provided. Must not be derived from built-up area."),
             "super_built_up_area_sqft": F(None, NP),
             "covered_parking_slots": F(2, S, SEED)},
  },
  "live_data_sources": {"unit_availability": "live inventory database (NOT_CONFIGURED in the current app: see reports)", "appointment_slots": "live appointments service (GET /api/appointments/availability)"},
}}

files["pricing_catalog.json"] = {**env(3, 1), "currency": "INR", "price_basis": F("Base price, before additional charges and taxes", C, BRIEF),
  "price_status": F("Indicative", C, BRIEF, note="Ranges are indicative. Final unit price comes from an approved cost sheet issued by the sales team."),
  "unit_pricing": {
    "2BHK": {"base_price_min_inr": F(6750000, C, BRIEF), "base_price_max_inr": F(6900000, C, BRIEF), "display": F("₹67,50,000 – ₹69,00,000", C, BRIEF)},
    "3BHK": {"base_price_min_inr": F(8950000, C, BRIEF), "base_price_max_inr": F(9200000, C, BRIEF), "display": F("₹89,50,000 – ₹92,00,000", C, BRIEF)}},
  "variation_factors": F(["floor", "facing", "unit position"], S, SEED, note="Explains why a range exists; amounts per factor are NOT_PROVIDED."),
  "floor_rise_charge": F(None, NP), "preferred_location_charge": F(None, NP), "car_parking_charge": F(None, NP),
  "clubhouse_membership_charge": F(None, NP), "maintenance_deposit": F(None, NP), "corpus_fund": F(None, NP),
  "gst": F(None, NP, note="Taxes as per applicable law at the time of payment; never quote a rate or amount."),
  "stamp_duty_and_registration": F(None, NP, note="Statutory; payable as per applicable law. Never quote amounts."),
  "final_payable_amount": F(None, RH, note="Only an approved cost sheet from the sales team states a final amount."),
  "price_validity": F(None, RH),
  "superseded_values": [
    {"field": "2BHK price range", "old_value": "₹68–82 lakh", "source": "seed / live tenant catalog", "status": "SUPERSEDED_BY_CANONICAL"},
    {"field": "3BHK price range", "old_value": "₹88–115 lakh", "source": "seed / live tenant catalog", "status": "SUPERSEDED_BY_CANONICAL"}],
}

files["amenity_catalog.json"] = {**env(4, 1), "amenities": [
  {"id": f"AM-{i:02d}", "name": n, "category": c, "location": loc, "operating_status": F("Planned, part of the project", S, SEED),
   "operational_from": F(None, NP), "operating_hours": F(h, S) if h else F(None, NC), "usage_charges": F(None, NC),
   "restrictions": F(r, S) if r else F(None, NC), "documented_in": doc}
  for i, (n, c, loc, h, r, doc) in enumerate([
    ("Clubhouse (approx. 25,000 sq.ft)", "clubhouse", "Central podium", "06:00–22:00", "Residents and registered guests", "ABC-GHR-KB-21"),
    ("Swimming pool", "fitness", "Clubhouse", "06:00–21:00", "Children under 12 with an adult; swimwear required", "ABC-GHR-KB-22"),
    ("Gymnasium", "fitness", "Clubhouse", "05:30–22:00", "Minimum age 16 without supervision", "ABC-GHR-KB-22"),
    ("Yoga deck", "fitness", "Clubhouse terrace", "05:30–20:00", None, "ABC-GHR-KB-22"),
    ("Indoor games room", "clubhouse", "Clubhouse", "08:00–22:00", None, "ABC-GHR-KB-21"),
    ("Badminton court", "fitness", "Clubhouse", "06:00–22:00", "Advance slot booking at the facility desk", "ABC-GHR-KB-22"),
    ("Jogging track", "outdoor", "Landscaped periphery", "05:00–22:00", None, "ABC-GHR-KB-23"),
    ("Landscaped gardens", "outdoor", "Open areas", None, None, "ABC-GHR-KB-23"),
    ("Children's play area", "family", "Central lawn", "07:00–20:00", "Children under 10 with adult supervision", "ABC-GHR-KB-24"),
    ("Senior citizens' park", "family", "Garden zone", "05:00–21:00", None, "ABC-GHR-KB-24"),
    ("Convenience store", "community", "Inside the campus", None, "Operated by a third party, timings NOT_CONFIGURED", "ABC-GHR-KB-25"),
    ("Multipurpose hall", "community", "Clubhouse", None, "Advance booking via the facility desk", "ABC-GHR-KB-25"),
  ], start=1)]}

files["sales_policy.json"] = {**env(5, 1, retrievable=False), "policies": {
  "site_visit_hours": F({"days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "start": "10:00", "end": "18:00", "slot_minutes": 60, "timezone": "Asia/Kolkata"}, S, SEED, note="Must match tenant booking settings."),
  "site_visit_min_lead_hours": F(2, S, SEED), "site_visit_booking_window_days": F(7, S, SEED),
  "booking_requires_explicit_customer_confirmation": F(True, C, "VaaniQ architecture rule"),
  "token_amount_inr": F(100000, S, SEED, note="Blocks a unit for 7 days; adjusted against the booking amount."),
  "token_hold_days": F(7, S, SEED),
  "booking_amount_percent": F(10, S, SEED),
  "cancellation_terms": F(None, RH, note="Seed text stated a 2% charge after agreement; refund terms are governed by the sale agreement and applicable law. Escalate."),
  "discount_authority": F({"ai_agent": "none", "sales_executive": "none", "sales_manager": "case-by-case, written approval", "head_of_sales": "final authority"}, S, note="The AI never offers, promises or estimates discounts."),
  "active_offers": F(None, NC, note="No offer is configured. The seed's ₹2 lakh festive discount is superseded and must not be quoted."),
  "quotation_validity_days": F(None, RH),
  "accepted_payment_modes": F(["bank transfer", "cheque"], S, SEED, note="No cash."),
  "agent_operating_rules": [
    "Answer only from approved documents and structured records; never invent facts.",
    "Never quote RERA numbers, approvals, title status, possession dates, taxes or final payable amounts.",
    "Never offer, promise or estimate discounts, loan approval or price reductions.",
    "Book appointments only after the customer explicitly confirms the exact slot.",
    "Read availability from live systems; never from documents.",
    "Escalate legal, complaint, negotiation and unknown-information requests per the escalation matrix.",
  ],
}}

files["escalation_matrix.json"] = {**env(6, 1, retrievable=False), "rules": [
  {"id": f"ESC-{i:02d}", "trigger": t, "examples": ex, "route_to": to, "priority": p, "response_target": rt, "ai_response": ai}
  for i, (t, ex, to, p, rt, ai) in enumerate([
    ("customer_requests_human", ["talk to a person", "call me back"], "sales_executive", "high", "within 1 business hour", "Confirm a colleague will call; collect a preferred time."),
    ("legal_or_regulatory_question", ["RERA number", "title documents", "approvals", "litigation"], "legal_and_compliance_team", "high", "within 1 business day", "Say the information must come from an authorised representative; do not speculate."),
    ("possession_or_handover_date", ["when will I get possession"], "project_team", "normal", "within 1 business day", "Say possession dates are confirmed only by the project team in writing."),
    ("discount_or_negotiation_request", ["best price", "any discount"], "sales_manager", "normal", "within 1 business day", "Explain the AI cannot negotiate; offer a callback from the sales manager."),
    ("final_cost_or_taxes", ["final price including GST", "registration charges"], "sales_executive", "normal", "within 1 business day", "Offer an approved cost sheet from the sales team."),
    ("complaint_or_negative_sentiment", ["very unhappy", "complaint"], "customer_care_lead", "high", "within 4 business hours", "Acknowledge, apologise for the experience, log the complaint, escalate."),
    ("loan_approval_or_eligibility", ["will my loan be approved"], "sales_executive", "normal", "within 1 business day", "Explain approval is decided only by the lender."),
    ("information_not_in_knowledge_base", ["unsupported question"], "sales_executive", "low", "within 1 business day", "Say verified information is not available; offer a follow-up."),
    ("data_privacy_request", ["delete my data", "stop calling me"], "data_protection_contact", "high", "within 2 business days", "Confirm the request is recorded; stop marketing contact."),
    ("booking_cancellation_or_refund", ["cancel my booking", "refund"], "crm_and_accounts", "high", "within 1 business day", "Explain terms follow the signed agreement; escalate."),
  ], start=1)]}

files["lead_scoring_rules.json"] = {**env(7, 1, retrievable=False, approval="APPROVED"),
  "note": "Deterministic application configuration mirrored from backend/src/services/leadScoring.js and tenant settings. Not an LLM instruction.",
  "weights": {"budget": 25, "requirements": 25, "timeline": 20, "authority": 15, "appointment": 15},
  "thresholds": {"hot": 75, "warm": 50},
  "factor_rules": {
    "budget": [{"condition": "budget >= lowest price of the stated configuration", "fraction": 1.0}, {"condition": "up to 10% below", "fraction": 0.7}, {"condition": "10-20% below", "fraction": 0.4}, {"condition": "more than 20% below", "fraction": 0.15}, {"condition": "not stated", "fraction": 0}],
    "requirements": {"subweights_of_25": {"bedrooms": 9, "location": 8, "purpose": 4, "preferences": 4}},
    "timeline": [{"condition": "<= 1 month", "fraction": 1.0}, {"condition": "<= 3 months", "fraction": 0.7}, {"condition": "<= 6 months", "fraction": 0.4}, {"condition": "> 6 months", "fraction": 0.15}, {"condition": "unknown", "fraction": 0}],
    "authority": {"self": 1.0, "joint": 0.67, "other": 0.33, "unknown": 0},
    "appointment": {"visit_booked": 1.0, "visit_requested": 0.8, "none": 0}},
  "rules": ["Unknown information scores 0.", "Points require evidence from customer-stated facts or system records.", "Price comparisons use pricing_catalog.json."]}

files["data_authority_registry.json"] = {**env(8, 1, retrievable=False, approval="APPROVED"),
  "hierarchy": [
    {"rank": 1, "source": "live_inventory_database", "governs": "current unit availability", "status": NC, "note": "No unit-inventory table exists in the current app; never answer availability from documents."},
    {"rank": 1, "source": "live_appointment_service", "governs": "available site-visit slots and bookings", "status": "ACTIVE", "endpoint": "GET /api/appointments/availability"},
    {"rank": 2, "source": "config/pricing_catalog.json", "governs": "price lookup"},
    {"rank": 2, "source": "config/sales_policy.json", "governs": "business commitments, booking rules, discount authority"},
    {"rank": 2, "source": "config/escalation_matrix.json", "governs": "escalation routes"},
    {"rank": 2, "source": "config/lead_scoring_rules.json", "governs": "lead score (deterministic)"},
    {"rank": 3, "source": "config/company_facts.json, config/project_catalog.json, config/amenity_catalog.json", "governs": "company, project, unit and amenity facts"},
    {"rank": 4, "source": "Markdown knowledge documents (authority_level 2-3)", "governs": "explanations; approved policy text at level 2"},
    {"rank": 5, "source": "Sales guidance, dialogues and examples (authority_level 4)", "governs": "tone and handling only; never facts"},
  ],
  "conflict_rule": "If two sources of the same rank disagree, or a lower-rank source disagrees with a higher one, do not choose a value: flag the conflict, answer with the higher-ranked value only if it is CANONICAL, otherwise escalate for human review.",
  "unknown_markers": [NP, NC, RH],
  "synthetic_marker": S}

os.makedirs("config", exist_ok=True)
for name, data in files.items():
    with open(f"config/{name}", "w") as f: json.dump(data, f, indent=2, ensure_ascii=False); f.write("\n")
print("wrote", len(files), "config files")
