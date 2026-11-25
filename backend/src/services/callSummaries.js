import { query } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

const COLS = 's.id, s.conversation_id, s.lead_id, s.summary, s.created_at, l.full_name, l.is_demo';

export async function listCallSummaries(tenantId, { leadId } = {}) {
  const params = [tenantId];
  if (leadId) params.push(leadId);
  const { rows } = await query(
    `SELECT ${COLS} FROM call_summaries s LEFT JOIN leads l ON l.id = s.lead_id
      WHERE s.tenant_id = $1 ${leadId ? 'AND s.lead_id = $2' : ''} ORDER BY s.created_at DESC LIMIT 200`,
    params,
  );
  return rows;
}

export async function getCallSummary(tenantId, id) {
  const { rows } = await query(`SELECT ${COLS} FROM call_summaries s LEFT JOIN leads l ON l.id = s.lead_id WHERE s.tenant_id = $1 AND s.id = $2`, [tenantId, id]);
  if (!rows[0]) throw notFound('Call summary');
  return rows[0];
}

/** Staff can add follow-up notes; generated fields are not editable (they are re-generated instead). */
export async function updateCallSummaryNotes(tenantId, id, { staffNotes, followUpDone }) {
  const patch = { ...(staffNotes !== undefined ? { staffNotes } : {}), ...(followUpDone !== undefined ? { followUpDone } : {}) };
  const { rows } = await query(
    `UPDATE call_summaries SET summary = summary || $3::jsonb WHERE tenant_id = $1 AND id = $2 RETURNING id, conversation_id, lead_id, summary, created_at`,
    [tenantId, id, JSON.stringify(patch)],
  );
  if (!rows[0]) throw notFound('Call summary');
  return rows[0];
}

export async function deleteCallSummary(tenantId, id) {
  const { rowCount } = await query('DELETE FROM call_summaries WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
  if (!rowCount) throw notFound('Call summary');
}
