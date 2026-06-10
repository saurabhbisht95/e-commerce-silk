import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const DEVELOPMENT_API_LIMIT = 1500;

const handler = (_req, _res, next) => next(ApiError.tooManyRequests('Rate limit exceeded. Please try again later.'));

export const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.isDevelopment ? Math.max(config.RATE_LIMIT_MAX, DEVELOPMENT_API_LIMIT) : config.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});
