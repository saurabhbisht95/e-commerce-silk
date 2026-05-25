import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const normalizeError = error => {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return ApiError.badRequest('Validation failed', error.issues);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return ApiError.badRequest(
      'Validation failed',
      Object.values(error.errors).map(item => ({ path: item.path, message: item.message }))
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${error.path}`);
  }

  if (error?.code === 11000) {
    return ApiError.conflict('Duplicate resource', error.keyValue);
  }

  if (error?.message?.startsWith('CORS blocked origin')) {
    return ApiError.forbidden(error.message);
  }

  return new ApiError(500, 'Internal server error', undefined, false);
};

export const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);

  logger[normalized.statusCode >= 500 ? 'error' : 'warn'](
    {
      err: error,
      requestId: req.id,
      path: req.originalUrl,
      statusCode: normalized.statusCode
    },
    normalized.message
  );

  const payload = {
    success: false,
    message: normalized.message
  };

  if (normalized.details) payload.errors = normalized.details;
  if (!config.isProduction && normalized.stack) payload.stack = normalized.stack;

  res.status(normalized.statusCode).json(payload);
};
