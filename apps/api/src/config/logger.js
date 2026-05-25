import pino from 'pino';
import { config } from './env.js';

export const logger = pino({
  level: config.isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'refreshToken',
      '*.refreshToken',
      'accessToken',
      '*.accessToken',
      'token',
      '*.token'
    ],
    censor: '[REDACTED]'
  }
});
