import { URL } from 'node:url';

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

  JUDGE0_API_URL: z.string().url().default('http://localhost:2358'),
  JUDGE0_AUTH_TOKEN: z.string().optional().transform((v) => v?.trim() || undefined),
  JUDGE0_RAPIDAPI_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  JUDGE0_ALLOW_NO_AUTH: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  ONLINECOMPILER_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  ONLINECOMPILER_API_URL: z.string().url().default('https://api.onlinecompiler.io'),
  CODE_EXECUTION_PROVIDER: z.enum(['auto', 'judge0', 'onlinecompiler']).default('auto'),

  STRIPE_SECRET_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  STRIPE_WEBHOOK_SECRET: z.string().optional().transform((v) => v?.trim() || undefined),
  STRIPE_PUBLISHABLE_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  STRIPE_MODE: z.enum(['test', 'live']).optional(),
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

const isLocalJudge0Host = (url) => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === 'host.docker.internal';
  } catch {
    return false;
  }
};

export const isJudge0NoAuth = Boolean(env.JUDGE0_ALLOW_NO_AUTH || isLocalJudge0Host(env.JUDGE0_API_URL));

export const isJudge0Configured = Boolean(
  env.JUDGE0_AUTH_TOKEN || env.JUDGE0_RAPIDAPI_KEY || isJudge0NoAuth,
);

export const isOnlineCompilerConfigured = Boolean(env.ONLINECOMPILER_API_KEY);

export const isCodeExecutionConfigured = isOnlineCompilerConfigured || isJudge0Configured;

export const getCodeExecutionProvider = () => {
  if (env.CODE_EXECUTION_PROVIDER === 'onlinecompiler') {
    return isOnlineCompilerConfigured ? 'onlinecompiler' : null;
  }
  if (env.CODE_EXECUTION_PROVIDER === 'judge0') {
    return isJudge0Configured ? 'judge0' : null;
  }
  if (isOnlineCompilerConfigured) return 'onlinecompiler';
  if (isJudge0Configured) return 'judge0';
  return null;
};

export const isStripeConfigured = Boolean(env.STRIPE_SECRET_KEY);
export const isStripeWebhookConfigured = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);

const detectKeyMode = (key) => {
  if (!key) return null;
  if (key.startsWith('sk_test_') || key.startsWith('pk_test_')) return 'test';
  if (key.startsWith('sk_live_') || key.startsWith('pk_live_')) return 'live';
  return null;
};

const secretMode = detectKeyMode(env.STRIPE_SECRET_KEY);
const publishableMode = detectKeyMode(env.STRIPE_PUBLISHABLE_KEY);

export const stripeMode = env.STRIPE_MODE
  || secretMode
  || (env.NODE_ENV === 'production' ? 'live' : 'test');

export const isStripeTestMode = stripeMode === 'test';

if (env.STRIPE_SECRET_KEY && secretMode && secretMode !== stripeMode) {
  console.warn(`[Stripe] STRIPE_MODE=${stripeMode} but secret key appears to be ${secretMode} mode`);
}
if (env.STRIPE_PUBLISHABLE_KEY && publishableMode && secretMode && publishableMode !== secretMode) {
  console.warn('[Stripe] Publishable and secret keys are from different Stripe modes');
}
