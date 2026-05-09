/**
 * Location & Utility Routes
 * ─────────────────────────
 */

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All location routes require authentication
router.get('/geocode', authenticate, locationController.geocode);
router.get('/geocode/reverse', authenticate, locationController.reverseGeocode);
router.get('/autocomplete', authenticate, locationController.autocomplete);
router.get('/place/:placeId', authenticate, locationController.placeDetails);

// Currency routes
router.get('/currency/rates', authenticate, locationController.getExchangeRates);
router.get('/currency/convert', authenticate, locationController.convertCurrency);

module.exports = router;
