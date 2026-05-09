/**
 * Auth Service
 * ────────────
 * Business logic for user authentication.
 * Handles registration, login, token refresh, logout, profile management.
 */

const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { REFRESH_TOKEN_COOKIE } = require('../utils/constants');

class AuthService {
  /**
   * Register a new user.
   * @param {object} userData — { name, email, password, preferredCurrency }
   * @returns {{ user, accessToken, refreshToken }}
   */
  async register(userData) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      preferredCurrency: userData.preferredCurrency || 'INR',
    });

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token in DB
    await this._storeRefreshToken(refreshToken, user._id, userData.userAgent, userData.ipAddress);

    logger.info(`New user registered: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login an existing user.
   * @param {object} credentials — { email, password }
   * @param {object} meta — { userAgent, ipAddress }
   * @returns {{ user, accessToken, refreshToken }}
   */
  async login({ email, password }, meta = {}) {
    // Find user with password field explicitly selected
    const user = await User.findOne({ email, isActive: true }).select('+password');

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check if password needs rehashing (e.g., if argon2 params changed)
    if (user.needsRehash()) {
      user.password = password; // Will be re-hashed by pre-save hook
      await user.save();
      logger.info(`Password rehashed for user: ${user.email}`);
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token
    await this._storeRefreshToken(refreshToken, user._id, meta.userAgent, meta.ipAddress);

    logger.info(`User logged in: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh the access token using a valid refresh token.
   * Implements token rotation: old refresh token is revoked, new pair is issued.
   * @param {string} oldRefreshToken
   * @param {object} meta — { userAgent, ipAddress }
   * @returns {{ accessToken, refreshToken }}
   */
  async refreshAccessToken(oldRefreshToken, meta = {}) {
    if (!oldRefreshToken) {
      throw AppError.unauthorized('Refresh token is required');
    }

    // Verify the JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Find the token in DB (must exist and not be revoked)
    const storedToken = await RefreshToken.findOne({
      token: oldRefreshToken,
      userId: decoded.userId,
      isRevoked: false,
    });

    if (!storedToken) {
      // Token reuse detected — possible token theft
      // Revoke ALL tokens for this user as a security measure
      logger.warn(`Possible token theft detected for user: ${decoded.userId}`);
      await RefreshToken.updateMany({ userId: decoded.userId }, { isRevoked: true });
      throw AppError.unauthorized('Token reuse detected. All sessions have been invalidated.');
    }

    // Revoke the old refresh token (token rotation)
    storedToken.isRevoked = true;
    await storedToken.save();

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or account is deactivated');
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // Store new refresh token
    await this._storeRefreshToken(newRefreshToken, user._id, meta.userAgent, meta.ipAddress);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — revoke the refresh token.
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }
  }

  /**
   * Logout from all devices — revoke all refresh tokens for a user.
   * @param {string} userId
   */
  async logoutAll(userId) {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
    logger.info(`All sessions invalidated for user: ${userId}`);
  }

  /**
   * Get user profile.
   * @param {string} userId
   * @returns {object} User document
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  /**
   * Update user profile.
   * @param {string} userId
   * @param {object} updates — { name, preferredCurrency }
   * @returns {object} Updated user
   */
  async updateProfile(userId, updates) {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Change user password.
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens (force re-login on all devices)
    await this.logoutAll(userId);

    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Store a refresh token in the database.
   * @private
   */
  async _storeRefreshToken(token, userId, userAgent, ipAddress) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await RefreshToken.create({
      token,
      userId,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
    });
  }
}

module.exports = new AuthService();
