/**
 * Auth Controller
 * ───────────────
 * Thin controller that handles HTTP request/response for authentication.
 * All business logic is delegated to authService.
 */

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');
const { REFRESH_TOKEN_COOKIE } = require('../utils/constants');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredCurrency } = req.body;

  const result = await authService.register({
    name,
    email,
    password,
    preferredCurrency,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  // Set refresh token in httpOnly cookie
  res.cookie(
    REFRESH_TOKEN_COOKIE.name,
    result.refreshToken,
    REFRESH_TOKEN_COOKIE.options
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * POST /api/auth/login
 * Login with email and password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(
    { email, password },
    {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    }
  );

  // Set refresh token in httpOnly cookie
  res.cookie(
    REFRESH_TOKEN_COOKIE.name,
    result.refreshToken,
    REFRESH_TOKEN_COOKIE.options
  );

  return sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh the access token using the refresh token from cookie.
 */
const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE.name];

  const result = await authService.refreshAccessToken(oldRefreshToken, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  // Set new refresh token in cookie (token rotation)
  res.cookie(
    REFRESH_TOKEN_COOKIE.name,
    result.refreshToken,
    REFRESH_TOKEN_COOKIE.options
  );

  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
    },
  });
});

/**
 * POST /api/auth/logout
 * Logout and revoke the current refresh token.
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE.name];

  await authService.logout(refreshToken);

  // Clear the refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE.name, {
    ...REFRESH_TOKEN_COOKIE.options,
    maxAge: 0,
  });

  return sendSuccess(res, {
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices.
 * Requires authentication.
 */
const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.userId);

  // Clear the refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE.name, {
    ...REFRESH_TOKEN_COOKIE.options,
    maxAge: 0,
  });

  return sendSuccess(res, {
    message: 'Logged out from all devices successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current user profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.userId);

  return sendSuccess(res, {
    data: { user },
  });
});

/**
 * PATCH /api/auth/me
 * Update current user profile.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.userId, req.body);

  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * POST /api/auth/change-password
 * Change the current user's password.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user.userId, currentPassword, newPassword);

  // Clear the refresh token cookie (user needs to re-login)
  res.clearCookie(REFRESH_TOKEN_COOKIE.name, {
    ...REFRESH_TOKEN_COOKIE.options,
    maxAge: 0,
  });

  return sendSuccess(res, {
    message: 'Password changed successfully. Please log in again.',
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
};
