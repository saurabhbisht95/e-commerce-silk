import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform(value => {
    if (typeof value === 'boolean') return value;
    return String(value ?? '').toLowerCase() === 'true';
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'),

  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/doon_silk'),
  MONGODB_DB_NAME: z.string().min(1).default('doon_silk'),

  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-before-production'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-before-production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  COOKIE_SECRET: z.string().min(8).default('dev-cookie-secret'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  COOKIE_SECURE: booleanFromString.default(false),
  ENABLE_CSRF: booleanFromString.default(false),
  CSRF_SECRET: z.string().min(8).default('dev-csrf-secret'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('Doon Silk <no-reply@doonsilk.local>'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('doon-silk'),

  PAYMENT_DEFAULT_PROVIDER: z.enum(['stripe', 'razorpay', 'paypal']).default('razorpay'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  PAYPAL_CLIENT_ID: z.string().optional().default(''),
  PAYPAL_CLIENT_SECRET: z.string().optional().default(''),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === 'production') {
  const unsafeSecrets = [
    ['JWT_ACCESS_SECRET', env.JWT_ACCESS_SECRET],
    ['JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET],
    ['COOKIE_SECRET', env.COOKIE_SECRET],
    ['CSRF_SECRET', env.CSRF_SECRET]
  ].filter(([, value]) => value.includes('dev-') || value.includes('replace-with'));

  if (unsafeSecrets.length > 0) {
    throw new Error(`Unsafe production secrets: ${unsafeSecrets.map(([key]) => key).join(', ')}`);
  }
}

export const config = {
  ...env,
  CORS_ORIGIN_LIST: env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean),
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  isDevelopment: env.NODE_ENV === 'development'
};
