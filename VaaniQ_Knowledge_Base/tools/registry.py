"""Single registry of every knowledge-base document: stable IDs and metadata.
Frontmatter in each Markdown file is generated from here (tools/add_frontmatter.py), so metadata stays consistent."""

TENANT = "abc-developers"
TODAY = "2026-11-26"

# (number, folder, filename stem, title, category, subcategory, authority_level, classification, supersedes)
# authority_level: 1 = structured config / live DB (never in this list), 2 = approved policy text,
#                  3 = explanatory reference, 4 = sales guidance / examples (never overrides 2-3).
_D = [
 (1, "company", "company_identity_and_profile", "Company Identity and Profile", "company", "identity", 3, "public", ["seed:ABC Developers - Company Profile"]),
 (2, "company", "company_history_and_business_model", "Company History and Business Model", "company", "history", 3, "public", []),
 (3, "company", "management_and_department_structure", "Management and Department Structure", "company", "organisation", 3, "internal", []),
 (4, "company", "sales_team_roles_and_responsibilities", "Sales Team Roles and Responsibilities", "company", "sales_team", 3, "internal", []),
 (5, "company", "customer_service_standards", "Customer Service Standards", "company", "service_standards", 2, "public", []),
 (6, "company", "sales_channels_and_communication", "Sales Channels and Communication", "company", "channels", 3, "public", []),
 (7, "project", "project_master_overview", "Project Master Overview", "project", "overview", 3, "public", ["seed:GreenHaven Residences - Project Overview"]),
 (8, "project", "project_location_and_connectivity", "Project Location and Connectivity", "project", "location", 3, "public", ["seed:GreenHaven Residences - Location and Connectivity", "seed:GreenHaven Residences - Neighbourhood Guide"]),
 (9, "project", "project_master_plan_and_tower_details", "Project Master Plan and Tower Details", "project", "master_plan", 3, "public", ["seed:GreenHaven Residences - Inventory and Availability"]),
 (10, "project", "construction_process_and_quality_standards", "Construction Process and Quality Standards", "project", "construction", 3, "public", []),
 (11, "project", "building_specifications_and_materials", "Building Specifications and Materials", "project", "specifications", 3, "public", ["seed:GreenHaven Residences - Specifications and Finishes"]),
 (12, "project", "sustainability_and_environment", "Sustainability and Environment", "project", "sustainability", 3, "public", ["seed:GreenHaven Residences - Green and Safety Features"]),
 (13, "project", "utilities_and_infrastructure", "Utilities and Infrastructure", "project", "utilities", 3, "public", []),
 (14, "project", "security_and_safety_facilities", "Security and Safety Facilities", "project", "security", 3, "public", []),
 (15, "apartments", "2bhk_detailed_specifications", "2BHK Detailed Specifications", "apartments", "2bhk", 3, "public", []),
 (16, "apartments", "3bhk_detailed_specifications", "3BHK Detailed Specifications", "apartments", "3bhk", 3, "public", []),
 (17, "apartments", "floor_plan_and_room_dimensions", "Floor Plan and Room Dimensions", "apartments", "floor_plans", 3, "public", ["seed:GreenHaven Residences - Floor Plans and Carpet Areas"]),
 (18, "apartments", "area_measurement_guide", "Area Measurement Guide", "apartments", "area_definitions", 3, "public", []),
 (19, "apartments", "parking_and_vehicle_facilities", "Parking and Vehicle Facilities", "apartments", "parking", 3, "public", []),
 (20, "apartments", "apartment_customization_policy", "Apartment Customization Policy", "apartments", "customization", 2, "public", []),
 (21, "amenities", "clubhouse_and_recreation", "Clubhouse and Recreation", "amenities", "clubhouse", 3, "public", ["seed:GreenHaven Residences - Amenities"]),
 (22, "amenities", "fitness_and_wellness_facilities", "Fitness and Wellness Facilities", "amenities", "fitness", 3, "public", []),
 (23, "amenities", "outdoor_and_landscape_facilities", "Outdoor and Landscape Facilities", "amenities", "outdoor", 3, "public", []),
 (24, "amenities", "children_and_family_facilities", "Children and Family Facilities", "amenities", "family", 3, "public", []),
 (25, "amenities", "community_and_lifestyle", "Community and Lifestyle", "amenities", "community", 3, "public", []),
 (26, "amenities", "maintenance_and_facility_management", "Maintenance and Facility Management", "amenities", "facility_management", 2, "public", []),
 (27, "commercial", "master_pricing_policy", "Master Pricing Policy", "commercial", "pricing_policy", 2, "public", ["seed:GreenHaven Residences - Pricing and Payment Plans"]),
 (28, "commercial", "2bhk_pricing_details", "2BHK Pricing Details", "commercial", "pricing_2bhk", 2, "public", []),
 (29, "commercial", "3bhk_pricing_details", "3BHK Pricing Details", "commercial", "pricing_3bhk", 2, "public", []),
 (30, "commercial", "payment_schedule_and_milestones", "Payment Schedule and Milestones", "commercial", "payment_schedule", 2, "public", ["seed:GreenHaven Residences - Construction-Linked Payment Schedule"]),
 (31, "commercial", "booking_and_token_amount_policy", "Booking and Token Amount Policy", "commercial", "booking_policy", 2, "public", ["seed:ABC Developers - Sales and Booking Policies"]),
 (32, "commercial", "additional_charges_and_cost_sheet", "Additional Charges and Cost Sheet", "commercial", "charges", 2, "public", []),
 (33, "commercial", "home_loan_and_financing_process", "Home Loan and Financing Process", "commercial", "financing", 3, "public", ["seed:ABC Developers - Home Loans and EMI Guide"]),
 (34, "commercial", "banking_partner_information", "Banking Partner Information", "commercial", "banking_partners", 2, "public", []),
 (35, "commercial", "discount_and_negotiation_authority", "Discount and Negotiation Authority", "commercial", "discount_authority", 2, "internal", []),
 (36, "commercial", "special_offers_and_promotions", "Special Offers and Promotions", "commercial", "offers", 2, "public", []),
 (37, "commercial", "cancellation_and_refund_policy", "Cancellation and Refund Policy", "commercial", "cancellation", 2, "public", []),
 (38, "legal", "project_registration_and_rera_information", "Project Registration and RERA Information", "legal", "rera", 2, "public", ["seed:GreenHaven Residences - Possession, RERA and Legal"]),
 (39, "legal", "project_approvals_and_compliance", "Project Approvals and Compliance", "legal", "approvals", 2, "public", []),
 (40, "legal", "sale_agreement_and_documentation", "Sale Agreement and Documentation", "legal", "agreements", 2, "public", []),
 (41, "legal", "customer_rights_and_disclosures", "Customer Rights and Disclosures", "legal", "customer_rights", 2, "public", []),
 (42, "legal", "data_privacy_and_customer_consent", "Data Privacy and Customer Consent", "legal", "privacy", 2, "public", []),
 (43, "legal", "legal_escalation_policy", "Legal Escalation Policy", "legal", "legal_escalation", 2, "internal", []),
 (44, "sales_operations", "customer_enquiry_workflow", "Customer Enquiry Workflow", "sales_operations", "enquiry_workflow", 3, "internal", []),
 (45, "sales_operations", "lead_qualification_process", "Lead Qualification Process", "sales_operations", "lead_qualification", 3, "internal", []),
 (46, "sales_operations", "sales_pipeline_and_lead_stages", "Sales Pipeline and Lead Stages", "sales_operations", "pipeline", 3, "internal", []),
 (47, "sales_operations", "customer_followup_policy", "Customer Follow-up Policy", "sales_operations", "followup", 2, "internal", []),
 (48, "sales_operations", "site_visit_and_appointment_procedure", "Site Visit and Appointment Procedure", "sales_operations", "site_visits", 2, "public", ["seed:ABC Developers - Site Visit Policy and FAQs"]),
 (49, "sales_operations", "sales_objection_handling", "Sales Objection Handling", "sales_operations", "objections", 4, "internal", []),
 (50, "sales_operations", "human_escalation_matrix", "Human Escalation Matrix", "sales_operations", "escalation", 2, "internal", []),
 (51, "sales_operations", "call_scenarios_and_sales_dialogues", "Call Scenarios and Sales Dialogues", "sales_operations", "dialogues", 4, "internal", []),
 (52, "sales_operations", "sales_service_level_guidelines", "Sales Service Level Guidelines", "sales_operations", "sla", 2, "internal", []),
 (53, "customer_support", "master_faq", "Master FAQ", "customer_support", "faq_master", 3, "public", ["seed:GreenHaven Residences - Frequently Asked Questions"]),
 (54, "customer_support", "location_faq", "Location FAQ", "customer_support", "faq_location", 3, "public", []),
 (55, "customer_support", "pricing_faq", "Pricing FAQ", "customer_support", "faq_pricing", 3, "public", []),
 (56, "customer_support", "apartment_configuration_faq", "Apartment Configuration FAQ", "customer_support", "faq_configuration", 3, "public", []),
 (57, "customer_support", "amenities_faq", "Amenities FAQ", "customer_support", "faq_amenities", 3, "public", []),
 (58, "customer_support", "booking_faq", "Booking FAQ", "customer_support", "faq_booking", 3, "public", []),
 (59, "customer_support", "financing_faq", "Financing FAQ", "customer_support", "faq_financing", 3, "public", []),
 (60, "customer_support", "customer_objection_library", "Customer Objection Library", "customer_support", "objection_library", 4, "internal", []),
 (61, "customer_support", "multilingual_sales_glossary", "Multilingual Sales Glossary", "customer_support", "glossary", 3, "public", []),
 (62, "customer_support", "telugu_customer_conversation_examples", "Telugu Customer Conversation Examples", "customer_support", "examples_te", 4, "internal", []),
 (63, "customer_support", "hindi_customer_conversation_examples", "Hindi Customer Conversation Examples", "customer_support", "examples_hi", 4, "internal", []),
 (64, "post_sales", "booking_confirmation_procedure", "Booking Confirmation Procedure", "post_sales", "booking_confirmation", 2, "internal", []),
 (65, "post_sales", "customer_document_checklist", "Customer Document Checklist", "post_sales", "documents", 3, "public", ["seed:ABC Developers - NRI Buyer Guide"]),
 (66, "post_sales", "construction_update_communication", "Construction Update Communication", "post_sales", "construction_updates", 2, "public", []),
 (67, "post_sales", "property_handover_procedure", "Property Handover Procedure", "post_sales", "handover", 2, "public", []),
 (68, "post_sales", "maintenance_and_after_sales_support", "Maintenance and After-Sales Support", "post_sales", "after_sales", 2, "public", ["seed:ABC Developers - Maintenance, Society and After-Sales"]),
 (69, "post_sales", "customer_complaint_resolution", "Customer Complaint Resolution", "post_sales", "complaints", 2, "public", []),
]

LANG = {61: "en,hi,te", 62: "te,en", 63: "hi,en"}

def docs():
    out = []
    for n, folder, stem, title, cat, sub, auth, cls, sup in _D:
        out.append(dict(
            number=n, path=f"{folder}/{n:02d}_{stem}.md", doc_id=f"ABC-GHR-KB-{n:02d}", document_title=title,
            category=cat, subcategory=sub, authority_level=auth, data_classification=cls,
            language=LANG.get(n, "en"), supersedes=sup,
            retrieval_scope="customer_facing" if cls == "public" else "agent_internal",
        ))
    return out
