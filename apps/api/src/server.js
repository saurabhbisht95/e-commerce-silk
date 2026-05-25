import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

const app = createApp();

let server;

const start = async () => {
  await connectDatabase();
  server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, `Doon Silk API listening on port ${config.PORT}`);
  });
};

const shutdown = async signal => {
  logger.info({ signal }, 'Shutting down API');
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', error => {
  logger.error({ err: error }, 'Unhandled promise rejection');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', error => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

start().catch(error => {
  logger.fatal({ err: error }, 'Failed to start API');
  process.exit(1);
});
