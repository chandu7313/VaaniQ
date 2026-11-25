import { query } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

export async function listTraces(tenantId, { conversationId, limit = 50 } = {}) {
  const params = [tenantId, limit];
  if (conversationId) params.push(conversationId);
  const { rows } = await query(
    `SELECT id, conversation_id, turn_index, intent, outcome, provider, latency_ms, created_at,
            jsonb_array_length(trace->'steps') AS step_count, trace->'scoring'->>'total' AS score
       FROM agent_execution_logs WHERE tenant_id = $1 ${conversationId ? 'AND conversation_id = $3' : ''}
      ORDER BY created_at DESC LIMIT $2`,
    params,
  );
  return rows;
}

export async function getTrace(tenantId, id) {
  const { rows } = await query('SELECT * FROM agent_execution_logs WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
  if (!rows[0]) throw notFound('Trace');
  return rows[0];
}

export async function listConversationTraces(tenantId, conversationId) {
  const { rows } = await query(
    `SELECT id, turn_index, intent, outcome, provider, latency_ms, trace, created_at FROM agent_execution_logs
      WHERE tenant_id = $1 AND conversation_id = $2 ORDER BY turn_index`,
    [tenantId, conversationId],
  );
  return rows;
}
