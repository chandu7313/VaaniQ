import { config } from '../config.js';
import { getProvider } from '../services/llm/index.js';
import { listTools } from '../services/tools/definitions.js';
import { speechCapabilities } from '../services/speech.js';
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
      speech: speechCapabilities(),
    },
  });
}

/** Live AI-provider check: one tiny request, reports latency or the exact failure. */
export async function llmHealth(req, res) {
  const p = getProvider();
  if (p.isDemo) return res.json({ data: { status: 'demo_mode', provider: p.name, message: 'No LLM configured: rule-based NLU and extractive answers are used.' } });
  const started = Date.now();
  try {
    const reply = await p.chat({ system: 'Reply with the single word OK.', messages: [{ role: 'user', content: 'ping' }], temperature: 0 });
    return res.json({ data: { status: 'ok', provider: p.name, latencyMs: Date.now() - started, sample: String(reply).slice(0, 20) } });
  } catch (err) {
    return res.status(503).json({ error: { code: 'LLM_UNAVAILABLE', message: `${p.name}: ${err.message}. The agent falls back to rule-based answers.`, requestId: req.id } });
  }
}

export const analyticsOverview = async (req, res) => res.json({ data: await getOverview(req.user.tenantId) });
export const traces = async (req, res) => res.json({ data: await listTraces(req.user.tenantId, req.valid.query) });
export const trace = async (req, res) => res.json({ data: await getTrace(req.user.tenantId, req.valid.params.id) });
