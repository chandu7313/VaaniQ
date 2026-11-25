import { query } from '../db/pool.js';
import { config } from '../config.js';
import { notFound } from '../lib/errors.js';

export async function getTenant(tenantId) {
  const { rows } = await query('SELECT id, name, slug, settings, is_demo FROM tenants WHERE id = $1', [tenantId]);
  if (!rows[0]) throw notFound('Tenant');
  return rows[0];
}

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
