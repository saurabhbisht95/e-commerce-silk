import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { swaggerSpec } from './config/swagger.js';
import {
  csrfProtection,
  mongoSanitizer,
  sanitizeBody,
  securityHeaders
} from './middlewares/security.middleware.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { sendSuccess } from './utils/ApiResponse.js';
import apiRoutes from './routes/index.js';
import paymentWebhookRoutes from './routes/paymentWebhook.routes.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser(config.COOKIE_SECRET));
  app.use(requestLogger);
  app.use((req, res, next) => {
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  app.use('/api/v1/payments/webhooks', express.raw({ type: '*/*', limit: '2mb' }), paymentWebhookRoutes);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(mongoSanitizer);
  app.use(sanitizeBody);

  app.get('/healthz', (_req, res) => {
    sendSuccess(res, 200, 'API is healthy', {
      service: 'doon-silk-api',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.use('/uploads', express.static(path.resolve('public/uploads'), { maxAge: '30d', immutable: true }));
  app.use('/api/v1', apiRateLimiter, csrfProtection, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
