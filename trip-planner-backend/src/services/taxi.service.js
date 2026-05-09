/**
 * Taxi & Car Rental Service
 * ─────────────────────────
 * Google Maps Places API for finding taxi services, car rentals,
 * and ride-hailing options at the destination.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

class TaxiService {
  constructor() {
    this.apiKey = env.googleMapsApiKey;
  }

  /**
   * Search for taxi and car rental services near a location.
   * @param {{ lat: number, lng: number }} location
   * @param {number} [radius=10000] — Search radius in meters
   * @returns {Array} Combined taxi + car rental results
   */
  async searchServices(location, radius = 10000) {
    try {
      const [taxis, rentals, rideHailing] = await Promise.allSettled([
        this._searchCategory(location, 'taxi service', 'taxi', radius),
        this._searchCategory(location, 'car rental', 'rental_car', radius),
        this._searchRideHailing(location),
      ]);

      const results = [];
      if (taxis.status === 'fulfilled') results.push(...taxis.value);
      if (rentals.status === 'fulfilled') results.push(...rentals.value);
      if (rideHailing.status === 'fulfilled') results.push(...rideHailing.value);

      return results;
    } catch (error) {
      logger.error('Taxi service search error:', error.message);
      return [];
    }
  }

  async _searchCategory(location, query, type, radius) {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE}/place/textsearch/json`, {
        params: {
          query: `${query} near ${location.lat},${location.lng}`,
          location: `${location.lat},${location.lng}`,
          radius, key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') return [];

      return (response.data.results || []).slice(0, 10).map(place => ({
        name: place.name,
        type,
        phone: place.formatted_phone_number || '',
        website: '',
        rating: place.rating || 0,
        totalRatings: place.user_ratings_total || 0,
        address: place.formatted_address || place.vicinity || '',
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        priceLevel: place.price_level || null,
        openNow: place.opening_hours?.open_now || null,
        deepLink: null,
      }));
    } catch (error) {
      logger.error(`${type} search error:`, error.message);
      return [];
    }
  }

  /**
   * Add common ride-hailing deep links (Uber, Ola, Lyft).
   */
  _searchRideHailing(location) {
    return Promise.resolve([
      {
        name: 'Uber',
        type: 'ride_hailing',
        phone: '', website: 'https://www.uber.com',
        rating: 4.5, totalRatings: null,
        address: 'Available in most cities',
        lat: location.lat, lng: location.lng,
        priceLevel: null, openNow: true,
        deepLink: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}`,
      },
      {
        name: 'Ola Cabs',
        type: 'ride_hailing',
        phone: '', website: 'https://www.olacabs.com',
        rating: 4.3, totalRatings: null,
        address: 'Available in major Indian cities',
        lat: location.lat, lng: location.lng,
        priceLevel: null, openNow: true,
        deepLink: `https://book.olacabs.com/?lat=${location.lat}&lng=${location.lng}`,
      },
      {
        name: 'Rapido',
        type: 'ride_hailing',
        phone: '', website: 'https://www.rapido.bike',
        rating: 4.0, totalRatings: null,
        address: 'Bike taxi — available in select Indian cities',
        lat: location.lat, lng: location.lng,
        priceLevel: null, openNow: true,
        deepLink: 'https://www.rapido.bike',
      },
    ]);
  }
}

module.exports = new TaxiService();
