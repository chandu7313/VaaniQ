import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { config } from '../config.js';
import { getProvider } from '../services/llm/index.js';
import { listTools } from '../services/tools/registry.js';
import '../services/tools/index.js';
import { getOverview } from '../services/analytics.js';
import { getTenant } from '../services/tenants.js';
import { notFound } from '../lib/errors.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';

const r = Router();

r.get('/meta', ah(async (req, res) => {
  const tenant = await getTenant(req.user.tenantId);
  const p = getProvider();
  res.json({ data: { demoMode: p.isDemo, provider: p.name, configuredProvider: config.llm.provider, languages: ['en', 'hi', 'te'], tenant: { name: tenant.name, isDemo: tenant.is_demo, catalog: tenant.settings.catalog, scoring: tenant.settings.scoring, booking: tenant.settings.booking }, tools: listTools() } });
}));

r.get('/analytics/overview', ah(async (req, res) => res.json({ data: await getOverview(req.user.tenantId) })));

r.get('/traces', validate({ query: z.object({ conversationId: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }) }), ah(async (req, res) => {
  const { conversationId, limit } = req.valid.query;
  const params = [req.user.tenantId, limit];
  if (conversationId) params.push(conversationId);
  const { rows } = await query(
    `SELECT id, conversation_id, turn_index, intent, outcome, provider, latency_ms, created_at,
            jsonb_array_length(trace->'steps') AS step_count, trace->'scoring'->>'total' AS score
       FROM agent_execution_logs WHERE tenant_id=$1 ${conversationId ? 'AND conversation_id=$3' : ''}
      ORDER BY created_at DESC LIMIT $2`, params);
  res.json({ data: rows });
}));

r.get('/traces/:id', validate({ params: z.object({ id: z.string().uuid() }) }), ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM agent_execution_logs WHERE tenant_id=$1 AND id=$2', [req.user.tenantId, req.valid.params.id]);
  if (!rows[0]) throw notFound('Trace');
  res.json({ data: rows[0] });
}));

export default r;
