import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_REMEMBER_EXPIRES_IN: z.string().default('30d'),

  SMTP_HOST: z.string().optional().transform((v) => v?.trim() || undefined),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().transform((v) => v?.trim() || undefined),
  SMTP_PASS: z.string().optional().transform((v) => v?.trim() || undefined),
  EMAIL_FROM: z.string().email().default('noreply@aicareerplatform.com'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().transform((v) => v?.trim() || undefined),
  CLOUDINARY_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  CLOUDINARY_API_SECRET: z.string().optional().transform((v) => v?.trim() || undefined),

  GEMINI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),

  JUDGE0_API_URL: z.string().url().default('https://ce.judge0.com'),
  JUDGE0_AUTH_TOKEN: z.string().optional().transform((v) => v?.trim() || undefined),
  JUDGE0_RAPIDAPI_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isEmailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

export const isGeminiConfigured = Boolean(env.GEMINI_API_KEY);

export const isJudge0Configured = Boolean(env.JUDGE0_AUTH_TOKEN || env.JUDGE0_RAPIDAPI_KEY);
