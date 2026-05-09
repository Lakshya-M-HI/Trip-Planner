/**
 * Trip Validation Schemas
 * ───────────────────────
 * Joi schemas for validating trip-related request payloads.
 */

const Joi = require('joi');
const { CURRENCIES } = require('../utils/constants');

const locationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(500).required().messages({
    'any.required': 'Location name is required',
  }),
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required',
  }),
  formattedAddress: Joi.string().trim().max(500).allow('').default(''),
  placeId: Joi.string().trim().max(300).allow('').default(''),
});

const createTripSchema = Joi.object({
  startLocation: locationSchema.required().messages({
    'any.required': 'Start location is required',
  }),

  destination: locationSchema.required().messages({
    'any.required': 'Destination is required',
  }),

  startDate: Joi.date().iso().min('now').required().messages({
    'date.min': 'Start date must be in the future',
    'any.required': 'Start date is required',
  }),

  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),

  budget: Joi.object({
    amount: Joi.number().positive().max(10000000).required().messages({
      'number.positive': 'Budget must be a positive number',
      'number.max': 'Budget seems too high. Please enter a reasonable amount.',
      'any.required': 'Budget amount is required',
    }),
    currency: Joi.string()
      .uppercase()
      .valid(...CURRENCIES)
      .default('INR')
      .messages({
        'any.only': `Currency must be one of: ${CURRENCIES.join(', ')}`,
      }),
  }).required(),

  travelers: Joi.number().integer().min(1).max(20).default(1).messages({
    'number.min': 'At least 1 traveler is required',
    'number.max': 'Maximum 20 travelers allowed',
  }),

  preferences: Joi.object({
    travelStyle: Joi.string().valid('budget', 'moderate', 'luxury').default('moderate'),
    interests: Joi.array().items(Joi.string().trim().max(50)).max(10).default([]),
  }).default(),
});

const tripIdParamSchema = Joi.object({
  tripId: Joi.string().trim().min(5).max(20).required().messages({
    'any.required': 'Trip ID is required',
  }),
});

const listTripsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('planning', 'ready', 'failed', 'partial'),
  sortBy: Joi.string().valid('createdAt', 'startDate', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const createPriceAlertSchema = Joi.object({
  tripId: Joi.string().trim().required(),
  type: Joi.string().valid('flight', 'hotel').required(),
  targetPrice: Joi.number().positive().required().messages({
    'number.positive': 'Target price must be positive',
    'any.required': 'Target price is required',
  }),
  currency: Joi.string()
    .uppercase()
    .valid(...CURRENCIES)
    .default('INR'),
});

module.exports = {
  createTripSchema,
  tripIdParamSchema,
  listTripsQuerySchema,
  createPriceAlertSchema,
};
