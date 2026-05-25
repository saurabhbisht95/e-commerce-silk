import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: req => req.headers['x-request-id'] || crypto.randomUUID(),
  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress
      };
    }
  }
});
