import { createLead } from '../services/crm.js';
import { startConversation, addMessage, listConversations, getConversationDetail } from '../services/memory.js';
import { handleTurn } from '../services/agent/orchestrator.js';
import { t } from '../services/agent/templates.js';
import { generateCallSummary } from '../services/summary.js';
import { listConversationTraces } from '../services/traces.js';

export const list = async (req, res) => res.json({ data: await listConversations(req.user.tenantId) });

export async function start(req, res) {
  const { tenantId } = req.user;
  const lead = await createLead(tenantId);
  const conversation = await startConversation(tenantId, { leadId: lead.id, ...req.valid.body });
  const greeting = await addMessage(tenantId, conversation.id, { role: 'agent', content: t(conversation.language, 'greeting') });
  res.status(201).json({ data: { conversation, greeting, leadId: lead.id } });
}

export const detail = async (req, res) => res.json({ data: await getConversationDetail(req.user.tenantId, req.valid.params.id) });

export async function sendMessage(req, res) {
  res.json({ data: await handleTurn({ tenantId: req.user.tenantId, conversationId: req.valid.params.id, ...req.valid.body }) });
}

export const end = async (req, res) => res.json({ data: await generateCallSummary(req.user.tenantId, req.valid.params.id) });

export const traces = async (req, res) => res.json({ data: await listConversationTraces(req.user.tenantId, req.valid.params.id) });
