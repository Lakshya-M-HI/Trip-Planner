/**
 * JWT Token Utilities
 * ───────────────────
 * Handles generation and verification of access & refresh tokens.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate an access token (short-lived).
 * @param {object} payload — Data to embed in the token (userId, email)
 * @returns {string} Signed JWT
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiry,
    issuer: 'trip-planner-api',
    audience: 'trip-planner-client',
  });
}

/**
 * Generate a refresh token (long-lived).
 * @param {object} payload — Data to embed in the token (userId)
 * @returns {string} Signed JWT
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiry,
    issuer: 'trip-planner-api',
    audience: 'trip-planner-client',
  });
}

/**
 * Verify an access token.
 * @param {string} token — JWT string
 * @returns {object} Decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret, {
    issuer: 'trip-planner-api',
    audience: 'trip-planner-client',
  });
}

/**
 * Verify a refresh token.
 * @param {string} token — JWT string
 * @returns {object} Decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret, {
    issuer: 'trip-planner-api',
    audience: 'trip-planner-client',
  });
}

/**
 * Generate both access and refresh tokens for a user.
 * @param {object} user — User document from MongoDB
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokenPair(user) {
  const accessPayload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  const refreshPayload = {
    userId: user._id.toString(),
  };

  return {
    accessToken: generateAccessToken(accessPayload),
    refreshToken: generateRefreshToken(refreshPayload),
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
