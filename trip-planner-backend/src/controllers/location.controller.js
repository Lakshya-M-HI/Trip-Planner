/**
 * Location Controller
 * ───────────────────
 * Handles geocoding, reverse geocoding, and autocomplete requests.
 */

const geocodingService = require('../services/geocoding.service');
const currencyService = require('../services/currency.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const geocode = asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ success: false, message: 'Address query parameter is required' });
  const result = await geocodingService.geocodeAddress(address);
  return sendSuccess(res, { data: result });
});

const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng query parameters are required' });
  const result = await geocodingService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  return sendSuccess(res, { data: result });
});

const autocomplete = asyncHandler(async (req, res) => {
  const { q, sessionToken } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'q query parameter is required' });
  const results = await geocodingService.autocomplete(q, sessionToken);
  return sendSuccess(res, { data: results });
});

const placeDetails = asyncHandler(async (req, res) => {
  const { placeId } = req.params;
  const result = await geocodingService.getPlaceDetails(placeId);
  return sendSuccess(res, { data: result });
});

const getExchangeRates = asyncHandler(async (req, res) => {
  const { base } = req.query;
  const result = await currencyService.getExchangeRates(base || 'USD');
  return sendSuccess(res, { data: result });
});

const convertCurrency = asyncHandler(async (req, res) => {
  const { amount, from, to } = req.query;
  if (!amount || !from || !to) return res.status(400).json({ success: false, message: 'amount, from, and to query parameters are required' });
  const result = await currencyService.convert(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
  return sendSuccess(res, { data: result });
});

module.exports = { geocode, reverseGeocode, autocomplete, placeDetails, getExchangeRates, convertCurrency };
