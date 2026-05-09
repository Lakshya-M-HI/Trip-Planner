/**
 * Rate Limiter Middleware
 * ──────────────────────
 * Configurable rate limiting to prevent API abuse.
 * Uses different limits for different endpoint groups.
 */

const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../utils/constants');
const AppError = require('../utils/AppError');

/**
 * Create a rate limiter with custom configuration.
 * @param {object} config — { windowMs, max }
 * @param {string} [message] — Custom error message
 */
function createLimiter(config, message) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
    handler: (req, res, next) => {
      next(AppError.tooManyRequests(message || 'Too many requests. Please try again later.'));
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.userId || req.ip;
    },
  });
}

// Pre-configured limiters
const generalLimiter = createLimiter(RATE_LIMIT.GENERAL);

const authLimiter = createLimiter(
  RATE_LIMIT.AUTH,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

const tripCreateLimiter = createLimiter(
  RATE_LIMIT.TRIP_CREATE,
  'Trip creation limit reached. You can create up to 10 trips per hour.'
);

module.exports = { generalLimiter, authLimiter, tripCreateLimiter, createLimiter };
