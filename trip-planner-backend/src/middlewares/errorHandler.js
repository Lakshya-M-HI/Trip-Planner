/**
 * Global Error Handler Middleware
 * ───────────────────────────────
 * Must be the LAST middleware registered in Express.
 * Handles all errors thrown/next(err)'d in the app.
 *
 * - In development: returns full error details + stack trace
 * - In production: returns safe, generic messages for non-operational errors
 */

const logger = require('../config/logger');
const { sendError } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // ── Handle specific error types ──

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).reduce((acc, e) => {
      acc[e.path] = e.message;
      return acc;
    }, {});
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // ── Log the error ──
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId || 'anonymous',
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── In production, hide internal error details ──
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'Something went wrong. Please try again later.';
    errors = null;
  }

  return sendError(res, {
    statusCode,
    message,
    errors,
    stack: err.stack,
  });
};

module.exports = errorHandler;
