/**
 * Standardized API Response Helpers
 * ──────────────────────────────────
 * Ensures consistent JSON response shapes across all endpoints.
 *
 * Success: { success: true, data: ..., message: ..., meta: ... }
 * Error:   { success: false, message: ..., errors: ... }
 */

/**
 * Send a success response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Success']
 * @param {*} [options.data=null]
 * @param {object} [options.meta=null] — Pagination, counts, etc.
 */
function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message='Something went wrong']
 * @param {object} [options.errors=null] — Field-level validation errors
 * @param {string} [options.stack=null] — Stack trace (dev only)
 */
function sendError(
  res,
  { statusCode = 500, message = 'Something went wrong', errors = null, stack = null } = {}
) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in development
  if (stack && process.env.NODE_ENV === 'development') {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {Array} options.data — Array of results
 * @param {number} options.page — Current page
 * @param {number} options.limit — Items per page
 * @param {number} options.total — Total number of items
 * @param {string} [options.message='Success']
 */
function sendPaginated(res, { data, page, limit, total, message = 'Success' }) {
  return sendSuccess(res, {
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
