import { config } from './config.js';
import { createApp } from './app.js';
import { pool, describeDbError } from './db/pool.js';
import { getProvider } from './services/llm/index.js';
import { log } from './lib/logger.js';

const server = createApp().listen(config.port, () => {
  const p = getProvider();
  log.info('server_started', { port: config.port, provider: p.name, demoMode: p.isDemo });
  // Fail loudly (but keep serving /api/health) so a bad DATABASE_URL is obvious before a demo.
  pool.query('SELECT 1')
    .then(() => log.info('database_connected', { ssl: config.dbSsl }))
    .catch((err) => log.error('database_unreachable', { code: err.code, reason: describeDbError(err) }));
});

// Graceful shutdown: stop accepting connections, then drain the DB pool (important under orchestration).
const shutdown = (signal) => {
  log.info('shutdown', { signal });
  server.close(() => pool.end().then(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
