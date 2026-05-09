/**
 * Places / Tourist Attractions Service
 * ─────────────────────────────────────
 * Foursquare Places API v3 for discovering tourist attractions,
 * landmarks, and points of interest near the destination.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');
const { FOURSQUARE_CATEGORIES } = require('../utils/constants');

const FSQ_BASE = 'https://api.foursquare.com/v3';

class PlacesService {
  constructor() {
    this.apiKey = env.foursquareApiKey;
  }

  async searchAttractions(lat, lng, radius = 15000) {
    if (!this.apiKey) { logger.warn('Foursquare not configured'); return []; }
    try {
      const categories = [
        FOURSQUARE_CATEGORIES.TOURIST_ATTRACTION,
        FOURSQUARE_CATEGORIES.LANDMARK,
        FOURSQUARE_CATEGORIES.MUSEUM,
        FOURSQUARE_CATEGORIES.PARK,
        FOURSQUARE_CATEGORIES.TEMPLE,
        FOURSQUARE_CATEGORIES.BEACH,
      ].join(',');

      const response = await axios.get(`${FSQ_BASE}/places/search`, {
        headers: { Authorization: this.apiKey, Accept: 'application/json' },
        params: { ll: `${lat},${lng}`, categories, radius, sort: 'RELEVANCE', limit: 20 },
        timeout: 10000,
      });

      if (!response.data?.results) return [];

      return response.data.results.map(place => ({
        name: place.name || '',
        fsqId: place.fsq_id || '',
        category: place.categories?.[0]?.name || 'Attraction',
        categoryIcon: place.categories?.[0]?.icon
          ? `${place.categories[0].icon.prefix}64${place.categories[0].icon.suffix}` : '',
        rating: place.rating || null,
        address: place.location?.formatted_address || place.location?.address || '',
        distance: place.distance || 0,
        lat: place.geocodes?.main?.latitude || lat,
        lng: place.geocodes?.main?.longitude || lng,
        photos: [], tips: [],
        popularity: place.popularity || 0,
        openingHours: '', website: place.website || '',
      }));
    } catch (error) {
      logger.error('Foursquare search error:', error.message);
      return [];
    }
  }

  async getPlacePhotos(fsqId) {
    if (!this.apiKey || !fsqId) return [];
    try {
      const response = await axios.get(`${FSQ_BASE}/places/${fsqId}/photos`, {
        headers: { Authorization: this.apiKey },
        params: { limit: 5 },
        timeout: 10000,
      });
      return (response.data || []).map(p => `${p.prefix}original${p.suffix}`);
    } catch (error) {
      logger.error('Foursquare photos error:', error.message);
      return [];
    }
  }
}

module.exports = new PlacesService();
