/**
 * Driving Route Service
 * ─────────────────────
 * Google Maps Directions & Distance Matrix APIs.
 * Calculates driving routes, distances, durations, and fuel estimates.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

// Average fuel consumption and price (defaults — can be made configurable)
const AVG_FUEL_CONSUMPTION_KM_PER_LITER = 15;
const AVG_FUEL_PRICE_PER_LITER_INR = 105;

class DrivingService {
  constructor() {
    this.apiKey = env.googleMapsApiKey;
  }

  /**
   * Get driving route between two locations.
   * @param {{ lat: number, lng: number }} origin
   * @param {{ lat: number, lng: number }} destination
   * @returns {object} Driving details including distance, duration, steps, fuel estimate
   */
  async getDrivingRoute(origin, destination) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/directions/json`, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: 'driving',
          alternatives: false,
          key: this.apiKey,
        },
        timeout: 15000,
      });

      if (response.data.status !== 'OK' || !response.data.routes.length) {
        logger.warn(`Driving route not found: ${response.data.status}`);
        return null;
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      // Calculate fuel estimate
      const distanceKm = leg.distance.value / 1000;
      const fuelLiters = distanceKm / AVG_FUEL_CONSUMPTION_KM_PER_LITER;
      const fuelCost = fuelLiters * AVG_FUEL_PRICE_PER_LITER_INR;

      return {
        distance: {
          text: leg.distance.text,
          value: leg.distance.value, // meters
        },
        duration: {
          text: leg.duration.text,
          value: leg.duration.value, // seconds
        },
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        polyline: route.overview_polyline?.points || '',
        fuelEstimate: {
          liters: Math.round(fuelLiters * 10) / 10,
          costEstimate: {
            amount: Math.round(fuelCost),
            currency: 'INR',
          },
        },
        tolls: {
          estimated: this._estimateTolls(distanceKm),
          currency: 'INR',
        },
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
          distance: {
            text: step.distance.text,
            value: step.distance.value,
          },
          duration: {
            text: step.duration.text,
            value: step.duration.value,
          },
        })),
      };
    } catch (error) {
      logger.error('Driving route API error:', error.message);
      return null; // Graceful degradation — driving data is supplementary
    }
  }

  /**
   * Get distance matrix for multiple origins/destinations.
   * @param {string[]} origins — Array of "lat,lng" strings
   * @param {string[]} destinations — Array of "lat,lng" strings
   * @returns {object} Distance matrix results
   */
  async getDistanceMatrix(origins, destinations) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/distancematrix/json`, {
        params: {
          origins: origins.join('|'),
          destinations: destinations.join('|'),
          mode: 'driving',
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        logger.warn(`Distance matrix failed: ${response.data.status}`);
        return null;
      }

      return response.data.rows.map((row) =>
        row.elements.map((element) => ({
          distance: element.distance,
          duration: element.duration,
          status: element.status,
        }))
      );
    } catch (error) {
      logger.error('Distance matrix API error:', error.message);
      return null;
    }
  }

  /**
   * Rough toll estimation based on distance (India-centric, approximate).
   * @private
   */
  _estimateTolls(distanceKm) {
    if (distanceKm < 50) return 0;
    // Rough estimate: ₹1.5-2 per km for highway tolls in India
    return Math.round(distanceKm * 1.75);
  }
}

module.exports = new DrivingService();
