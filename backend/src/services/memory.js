import { query } from '../db/pool.js';
import { notFound } from '../lib/errors.js';

// Conversation memory has two layers:
//  - short-term: the last HISTORY_WINDOW messages (verbatim) for the LLM prompt;
//  - structured: the lead profile + conversation.state (pending proposal, offered slots),
//    which persist across turns and conversations regardless of window size.
export const HISTORY_WINDOW = 12;

export async function startConversation(tenantId, { leadId, language = 'en', channel = 'voice' }) {
  const { rows } = await query(
    `INSERT INTO conversations (tenant_id, lead_id, language, channel) VALUES ($1,$2,$3,$4)
     RETURNING id, lead_id, language, channel, status, state, started_at`,
    [tenantId, leadId, language, channel],
  );
  return rows[0];
}

export async function loadSession(tenantId, conversationId) {
  const { rows } = await query(
    `SELECT id, lead_id, language, channel, status, state, started_at, ended_at FROM conversations WHERE tenant_id=$1 AND id=$2`,
    [tenantId, conversationId],
  );
  if (!rows[0]) throw notFound('Conversation');
  const history = await query(
    `SELECT role, content, sentiment, sentiment_confidence, created_at FROM (
       SELECT role, content, sentiment, sentiment_confidence, created_at FROM messages
        WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY created_at DESC LIMIT $3) h ORDER BY created_at ASC`,
    [tenantId, conversationId, HISTORY_WINDOW],
  );
  return { conversation: rows[0], history: history.rows };
}

export async function addMessage(tenantId, conversationId, { role, content, sentiment, sources }) {
  const { rows } = await query(
    `INSERT INTO messages (tenant_id, conversation_id, role, content, sentiment, sentiment_confidence, sentiment_evidence, sources)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, role, content, sentiment, sentiment_confidence, sentiment_evidence, sources, created_at`,
    [tenantId, conversationId, role, content, sentiment?.label ?? null, sentiment?.confidence ?? null,
      sentiment ? JSON.stringify(sentiment.evidence) : null, sources ? JSON.stringify(sources) : null],
  );
  return rows[0];
}

export async function saveConversation(tenantId, conversationId, { state, leadId, status, escalationReason, language }) {
  await query(
    `UPDATE conversations SET state=COALESCE($3,state), lead_id=COALESCE($4,lead_id), status=COALESCE($5::text,status),
            escalation_reason=COALESCE($6,escalation_reason), language=COALESCE($7,language),
            ended_at = CASE WHEN $5::text = 'ended' THEN now() ELSE ended_at END
      WHERE tenant_id=$1 AND id=$2`,
    [tenantId, conversationId, state ?? null, leadId ?? null, status ?? null, escalationReason ?? null, language ?? null],
  );
}

export async function listConversations(tenantId, { limit = 100 } = {}) {
  const { rows } = await query(
    `SELECT c.id, c.language, c.channel, c.status, c.started_at, c.ended_at, c.escalation_reason,
            l.id AS lead_id, l.full_name, l.score, l.is_demo,
            (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id) AS message_count,
            (SELECT content FROM messages m WHERE m.conversation_id = c.id AND m.role='customer' ORDER BY created_at LIMIT 1) AS first_message,
            EXISTS (SELECT 1 FROM call_summaries s WHERE s.conversation_id = c.id) AS has_summary
       FROM conversations c LEFT JOIN leads l ON l.id = c.lead_id
      WHERE c.tenant_id = $1 ORDER BY c.started_at DESC LIMIT $2`,
    [tenantId, limit],
  );
  return rows;
}

export async function getConversationDetail(tenantId, conversationId) {
  const { conversation } = await loadSession(tenantId, conversationId);
  const [messages, summary, lead] = await Promise.all([
    query(`SELECT id, role, content, sentiment, sentiment_confidence, sentiment_evidence, sources, created_at FROM messages
            WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY created_at`, [tenantId, conversationId]),
    query('SELECT summary, created_at FROM call_summaries WHERE tenant_id=$1 AND conversation_id=$2', [tenantId, conversationId]),
    conversation.lead_id ? query('SELECT id, full_name, phone, status, score, score_breakdown, profile, is_demo FROM leads WHERE tenant_id=$1 AND id=$2', [tenantId, conversation.lead_id]) : { rows: [] },
  ]);
  return { ...conversation, messages: messages.rows, summary: summary.rows[0] ?? null, lead: lead.rows[0] ?? null };
}

/** Deletes a conversation and, by cascade, its messages, summary and turn traces. */
export async function deleteConversation(tenantId, conversationId) {
  const { rowCount } = await query('DELETE FROM conversations WHERE tenant_id=$1 AND id=$2', [tenantId, conversationId]);
  if (!rowCount) throw notFound('Conversation');
}
