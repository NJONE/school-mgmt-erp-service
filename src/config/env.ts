import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    API_PREFIX: z
      .string()
      .regex(/^\/[a-zA-Z0-9/_-]*$/)
      .default('/api/v1'),
    MONGODB_URI: z.string().min(1, 'mongodb://127.0.0.1:27017/school_mgmt_erp'),
    CORS_ORIGINS: z.string().default('http://localhost:4200'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    JWT_ACCESS_SECRET: z
      .string()
      .min(32)
      .default('development-access-secret-change-me-123456789'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32)
      .default('development-refresh-secret-change-me-12345678'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (
        env[key].includes('development') ||
        env[key].includes('replace-with') ||
        env[key].length < 32
      ) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message:
            'Production JWT secrets must contain at least 32 non-default characters',
        });
      }
    }
  });

export type AppConfig = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}
