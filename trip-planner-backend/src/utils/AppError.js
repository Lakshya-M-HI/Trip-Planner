/**
 * Custom Application Error
 * ────────────────────────
 * Extends the native Error class with HTTP status codes
 * and operational/programmer error distinction.
 *
 * Operational errors (isOperational = true):
 *   Expected errors like "User not found", "Invalid input".
 *   These are safe to send to the client.
 *
 * Programmer errors (isOperational = false):
 *   Bugs like TypeError, ReferenceError.
 *   These should be logged and a generic 500 sent to client.
 */

class AppError extends Error {
  /**
   * @param {string} message — Human-readable error message
   * @param {number} statusCode — HTTP status code (400, 401, 403, 404, 500, etc.)
   * @param {object} [options] — Additional options
   * @param {boolean} [options.isOperational=true] — Whether this is an expected error
   * @param {object} [options.errors] — Field-level validation errors
   */
  constructor(message, statusCode, options = {}) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = options.isOperational !== undefined ? options.isOperational : true;
    this.errors = options.errors || null;

    // Capture stack trace, excluding the constructor call from the trace
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods for common errors ──

  static badRequest(message = 'Bad request', errors = null) {
    return new AppError(message, 400, { errors });
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new AppError(message, 429);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, { isOperational: false });
  }
}

module.exports = AppError;
