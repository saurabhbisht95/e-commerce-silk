import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import { doubleCsrf } from 'csrf-csrf';
import { config } from '../config/env.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

export const mongoSanitizer = mongoSanitize({
  replaceWith: '_'
});

const sanitizeValue = value => {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeValue(nested)]));
  }
  return value;
};

export const sanitizeBody = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

const csrf = doubleCsrf({
  getSecret: () => config.CSRF_SECRET,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: config.isProduction ? 'none' : 'lax',
    secure: config.COOKIE_SECURE || config.isProduction,
    signed: true,
    path: '/'
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: req => req.headers['x-csrf-token']
});

export const csrfProtection = config.ENABLE_CSRF ? csrf.doubleCsrfProtection : (_req, _res, next) => next();

export const getCsrfToken = (req, res) => {
  const csrfToken = csrf.generateToken(req, res);
  return sendSuccess(res, 200, 'CSRF token generated successfully', { csrfToken });
};
