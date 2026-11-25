import { query, withTransaction } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

const LEAD_COLS = 'id, full_name, phone, email, status, profile, score, score_breakdown, is_demo, created_at, updated_at';

export async function createLead(tenantId, { isDemo = true } = {}) {
  // Leads created by the demo agent are marked demo: every customer in this prototype is a role-play.
  const { rows } = await query(`INSERT INTO leads (tenant_id, is_demo) VALUES ($1,$2) RETURNING ${LEAD_COLS}`, [tenantId, isDemo]);
  return rows[0];
}

export async function getLead(tenantId, leadId, db = { query }) {
  const { rows } = await db.query(`SELECT ${LEAD_COLS} FROM leads WHERE tenant_id=$1 AND id=$2`, [tenantId, leadId]);
  if (!rows[0]) throw notFound('Lead');
  return rows[0];
}

export async function listLeads(tenantId, { status, search, limit = 100 } = {}) {
  const params = [tenantId];
  let where = 'tenant_id = $1';
  if (status) { params.push(status); where += ` AND status = $${params.length}`; }
  if (search) { params.push(`%${search}%`); where += ` AND (full_name ILIKE $${params.length} OR phone ILIKE $${params.length})`; }
  params.push(limit);
  const { rows } = await query(`SELECT ${LEAD_COLS} FROM leads WHERE ${where} ORDER BY updated_at DESC LIMIT $${params.length}`, params);
  return rows;
}

export async function getLeadDetail(tenantId, leadId) {
  const lead = await getLead(tenantId, leadId);
  const [convs, appts, summaries] = await Promise.all([
    query(`SELECT id, language, channel, status, started_at, ended_at FROM conversations WHERE tenant_id=$1 AND lead_id=$2 ORDER BY started_at DESC`, [tenantId, leadId]),
    query(`SELECT id, starts_at, ends_at, status, notes FROM appointments WHERE tenant_id=$1 AND lead_id=$2 ORDER BY starts_at DESC`, [tenantId, leadId]),
    query(`SELECT conversation_id, summary, created_at FROM call_summaries WHERE tenant_id=$1 AND lead_id=$2 ORDER BY created_at DESC`, [tenantId, leadId]),
  ]);
  return { ...lead, conversations: convs.rows, appointments: appts.rows, summaries: summaries.rows };
}

/**
 * Merges newly stated facts into the lead. Never overwrites a known value with an empty one.
 * If the phone number belongs to an existing lead, this conversation is folded into that lead
 * (repeat caller) and the temporary lead is removed. Returns { lead, mergedFrom }.
 */
export async function upsertLeadFacts(tenantId, leadId, { profile = {}, fullName, phone, email }) {
  return withTransaction(async (c) => {
    let current = await getLead(tenantId, leadId, c);
    let mergedFrom = null;
    if (phone && phone !== current.phone) {
      const { rows } = await c.query('SELECT id FROM leads WHERE tenant_id=$1 AND phone=$2 AND id<>$3 FOR UPDATE', [tenantId, phone, leadId]);
      if (rows[0]) {
        const target = rows[0].id;
        await c.query('UPDATE conversations SET lead_id=$1 WHERE tenant_id=$2 AND lead_id=$3', [target, tenantId, leadId]);
        await c.query('UPDATE appointments SET lead_id=$1 WHERE tenant_id=$2 AND lead_id=$3', [target, tenantId, leadId]);
        const existing = await getLead(tenantId, target, c);
        // Facts from the live conversation are newer than stored ones, so they win.
        profile = { ...existing.profile, ...current.profile, ...profile };
        fullName = fullName || current.full_name || existing.full_name;
        email = email || current.email || existing.email;
        await c.query('DELETE FROM leads WHERE tenant_id=$1 AND id=$2', [tenantId, leadId]);
        mergedFrom = leadId;
        current = existing;
      }
    }
    const mergedProfile = { ...current.profile, ...profile };
    if (profile.preferences && current.profile.preferences) {
      mergedProfile.preferences = [...new Set([...current.profile.preferences, ...profile.preferences])];
    }
    const { rows } = await c.query(
      `UPDATE leads SET profile=$3, full_name=COALESCE($4, full_name), phone=COALESCE($5, phone), email=COALESCE($6, email),
              status = CASE WHEN status='new' THEN 'contacted' ELSE status END, updated_at=now()
        WHERE tenant_id=$1 AND id=$2 RETURNING ${LEAD_COLS}`,
      [tenantId, current.id, mergedProfile, fullName ?? null, phone ?? null, email ?? null],
    );
    return { lead: rows[0], mergedFrom };
  });
}

/** Persists the computed score and applies status rules (never downgrades a booked/lost lead). */
export async function saveScore(tenantId, leadId, score, { warm = 50 } = {}) {
  const { rows } = await query(
    `UPDATE leads SET score=$3::int, score_breakdown=$4,
            status = CASE WHEN status IN ('new','contacted') AND $3::int >= $5::int THEN 'qualified' ELSE status END,
            updated_at=now()
      WHERE tenant_id=$1 AND id=$2 RETURNING ${LEAD_COLS}`,
    [tenantId, leadId, score.total, score, warm],
  );
  return rows[0];
}

const STATUSES = ['new', 'contacted', 'qualified', 'visit_scheduled', 'nurture', 'lost'];
export async function updateLead(tenantId, leadId, { status, fullName, email }) {
  if (status && !STATUSES.includes(status)) throw new Error('invalid status');
  const { rows } = await query(
    `UPDATE leads SET status=COALESCE($3,status), full_name=COALESCE($4,full_name), email=COALESCE($5,email), updated_at=now()
      WHERE tenant_id=$1 AND id=$2 RETURNING ${LEAD_COLS}`,
    [tenantId, leadId, status ?? null, fullName ?? null, email ?? null],
  );
  if (!rows[0]) throw notFound('Lead');
  return rows[0];
}

export async function findLeadByPhone(tenantId, phone) {
  const { rows } = await query(`SELECT ${LEAD_COLS} FROM leads WHERE tenant_id=$1 AND phone=$2`, [tenantId, phone]);
  return rows[0] ?? null;
}

/** Deletes a lead; its appointments cascade, its conversations keep history with lead_id = NULL. */
export async function deleteLead(tenantId, leadId) {
  const { rowCount } = await query('DELETE FROM leads WHERE tenant_id=$1 AND id=$2', [tenantId, leadId]);
  if (!rowCount) throw notFound('Lead');
}
