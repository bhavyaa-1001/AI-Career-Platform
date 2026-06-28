import 'dotenv/config';

import app from './app.js';
import { connectDB } from './config/db.js';
import { env, isEmailConfigured, getCodeExecutionProvider, isCodeExecutionConfigured } from './config/env.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  await connectDB(env.MONGODB_URI);

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API: http://localhost:${env.PORT}/api/v1`);
    logger.info(
      isEmailConfigured
        ? `Email: SMTP enabled (${env.SMTP_HOST}) — signup OTP sent by email`
        : 'Email: SMTP not configured — signup OTP logged to console only',
    );
    logger.info(
      isCodeExecutionConfigured
        ? `Code execution: ${getCodeExecutionProvider()} enabled`
        : 'Code execution: not configured — set ONLINECOMPILER_API_KEY or run Judge0 (npm run judge0:up)',
    );
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
