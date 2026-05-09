/**
 * Authentication Middleware
 * ────────────────────────
 * Verifies JWT access tokens from the Authorization header.
 * Attaches decoded user data to req.user for downstream handlers.
 */

const { verifyAccessToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');

/**
 * Require authentication — rejects requests without a valid access token.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token is required. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Access token is required. Please log in.');
    }

    // Verify the token and attach payload to request
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    // JWT verification errors
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Access token has expired. Please refresh your token.'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid access token.'));
    }

    return next(AppError.unauthorized('Authentication failed.'));
  }
};

/**
 * Optional authentication — attaches user data if token is present,
 * but doesn't reject requests without one.
 * Useful for endpoints that work for both guests and authenticated users
 * (e.g., viewing a shared trip).
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    req.user = null;
  }

  next();
};

module.exports = { authenticate, optionalAuth };
