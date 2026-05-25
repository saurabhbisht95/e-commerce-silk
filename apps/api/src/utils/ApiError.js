export class ApiError extends Error {
  constructor(statusCode, message, details = undefined, isOperational = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentication required', details) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = 'Permission denied', details) {
    return new ApiError(403, message, details);
  }

  static notFound(message = 'Resource not found', details) {
    return new ApiError(404, message, details);
  }

  static conflict(message = 'Resource conflict', details) {
    return new ApiError(409, message, details);
  }

  static tooManyRequests(message = 'Too many requests', details) {
    return new ApiError(429, message, details);
  }
}
