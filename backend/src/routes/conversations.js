import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { createLead } from '../services/crm.js';
import { startConversation, addMessage, listConversations, getConversationDetail } from '../services/memory.js';
import { handleTurn } from '../services/agent/orchestrator.js';
import { t } from '../services/agent/templates.js';
import { generateCallSummary } from '../services/summary.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();
const lang = z.enum(['en', 'hi', 'te']);
const idParams = z.object({ id: z.string().uuid() });
const agentLimiter = rateLimit({ windowMs: 60 * 1000, limit: config.agentRateLimitMax, standardHeaders: 'draft-7', legacyHeaders: false });

r.get('/', ah(async (req, res) => res.json({ data: await listConversations(req.user.tenantId) })));

r.post('/', validate({ body: z.object({ language: lang.default('en'), channel: z.enum(['voice', 'text']).default('voice') }) }), ah(async (req, res) => {
  const { tenantId } = req.user;
  const lead = await createLead(tenantId);
  const conv = await startConversation(tenantId, { leadId: lead.id, ...req.valid.body });
  const greeting = await addMessage(tenantId, conv.id, { role: 'agent', content: t(conv.language, 'greeting') });
  res.status(201).json({ data: { conversation: conv, greeting, leadId: lead.id } });
}));

r.get('/:id', validate({ params: idParams }), ah(async (req, res) => res.json({ data: await getConversationDetail(req.user.tenantId, req.valid.params.id) })));

r.post('/:id/messages', agentLimiter, validate({ params: idParams, body: z.object({ text: z.string().trim().min(1).max(1000), language: lang.optional() }) }), ah(async (req, res) => {
  const result = await handleTurn({ tenantId: req.user.tenantId, conversationId: req.valid.params.id, ...req.valid.body });
  res.json({ data: result });
}));

r.post('/:id/end', validate({ params: idParams }), ah(async (req, res) => {
  res.json({ data: await generateCallSummary(req.user.tenantId, req.valid.params.id) });
}));

r.get('/:id/traces', validate({ params: idParams }), ah(async (req, res) => {
  const { rows } = await query(
    `SELECT id, turn_index, intent, outcome, provider, latency_ms, trace, created_at FROM agent_execution_logs
      WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY turn_index`, [req.user.tenantId, req.valid.params.id]);
  res.json({ data: rows });
}));

export default r;
