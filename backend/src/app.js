import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { limiter } from './middleware/rateLimit.js';
import { config } from './config.js';
import { query, describeDbError } from './db/pool.js';
import { requireAuth } from './middleware/auth.js';
import { requestId, errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import leadRoutes from './routes/leads.js';
import appointmentRoutes from './routes/appointments.js';
import knowledgeRoutes from './routes/knowledge.js';
import insightRoutes from './routes/insights.js';
import customerRoutes from './routes/customers.js';
import callSummaryRoutes from './routes/callSummaries.js';
import publicRoutes from './routes/public.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind nginx / a load balancer: rate-limit by real client IP
  app.use(requestId);
  app.use(helmet());
  // CORS: only the configured frontend origins may call the API from a browser.
  app.use(cors({ origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)), credentials: false }));
  app.use(express.json({ limit: '300kb' }));
  app.use('/api', limiter({ windowMs: 60 * 1000, limit: config.rateLimitMax }));

  app.get('/api/health', async (_req, res) => {
    try {
      await query('SELECT 1');
      res.json({ data: { status: 'ok', database: 'ok', time: new Date().toISOString() } });
    } catch (err) {
      res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: describeDbError(err) } });
    }
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/conversations', requireAuth, conversationRoutes);
  app.use('/api/leads', requireAuth, leadRoutes);
  app.use('/api/appointments', requireAuth, appointmentRoutes);
  app.use('/api/knowledge', requireAuth, knowledgeRoutes);
  app.use('/api/customers', requireAuth, customerRoutes);
  app.use('/api/call-summaries', requireAuth, callSummaryRoutes);
  app.use('/api', requireAuth, insightRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
