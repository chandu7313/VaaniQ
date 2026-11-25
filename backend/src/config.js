import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DB_POOL_MAX: z.coerce.number().default(10),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  LLM_PROVIDER: z.enum(['groq', 'gemini', 'demo']).default('demo'),
  LLM_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().optional().default(''),
  LLM_TIMEOUT_MS: z.coerce.number().default(15000),
  DEMO_MODE: z.string().default('false'),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  AGENT_RATE_LIMIT_MAX: z.coerce.number().default(60),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${msg}`);
}
const env = parsed.data;

// DEMO_MODE is explicit: forced by flag, or implied when the chosen provider has no key/model.
const providerUsable = env.LLM_PROVIDER !== 'demo' && env.LLM_API_KEY && env.LLM_MODEL;
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  corsOrigins: env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  databaseUrl: env.DATABASE_URL,
  dbPoolMax: env.DB_POOL_MAX,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  llm: {
    provider: env.LLM_PROVIDER,
    apiKey: env.LLM_API_KEY,
    model: env.LLM_MODEL,
    timeoutMs: env.LLM_TIMEOUT_MS,
  },
  demoMode: env.DEMO_MODE === 'true' || !providerUsable,
  rateLimitMax: env.RATE_LIMIT_MAX,
  agentRateLimitMax: env.AGENT_RATE_LIMIT_MAX,
};
