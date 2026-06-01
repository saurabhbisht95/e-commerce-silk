import { config } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (config.CORS_ORIGIN_LIST.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Guest-Id', 'X-Request-Id', 'Idempotency-Key'],
  exposedHeaders: ['X-Request-Id']
};
