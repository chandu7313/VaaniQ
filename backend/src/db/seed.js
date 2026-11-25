import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool, query } from './pool.js';
import { hashPassword } from '../lib/password.js';
import { ingestDocument } from '../services/rag/knowledge.js';
import { demoDocuments, demoLeads, demoTenantSettings } from './seedData.js';
import { scoreLead } from '../services/leadScoring.js';

export const DEMO_ADMIN_EMAIL = 'admin@abcdevelopers.demo';

/** Idempotent: re-running does not duplicate the tenant, user, documents or leads. */
export async function seed({ adminPassword } = {}) {
  let password = adminPassword || process.env.SEED_ADMIN_PASSWORD;
  let generated = false;
  if (!password) { password = randomBytes(9).toString('base64url'); generated = true; }

  const t = await query(
    `INSERT INTO tenants (name, slug, settings, is_demo) VALUES ('ABC Developers (fictional demo)', 'abc-developers', $1, true)
     ON CONFLICT (slug) DO UPDATE SET settings = EXCLUDED.settings RETURNING id`,
    [demoTenantSettings],
  );
  const tenantId = t.rows[0].id;

  const u = await query('SELECT 1 FROM users WHERE email = $1', [DEMO_ADMIN_EMAIL]);
  if (!u.rowCount) {
    await query(`INSERT INTO users (tenant_id, email, password_hash, full_name, role) VALUES ($1,$2,$3,'Demo Admin','admin')`,
      [tenantId, DEMO_ADMIN_EMAIL, await hashPassword(password)]);
  } else generated = false;

  const existing = await query('SELECT title FROM knowledge_documents WHERE tenant_id = $1', [tenantId]);
  const have = new Set(existing.rows.map((r) => r.title));
  for (const d of demoDocuments) if (!have.has(d.title)) await ingestDocument(tenantId, { ...d, isDemo: true });

  for (const l of demoLeads) {
    const score = scoreLead(l.profile, { catalog: demoTenantSettings.catalog, scoring: demoTenantSettings.scoring });
    // Re-running refreshes a demo lead's profile and score (keeps them in sync with the model)
    // but never touches its status, which staff may have changed, or any non-demo lead.
    await query(
      `INSERT INTO leads (tenant_id, full_name, phone, status, score, score_breakdown, profile, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)
       ON CONFLICT (tenant_id, phone) WHERE phone IS NOT NULL
       DO UPDATE SET profile = EXCLUDED.profile, score = EXCLUDED.score, score_breakdown = EXCLUDED.score_breakdown, updated_at = now()
       WHERE leads.is_demo`,
      [tenantId, l.full_name, l.phone, l.status, score.total, score, l.profile],
    );
  }
  return { tenantId, generatedPassword: generated ? password : null };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then((r) => {
      console.log(`Seeded tenant ${r.tenantId}. Admin: ${DEMO_ADMIN_EMAIL}`);
      if (r.generatedPassword) console.log(`Generated admin password (shown once): ${r.generatedPassword}`);
      return pool.end();
    })
    .catch((e) => { console.error(e); process.exit(1); });
}
