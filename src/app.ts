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

type AppSettings = Pick<
  AppConfig,
  'API_PREFIX' | 'CORS_ORIGINS' | 'NODE_ENV' | 'LOG_LEVEL'
>;

const defaultSettings: AppSettings = {
  API_PREFIX: '/api/v1',
  CORS_ORIGINS: 'http://localhost:4200',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
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
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof AppError ? error.message : 'Internal server error';
    const errors = error instanceof AppError ? error.errors : [];

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
