/**
 * Trip Controller
 * ───────────────
 * Handles HTTP requests for trip CRUD, planning, sharing, and export.
 */

const tripService = require('../services/trip.service');
const pdfService = require('../services/pdf.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const createTrip = asyncHandler(async (req, res) => {
  const result = await tripService.createTrip(req.user.userId, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Trip creation started', data: result });
});

const getTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.tripId, req.user.userId);
  return sendSuccess(res, { data: { trip } });
});

const getSharedTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getSharedTrip(req.params.tripId, req.query.token);
  return sendSuccess(res, { data: { trip } });
});

const listTrips = asyncHandler(async (req, res) => {
  const { trips, total, page, limit } = await tripService.listTrips(req.user.userId, req.query);
  return sendPaginated(res, { data: trips, page, limit, total });
});

const getTripStatus = asyncHandler(async (req, res) => {
  const status = await tripService.getTripStatus(req.params.tripId, req.user.userId);
  return sendSuccess(res, { data: status });
});

const deleteTrip = asyncHandler(async (req, res) => {
  await tripService.deleteTrip(req.params.tripId, req.user.userId);
  return sendSuccess(res, { message: 'Trip deleted successfully' });
});

const shareTrip = asyncHandler(async (req, res) => {
  const result = await tripService.generateShareToken(req.params.tripId, req.user.userId);
  return sendSuccess(res, { message: 'Share link generated', data: result });
});

const exportTripPDF = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.tripId, req.user.userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=trip-${trip.tripId}.pdf`);
  pdfService.generateTripPDF(trip, res);
});

module.exports = { createTrip, getTrip, getSharedTrip, listTrips, getTripStatus, deleteTrip, shareTrip, exportTripPDF };
