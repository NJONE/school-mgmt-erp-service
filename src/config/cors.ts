import type { CorsOptions } from 'cors';

export function createCorsOptions(origins: string): CorsOptions {
  const allowedOrigins = new Set(
    origins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
  };
}
