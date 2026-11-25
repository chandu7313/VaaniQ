import { query } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

export async function getTenant(tenantId) {
  const { rows } = await query('SELECT id, name, slug, settings, is_demo FROM tenants WHERE id = $1', [tenantId]);
  if (!rows[0]) throw notFound('Tenant');
  return rows[0];
}
