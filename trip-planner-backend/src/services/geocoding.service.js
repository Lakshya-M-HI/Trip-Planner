/**
 * Geocoding Service
 * ─────────────────
 * Google Maps Geocoding, Reverse Geocoding, and Places Autocomplete.
 * Converts location names ↔ coordinates.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

class GeocodingService {
  constructor() {
    this.apiKey = env.googleMapsApiKey;
  }

  /**
   * Convert an address string to coordinates.
   * @param {string} address — e.g., "Mumbai, India"
   * @returns {{ lat, lng, formattedAddress, placeId }}
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/geocode/json`, {
        params: {
          address,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        logger.warn(`Geocoding failed for address: "${address}" — Status: ${response.data.status}`);
        throw AppError.badRequest(`Could not geocode address: "${address}"`);
      }

      const result = response.data.results[0];

      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        components: this._parseAddressComponents(result.address_components),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Geocoding API error:', error.message);
      throw AppError.internal('Geocoding service unavailable');
    }
  }

  /**
   * Convert coordinates to a human-readable address.
   * @param {number} lat
   * @param {number} lng
   * @returns {{ formattedAddress, city, state, country, placeId }}
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        logger.warn(`Reverse geocoding failed for: ${lat},${lng}`);
        throw AppError.badRequest('Could not determine address from coordinates');
      }

      const result = response.data.results[0];
      const components = this._parseAddressComponents(result.address_components);

      return {
        formattedAddress: result.formatted_address,
        city: components.city,
        state: components.state,
        country: components.country,
        placeId: result.place_id,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Reverse geocoding API error:', error.message);
      throw AppError.internal('Reverse geocoding service unavailable');
    }
  }

  /**
   * Get autocomplete suggestions for a partial location query.
   * @param {string} query — Partial input text
   * @param {string} [sessionToken] — Session token for billing
   * @returns {Array<{ placeId, description, mainText, secondaryText }>}
   */
  async autocomplete(query, sessionToken) {
    try {
      const params = {
        input: query,
        types: '(cities)',  // Prefer city-level results
        key: this.apiKey,
      };

      if (sessionToken) {
        params.sessiontoken = sessionToken;
      }

      const response = await axios.get(`${GOOGLE_MAPS_BASE}/place/autocomplete/json`, {
        params,
        timeout: 10000,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        logger.warn(`Autocomplete failed: ${response.data.status}`);
        return [];
      }

      return (response.data.predictions || []).map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text || '',
        secondaryText: prediction.structured_formatting?.secondary_text || '',
      }));
    } catch (error) {
      logger.error('Autocomplete API error:', error.message);
      return []; // Graceful degradation
    }
  }

  /**
   * Get detailed place information from a place ID.
   * @param {string} placeId
   * @returns {{ name, lat, lng, formattedAddress }}
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,geometry,formatted_address,address_components',
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        throw AppError.badRequest('Could not get place details');
      }

      const result = response.data.result;

      return {
        name: result.name,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        components: this._parseAddressComponents(result.address_components || []),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Place details API error:', error.message);
      throw AppError.internal('Place details service unavailable');
    }
  }

  /**
   * Parse address components into a structured object.
   * @private
   */
  _parseAddressComponents(components) {
    const parsed = { city: '', state: '', country: '', countryCode: '', postalCode: '' };

    for (const component of components) {
      const types = component.types;
      if (types.includes('locality')) {
        parsed.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name;
      } else if (types.includes('country')) {
        parsed.country = component.long_name;
        parsed.countryCode = component.short_name;
      } else if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name;
      }
    }

    return parsed;
  }
}

module.exports = new GeocodingService();
