/**
 * Request Validator Middleware
 * ───────────────────────────
 * Generic validator that accepts a Joi schema and validates
 * the specified request property (body, query, params).
 *
 * Usage:
 *   router.post('/trips', validate(createTripSchema, 'body'), tripController.create);
 */

const AppError = require('../utils/AppError');

/**
 * Creates a validation middleware for a given Joi schema.
 *
 * @param {import('joi').Schema} schema — Joi validation schema
 * @param {'body'|'query'|'params'} property — Request property to validate
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,        // Return all errors, not just the first
      stripUnknown: true,       // Remove unknown fields
      allowUnknown: false,      // Don't allow unknown fields
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        const key = detail.path.join('.');
        acc[key] = detail.message.replace(/"/g, '');
        return acc;
      }, {});

      return next(AppError.badRequest('Validation failed', errors));
    }

    // Replace request property with validated & sanitized value
    req[property] = value;
    next();
  };
};

module.exports = validate;
