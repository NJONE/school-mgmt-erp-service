import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import type { AppConfig } from './config/env.js';
import { createCorsOptions } from './config/cors.js';
import { createLogger } from './config/logger.js';
import { AppError } from './core/errors/app-error.js';
import { metadataRouter } from './routes/metadata.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createEntityRouter } from './routes/entities.routes.js';
import { z } from 'zod';
import { createDomainWorkflowRouter } from './routes/domain-workflows.routes.js';

type AppSettings = Pick<
  AppConfig,
  | 'API_PREFIX'
  | 'CORS_ORIGINS'
  | 'NODE_ENV'
  | 'LOG_LEVEL'
  | 'JWT_ACCESS_SECRET'
  | 'JWT_REFRESH_SECRET'
  | 'JWT_ACCESS_EXPIRY'
  | 'JWT_REFRESH_EXPIRY'
>;

const defaultSettings: AppSettings = {
  API_PREFIX: '/api/v1',
  CORS_ORIGINS: 'http://localhost:4200',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  JWT_ACCESS_SECRET: 'development-access-secret-change-me-123456789',
  JWT_REFRESH_SECRET: 'development-refresh-secret-change-me-12345678',
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
};

export function createApp(settings: AppSettings = defaultSettings) {
  const app = express();
  const log = createLogger(settings.LOG_LEVEL);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors(createCorsOptions(settings.CORS_ORIGINS)));
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger: log, genReqId: () => randomUUID() }));

  app.get('/health', (_request, response) => {
    response.status(200).json({ success: true, data: { status: 'ok' } });
  });

  app.get('/ready', (_request, response) => {
    const ready = settings.NODE_ENV === 'test' || isDatabaseReady();
    response.status(ready ? 200 : 503).json({
      success: ready,
      data: { status: ready ? 'ready' : 'not-ready' },
    });
  });

  app.use(`${settings.API_PREFIX}/metadata`, metadataRouter);
  app.use(`${settings.API_PREFIX}/auth`, createAuthRouter(settings));
  app.use(`${settings.API_PREFIX}/entities`, createEntityRouter(settings));
  app.use(
    `${settings.API_PREFIX}/workflows`,
    createDomainWorkflowRouter(settings),
  );

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      message: 'Route not found',
      requestId: request.id,
    });
  });

  const errorHandler: ErrorRequestHandler = (
    error: unknown,
    request,
    response,
    next,
  ) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    const requestId = request.id ?? randomUUID();
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : error instanceof z.ZodError
          ? 400
          : error instanceof mongoose.Error.CastError
            ? 400
            : 500;
    const message =
      error instanceof AppError
        ? error.message
        : error instanceof z.ZodError
          ? 'Validation failed'
          : error instanceof mongoose.Error.CastError
            ? 'Invalid record identifier'
            : 'Internal server error';
    const errors =
      error instanceof AppError
        ? error.errors
        : error instanceof z.ZodError
          ? error.issues
          : [];

    log.error({ err: error, requestId }, 'Request failed');
    response.status(statusCode).json({
      success: false,
      message:
        settings.NODE_ENV === 'production' && statusCode === 500
          ? 'Internal server error'
          : message,
      errors,
      requestId,
    });
  };
  app.use(errorHandler);

  return app;
}

function isDatabaseReady(): boolean {
  return mongooseConnectionReady();
}

function mongooseConnectionReady(): boolean {
  return databaseReadyState() === 1;
}

function databaseReadyState(): number {
  return mongoose.connection.readyState;
}
