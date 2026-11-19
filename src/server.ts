import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { loadEnv } from './config/env.js';
import { logger } from './config/logger.js';

async function start(): Promise<void> {
  const config = loadEnv();
  await connectDatabase(config.MONGODB_URI, logger);

  const app = createApp(config);
  const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'HTTP server listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close((error) => {
      if (error) {
        logger.error({ err: error }, 'HTTP server failed to close');
        process.exitCode = 1;
      }
      void disconnectDatabase().finally(() => process.exit());
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Application startup failed');
  process.exitCode = 1;
});
