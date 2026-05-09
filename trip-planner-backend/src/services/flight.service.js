/**
 * Flight Search Service
 * ─────────────────────
 * Amadeus API integration for searching flights.
 * Includes airport code resolution and flight offer search.
 */

const Amadeus = require('amadeus');
const env = require('../config/env');
const logger = require('../config/logger');

class FlightService {
  constructor() {
    this.client = null;
    this._initClient();
  }

  /**
   * Initialize the Amadeus client.
   * Deferred so the app boots even if keys are missing.
   */
  _initClient() {
    try {
      if (env.amadeusClientId && env.amadeusClientSecret) {
        this.client = new Amadeus({
          clientId: env.amadeusClientId,
          clientSecret: env.amadeusClientSecret,
        });
        logger.info('Amadeus client initialized');
      } else {
        logger.warn('Amadeus API keys not configured — flight search disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Amadeus client:', error.message);
    }
  }

  /**
   * Find the nearest airport to given coordinates.
   * @param {number} lat
   * @param {number} lng
   * @returns {{ iataCode, name, city }|null}
   */
  async findNearestAirport(lat, lng) {
    if (!this.client) return null;

    try {
      const response = await this.client.referenceData.locations.airports.get({
        latitude: lat,
        longitude: lng,
        radius: 500, // km
        sort: 'distance',
        'page[limit]': 1,
      });

      if (!response.data || response.data.length === 0) {
        logger.warn(`No airports found near ${lat},${lng}`);
        return null;
      }

      const airport = response.data[0];
      return {
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.address?.cityName || '',
        distance: airport.distance?.value || 0,
        distanceUnit: airport.distance?.unit || 'KM',
      };
    } catch (error) {
      logger.error('Airport search error:', error.message);
      return null;
    }
  }

  /**
   * Search for available flights.
   * @param {object} params
   * @param {{ lat, lng }} params.origin — Origin coordinates
   * @param {{ lat, lng }} params.destination — Destination coordinates
   * @param {string} params.departureDate — YYYY-MM-DD
   * @param {string} [params.returnDate] — YYYY-MM-DD (for round trips)
   * @param {number} [params.adults=1] — Number of travelers
   * @param {string} [params.travelClass] — ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
   * @param {number} [params.maxResults=10]
   * @returns {Array} Flight offers
   */
  async searchFlights({ origin, destination, departureDate, returnDate, adults = 1, travelClass, maxResults = 10 }) {
    if (!this.client) {
      logger.warn('Flight search skipped — Amadeus not configured');
      return [];
    }

    try {
      // Resolve IATA codes from coordinates
      const [originAirport, destAirport] = await Promise.all([
        this.findNearestAirport(origin.lat, origin.lng),
        this.findNearestAirport(destination.lat, destination.lng),
      ]);

      if (!originAirport || !destAirport) {
        logger.warn('Could not resolve airports for flight search');
        return [];
      }

      // Build search params
      const searchParams = {
        originLocationCode: originAirport.iataCode,
        destinationLocationCode: destAirport.iataCode,
        departureDate,
        adults: String(adults),
        max: String(maxResults),
        currencyCode: 'INR',
      };

      if (returnDate) {
        searchParams.returnDate = returnDate;
      }

      if (travelClass) {
        searchParams.travelClass = travelClass;
      }

      const response = await this.client.shopping.flightOffersSearch.get(searchParams);

      if (!response.data || response.data.length === 0) {
        logger.info('No flights found for the given criteria');
        return [];
      }

      // Transform Amadeus response to our schema
      return response.data.map((offer) => this._transformFlightOffer(offer, originAirport, destAirport));
    } catch (error) {
      logger.error('Flight search error:', error.message);
      return []; // Graceful degradation
    }
  }

  /**
   * Transform Amadeus flight offer to our schema format.
   * @private
   */
  _transformFlightOffer(offer, originAirport, destAirport) {
    const firstSegment = offer.itineraries?.[0]?.segments?.[0];
    const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0];
    const segments = offer.itineraries?.[0]?.segments || [];

    return {
      airline: firstSegment?.carrierCode || 'Unknown',
      flightNumber: firstSegment ? `${firstSegment.carrierCode}${firstSegment.number}` : '',
      departure: {
        airport: originAirport.name,
        iataCode: firstSegment?.departure?.iataCode || originAirport.iataCode,
        dateTime: firstSegment?.departure?.at || '',
      },
      arrival: {
        airport: destAirport.name,
        iataCode: lastSegment?.arrival?.iataCode || destAirport.iataCode,
        dateTime: lastSegment?.arrival?.at || '',
      },
      duration: offer.itineraries?.[0]?.duration || '',
      stops: Math.max(0, segments.length - 1),
      price: {
        amount: parseFloat(offer.price?.grandTotal) || 0,
        currency: offer.price?.currency || 'INR',
      },
      cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || '',
      seatsAvailable: offer.numberOfBookableSeats || 0,
      bookingUrl: `https://www.google.com/travel/flights?q=flights+from+${originAirport.iataCode}+to+${destAirport.iataCode}`,
    };
  }
}

module.exports = new FlightService();
