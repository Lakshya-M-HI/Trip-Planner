/**
 * Trip Orchestrator Service
 * ─────────────────────────
 * Coordinates all external API services to plan a complete trip.
 * Runs API calls in parallel for speed, handles partial failures gracefully.
 */

const Trip = require('../models/trip.model');
const drivingService = require('./driving.service');
const flightService = require('./flight.service');
const trainService = require('./train.service');
const hotelService = require('./hotel.service');
const taxiService = require('./taxi.service');
const placesService = require('./places.service');
const weatherService = require('./weather.service');
const aiService = require('./ai.service');
const logger = require('../config/logger');
const { TRIP_STATUS } = require('../utils/constants');
const AppError = require('../utils/AppError');
const { PAGINATION } = require('../utils/constants');

class TripService {
  /**
   * Create a trip and start async planning.
   */
  async createTrip(userId, input) {
    const trip = await Trip.create({
      userId,
      status: TRIP_STATUS.PLANNING,
      statusMessage: 'Planning your trip...',
      input: {
        startLocation: input.startLocation,
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        budget: input.budget,
        travelers: input.travelers || 1,
        preferences: input.preferences || {},
      },
    });

    // Start planning asynchronously (don't await — return immediately)
    this._planTripAsync(trip._id).catch((err) => {
      logger.error(`Async trip planning failed for ${trip.tripId}:`, err);
    });

    return { tripId: trip.tripId, status: trip.status };
  }

  /**
   * Get a trip by its public tripId.
   */
  async getTripById(tripId, userId) {
    const trip = await Trip.findOne({ tripId });
    if (!trip) throw AppError.notFound('Trip not found');

    // Check ownership or share token
    if (trip.userId.toString() !== userId && !trip.shareToken) {
      throw AppError.forbidden('You do not have access to this trip');
    }

    return trip;
  }

  /**
   * Get a shared trip (no auth required).
   */
  async getSharedTrip(tripId, shareToken) {
    const trip = await Trip.findOne({ tripId, shareToken });
    if (!trip) throw AppError.notFound('Trip not found or invalid share link');
    return trip;
  }

