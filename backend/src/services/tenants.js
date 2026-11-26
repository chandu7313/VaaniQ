import { query } from '../db/pool.js';
import { config } from '../config.js';
import { notFound } from '../lib/errors.js';

// Tenant settings change rarely but are read on every agent turn; a short in-process cache saves a
// database round trip per turn (significant when the database is far away). 30 s staleness is acceptable.
const TENANT_TTL_MS = 30_000;
const tenantCache = new Map();

export async function getTenant(tenantId) {
  const hit = tenantCache.get(tenantId);
  if (hit && Date.now() - hit.at < TENANT_TTL_MS) return hit.row;
  const { rows } = await query('SELECT id, name, slug, settings, is_demo FROM tenants WHERE id = $1', [tenantId]);
  if (!rows[0]) throw notFound('Tenant');
  tenantCache.set(tenantId, { row: rows[0], at: Date.now() });
  return rows[0];
}

export const invalidateTenant = (tenantId) => tenantCache.delete(tenantId);

/**
 * Resolves a public customer experience workspace strictly from a configured allow-listed slug.
 * Never trusts client-supplied tenant IDs.
 */
export async function getPublicTenantBySlug(slug) {
  if (!slug || !config.publicTenantSlugs.includes(slug)) throw notFound('Workspace');
  const { rows } = await query('SELECT id, name, slug, settings, is_demo FROM tenants WHERE slug = $1', [slug]);
  if (!rows[0]) throw notFound('Workspace');
  return rows[0];
}
