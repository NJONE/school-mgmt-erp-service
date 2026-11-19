import pino from 'pino';

export function createLogger(level: string = process.env.LOG_LEVEL ?? 'info') {
  return pino({
    level,
    redact: {
      paths: [
        'req.headers.authorization',
        'password',
        'accessToken',
        'refreshToken',
      ],
      censor: '[REDACTED]',
    },
  });
}

export const logger = createLogger();
