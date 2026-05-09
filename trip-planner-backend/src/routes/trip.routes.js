/**
 * Trip Routes
 * ───────────
 */

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator');
const { tripCreateLimiter } = require('../middlewares/rateLimiter');
const { createTripSchema, tripIdParamSchema, listTripsQuerySchema } = require('../validations/trip.validation');

// Protected routes
router.post('/', authenticate, tripCreateLimiter, validate(createTripSchema), tripController.createTrip);
router.get('/', authenticate, validate(listTripsQuerySchema, 'query'), tripController.listTrips);
router.get('/:tripId', authenticate, validate(tripIdParamSchema, 'params'), tripController.getTrip);
router.get('/:tripId/status', authenticate, validate(tripIdParamSchema, 'params'), tripController.getTripStatus);
router.delete('/:tripId', authenticate, validate(tripIdParamSchema, 'params'), tripController.deleteTrip);
router.post('/:tripId/share', authenticate, validate(tripIdParamSchema, 'params'), tripController.shareTrip);
router.get('/:tripId/export/pdf', authenticate, validate(tripIdParamSchema, 'params'), tripController.exportTripPDF);

// Public shared trip route
router.get('/shared/:tripId', validate(tripIdParamSchema, 'params'), tripController.getSharedTrip);

module.exports = router;
