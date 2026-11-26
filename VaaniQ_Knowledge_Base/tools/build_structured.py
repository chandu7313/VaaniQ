"""Generates structured_data/unit_inventory_seed.csv: a SYNTHETIC database-import seed (not RAG content).
Mix per tower follows config/project_catalog.json: 66 2BHK + 66 3BHK over 18 floors
(floors 1-12: 4+4 units; floors 13-18: 3+3 units)."""
import csv, os
OUT = os.path.join(os.path.dirname(__file__), "..", "structured_data", "unit_inventory_seed.csv")
rows = []
for tower in ("A", "B"):
    for floor in range(1, 19):
        per = 4 if floor <= 12 else 3
        for i in range(per * 2):
            cfg = "2BHK" if i % 2 == 0 else "3BHK"
            rows.append(dict(
                unit_id=f"GHR-{tower}-{floor:02d}{i+1:02d}", tenant_slug="abc-developers", tower=f"Tower {tower}",
                floor=floor, unit_number=f"{floor}{i+1:02d}", configuration=cfg,
                built_up_area_sqft=1180 if cfg == "2BHK" else 1560, carpet_area_sqft="",
                facing="East" if (i // 2) % 2 == 0 else "North", covered_parking_slots=1 if cfg == "2BHK" else 2,
                base_price_inr="", inventory_status="available",
                field_status="built_up=CANONICAL; carpet=NOT_PROVIDED; facing,parking,numbering,status=SYNTHETIC_DEMO_ASSUMPTION; base_price=REQUIRES_HUMAN_CONFIRMATION",
            ))
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
from collections import Counter
print(len(rows), Counter((r["tower"], r["configuration"]) for r in rows))
