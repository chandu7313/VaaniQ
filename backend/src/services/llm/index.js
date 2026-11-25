import { config } from '../../config.js';
import { createGroqProvider } from './groq.js';
import { createGeminiProvider } from './gemini.js';

// Provider abstraction: every provider exposes chat({system, messages, json}) -> string.
// DEMO_MODE provider has no model; the agent then uses rule-based NLU and templated/extractive replies,
// and every trace and the UI say so explicitly.
const demoProvider = { name: 'demo-rules', isDemo: true, chat: null };

let provider;
export function getProvider() {
  if (provider) return provider;
  if (config.demoMode) provider = demoProvider;
  else if (config.llm.provider === 'groq') provider = createGroqProvider(config.llm);
  else if (config.llm.provider === 'gemini') provider = createGeminiProvider(config.llm);
  else provider = demoProvider;
  return provider;
}

/** Test seam: inject a fake provider. */
export function setProvider(p) { provider = p; }
