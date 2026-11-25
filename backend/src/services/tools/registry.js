import { z } from 'zod';

// Tool registry: the ONLY way the agent changes business state.
// Each call passes: (1) registry lookup, (2) Zod argument validation, (3) confirmation gate
// for tools that require customer consent, then (4) the backend handler. Every step is recorded.
const tools = new Map();

export function registerTool(def) {
  tools.set(def.name, def);
}

export const listTools = () => [...tools.values()].map(({ name, description, sideEffect, requiresConfirmation }) => ({ name, description, sideEffect, requiresConfirmation }));

const stable = (v) => JSON.stringify(v, Object.keys(v || {}).sort());

/**
 * @param ctx {tenantId, conversationId, leadId, now, pendingProposal, customerConfirmed}
 * customerConfirmed is set by the orchestrator only when the rule-based NLU detected an explicit
 * "yes" in THIS turn while a proposal was pending. Model output can never set it.
 */
export async function executeTool(ctx, name, rawArgs, reason) {
  const started = Date.now();
  const record = { tool: name, reason, args: rawArgs, validation: { ok: false, checks: [] } };
  const fail = (code, message) => ({ ...record, ok: false, error: { code, message }, durationMs: Date.now() - started });

  const tool = tools.get(name);
  if (!tool) return fail('UNKNOWN_TOOL', `Tool ${name} is not registered`);
  record.validation.checks.push('tool registered');
  record.sideEffect = tool.sideEffect;

  const parsed = tool.argsSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) return fail('INVALID_ARGS', parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  record.validation.checks.push('arguments valid');

  if (tool.requiresConfirmation) {
    const p = ctx.pendingProposal;
    const ok = ctx.customerConfirmed && p && p.tool === name && stable(p.args) === stable(parsed.data) && new Date(p.expiresAt) > ctx.now;
    if (!ok) return fail('CONFIRMATION_REQUIRED', 'This action needs the customer\'s explicit confirmation of the exact proposal');
    record.validation.checks.push('customer confirmed this exact proposal');
  }
  record.validation.ok = true;

  try {
    const result = await tool.handler(ctx, parsed.data);
    return { ...record, ok: true, result, durationMs: Date.now() - started };
  } catch (err) {
    // Business errors (slot taken, etc.) are expected outcomes, surfaced to the agent and the trace.
    return fail(err.code || 'TOOL_ERROR', err.message);
  }
}

export { z };
