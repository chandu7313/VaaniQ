# Structured data (not RAG content)

| File | Purpose |
|---|---|
| `unit_inventory_seed.csv` | Synthetic seed of 264 units (Tower A and Tower B, 18 floors, 66 2BHK + 66 3BHK per tower) for a **future** inventory table. |
| `unit_inventory.schema.json` | JSON Schema for one row. |

Rules:
- **Never ingest these files into the knowledge index.** Availability is dynamic and must be read from the live database through a tool, not retrieved as text.
- The VaaniQ application currently has **no unit-inventory table** (`NOT_CONFIGURED`, reconciliation item R-16). Importing this seed requires a reviewed migration.
- `carpet_area_sqft` and `base_price_inr` are blank on purpose (`NOT_PROVIDED` / `REQUIRES_HUMAN_CONFIRMATION`). Carpet area must never be derived from built-up area.
- `inventory_status = available` is a synthetic starting value only.
- Appointments are never seeded here; they live in the `appointments` table.
