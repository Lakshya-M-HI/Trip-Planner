/**
 * Hotel Search Service
 * ────────────────────
 * Amadeus API integration for searching hotels.
 */

const Amadeus = require('amadeus');
const env = require('../config/env');
const logger = require('../config/logger');

class HotelService {
  constructor() {
    this.client = null;
    if (env.amadeusClientId && env.amadeusClientSecret) {
      this.client = new Amadeus({ clientId: env.amadeusClientId, clientSecret: env.amadeusClientSecret });
    }
  }

  async searchHotels({ destination, checkIn, checkOut, adults = 1, maxResults = 15 }) {
    if (!this.client) { logger.warn('Amadeus not configured — hotel search disabled'); return []; }
    try {
      // Step 1: Find hotels by geocoordinates
      const hotelListResp = await this.client.referenceData.locations.hotels.byGeocode.get({
        latitude: destination.lat, longitude: destination.lng, radius: 30, radiusUnit: 'KM',
        hotelSource: 'ALL',
      });
      if (!hotelListResp.data?.length) { logger.info('No hotels found'); return []; }

      const hotelIds = hotelListResp.data.slice(0, Math.min(maxResults, 20)).map(h => h.hotelId);

      // Step 2: Get offers for those hotels
      const offersResp = await this.client.shopping.hotelOffersSearch.get({
        hotelIds: hotelIds.join(','), checkInDate: checkIn, checkOutDate: checkOut,
        adults: String(adults), currency: 'INR', bestRateOnly: true,
      });

      if (!offersResp.data?.length) return [];

      return offersResp.data.map(hotel => {
        const offer = hotel.offers?.[0];
        const price = offer?.price;
        const nights = this._calcNights(checkIn, checkOut);
        return {
          name: hotel.hotel?.name || 'Unknown Hotel',
          hotelId: hotel.hotel?.hotelId || '',
          starRating: hotel.hotel?.rating ? parseInt(hotel.hotel.rating) : null,
          address: [hotel.hotel?.address?.lines, hotel.hotel?.address?.cityName, hotel.hotel?.address?.countryCode].filter(Boolean).flat().join(', '),
          lat: hotel.hotel?.latitude || destination.lat,
          lng: hotel.hotel?.longitude || destination.lng,
          price: {
            perNight: price?.total ? Math.round(parseFloat(price.total) / nights) : 0,
            total: price?.total ? Math.round(parseFloat(price.total)) : 0,
            currency: price?.currency || 'INR',
          },
          amenities: hotel.hotel?.amenities || [],
          rating: { score: null, reviews: null },
          bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(hotel.hotel?.name || '')}`,
          checkIn, checkOut, roomType: offer?.room?.description?.text || '',
        };
      });
    } catch (error) {
      logger.error('Hotel search error:', error.message);
      return [];
    }
  }

  _calcNights(checkIn, checkOut) {
    const d1 = new Date(checkIn); const d2 = new Date(checkOut);
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  }
}

module.exports = new HotelService();