  /**
   * List all trips for a user with pagination.
   */
  async listTrips(userId, { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [trips, total] = await Promise.all([
      Trip.find(query).sort(sort).skip(skip).limit(limit)
        .select('tripId status statusMessage input.startLocation.name input.destination.name input.startDate input.endDate input.budget createdAt'),
      Trip.countDocuments(query),
    ]);

    return { trips, total, page, limit };
  }

  /**
   * Get trip planning status.
   */
  async getTripStatus(tripId, userId) {
    const trip = await Trip.findOne({ tripId, userId }).select('tripId status statusMessage');
    if (!trip) throw AppError.notFound('Trip not found');
    return { tripId: trip.tripId, status: trip.status, message: trip.statusMessage };
  }

  /**
   * Delete a trip.
   */
  async deleteTrip(tripId, userId) {
    const trip = await Trip.findOneAndDelete({ tripId, userId });
    if (!trip) throw AppError.notFound('Trip not found');
    return true;
  }

  /**
   * Generate a share token for a trip.
   */
  async generateShareToken(tripId, userId) {
    const crypto = require('crypto');
    const shareToken = crypto.randomBytes(16).toString('hex');
    const trip = await Trip.findOneAndUpdate(
      { tripId, userId },
      { shareToken },
      { new: true }
    );
    if (!trip) throw AppError.notFound('Trip not found');
    return { tripId, shareToken };
  }

  /**
   * Internal async planning — fetches all data and generates AI itinerary.
   * @private
   */
  async _planTripAsync(tripMongoId) {
    const trip = await Trip.findById(tripMongoId);
    if (!trip) return;

    const { startLocation, destination, startDate, endDate } = trip.input;
    const checkIn = new Date(startDate).toISOString().split('T')[0];
    const checkOut = new Date(endDate).toISOString().split('T')[0];
    const apiErrors = [];

    logger.info(`Starting trip planning for ${trip.tripId}...`);

    // ── Run all API calls in parallel ──
    const results = await Promise.allSettled([
      drivingService.getDrivingRoute(startLocation, destination),           // 0
      flightService.searchFlights({                                        // 1
        origin: startLocation, destination, departureDate: checkIn,
        adults: trip.input.travelers,
      }),
      trainService.searchRoutes({                                          // 2
        originName: startLocation.name, destinationName: destination.name,
        originCoords: startLocation, destCoords: destination,
      }),
      hotelService.searchHotels({                                          // 3
        destination, checkIn, checkOut, adults: trip.input.travelers,
      }),
      taxiService.searchServices(destination),                             // 4
      placesService.searchAttractions(destination.lat, destination.lng),    // 5
      weatherService.getForecast(destination.lat, destination.lng),         // 6
    ]);

    // ── Extract results (graceful on failures) ──
    const extract = (idx, label) => {
      if (results[idx].status === 'fulfilled') return results[idx].value;
      apiErrors.push({ service: label, error: results[idx].reason?.message || 'Unknown error', timestamp: new Date() });
      logger.warn(`${label} failed:`, results[idx].reason?.message);
      return null;
    };

    const driving = extract(0, 'driving');
    const flights = extract(1, 'flights') || [];
    const trains = extract(2, 'trains') || [];
    const hotels = extract(3, 'hotels') || [];
    const taxis = extract(4, 'taxis') || [];
    const places = extract(5, 'places') || [];
    const weather = extract(6, 'weather');

    // ── Generate AI itinerary ──
    let aiItinerary;
    try {
      trip.statusMessage = 'Generating AI itinerary...';
      await trip.save();

      aiItinerary = await aiService.generateItinerary({
        input: trip.input,
        transport: { driving, flights, trains },
        hotels, places, weather,
      });
    } catch (err) {
      apiErrors.push({ service: 'ai', error: err.message, timestamp: new Date() });
      logger.error('AI itinerary generation failed:', err.message);
      aiItinerary = null;
    }

    // ── Build GeoJSON map data ──
    const mapFeatures = this._buildMapFeatures(trip.input, places, hotels);

    // ── Update trip with all results ──
    const hasAnyData = driving || flights.length || trains.length || hotels.length || places.length;
    trip.status = hasAnyData ? (apiErrors.length ? TRIP_STATUS.PARTIAL : TRIP_STATUS.READY) : TRIP_STATUS.FAILED;
    trip.statusMessage = trip.status === TRIP_STATUS.READY ? 'Trip planned successfully!' : trip.status === TRIP_STATUS.PARTIAL ? 'Trip planned with some services unavailable' : 'Trip planning failed';
    trip.transport = { driving, flights, trains };
    trip.hotels = hotels;
    trip.taxiServices = taxis;
    trip.places = places;
    trip.weather = weather || {};
    trip.aiItinerary = aiItinerary || {};
    trip.mapData = { type: 'FeatureCollection', features: mapFeatures };
    trip.apiErrors = apiErrors;

    await trip.save();
    logger.info(`Trip ${trip.tripId} planning complete — status: ${trip.status}`);
  }

  /**
   * Build GeoJSON features for the interactive map.
   * @private
   */
  _buildMapFeatures(input, places, hotels) {
    const features = [];

    // Start location
    features.push({
      type: 'Feature',
      properties: { type: 'start', name: input.startLocation.name, icon: 'start' },
      geometry: { type: 'Point', coordinates: [input.startLocation.lng, input.startLocation.lat] },
    });

    // Destination
    features.push({
      type: 'Feature',
      properties: { type: 'destination', name: input.destination.name, icon: 'destination' },
      geometry: { type: 'Point', coordinates: [input.destination.lng, input.destination.lat] },
    });

    // Hotels
    (hotels || []).forEach((h) => {
      if (h.lat && h.lng) {
        features.push({
          type: 'Feature',
          properties: { type: 'hotel', name: h.name, price: h.price?.perNight },
          geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
        });
      }
    });

    // Attractions
    (places || []).forEach((p) => {
      if (p.lat && p.lng) {
        features.push({
          type: 'Feature',
          properties: { type: 'attraction', name: p.name, category: p.category },
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        });
      }
    });

    return features;
  }
}

module.exports = new TripService();
