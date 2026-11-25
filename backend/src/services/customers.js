import { query } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

// A "customer" is a lead whose identity is known (name + phone). Customers are a VIEW over leads,
// not a second table, so one person never exists as two records that drift apart.
const COLS = `l.id, l.full_name, l.phone, l.email, l.status, l.score, l.profile, l.is_demo, l.created_at, l.updated_at,
  (SELECT COUNT(*)::int FROM conversations c WHERE c.lead_id = l.id) AS conversation_count,
  (SELECT COUNT(*)::int FROM appointments a WHERE a.lead_id = l.id) AS appointment_count,
  (SELECT MIN(a.starts_at) FROM appointments a WHERE a.lead_id = l.id AND a.status = 'confirmed' AND a.starts_at > now()) AS next_visit`;

export async function listCustomers(tenantId, { search } = {}) {
  const params = [tenantId];
  let where = 'l.tenant_id = $1 AND l.full_name IS NOT NULL AND l.phone IS NOT NULL';
  if (search) { params.push(`%${search}%`); where += ` AND (l.full_name ILIKE $2 OR l.phone ILIKE $2)`; }
  const { rows } = await query(`SELECT ${COLS} FROM leads l WHERE ${where} ORDER BY l.updated_at DESC LIMIT 200`, params);
  return rows;
}

export async function getCustomer(tenantId, id) {
  const { rows } = await query(`SELECT ${COLS} FROM leads l WHERE l.tenant_id = $1 AND l.id = $2 AND l.full_name IS NOT NULL AND l.phone IS NOT NULL`, [tenantId, id]);
  if (!rows[0]) throw notFound('Customer');
  return rows[0];
}
