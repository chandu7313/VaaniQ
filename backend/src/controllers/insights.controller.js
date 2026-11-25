import { config } from '../config.js';
import { getProvider } from '../services/llm/index.js';
import { listTools } from '../services/tools/registry.js';
import '../services/tools/index.js';
import { getOverview } from '../services/analytics.js';
import { getTenant } from '../services/tenants.js';
import { listTraces, getTrace } from '../services/traces.js';

export async function meta(req, res) {
  const tenant = await getTenant(req.user.tenantId);
  const p = getProvider();
  res.json({
    data: {
      demoMode: p.isDemo, provider: p.name, configuredProvider: config.llm.provider, languages: ['en', 'hi', 'te'],
      tenant: { name: tenant.name, isDemo: tenant.is_demo, catalog: tenant.settings.catalog, scoring: tenant.settings.scoring, booking: tenant.settings.booking },
      tools: listTools(),
    },
  });
}

export const analyticsOverview = async (req, res) => res.json({ data: await getOverview(req.user.tenantId) });
export const traces = async (req, res) => res.json({ data: await listTraces(req.user.tenantId, req.valid.query) });
export const trace = async (req, res) => res.json({ data: await getTrace(req.user.tenantId, req.valid.params.id) });
