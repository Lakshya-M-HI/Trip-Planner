/**
 * Train & Multi-Modal Transport Service
 * ──────────────────────────────────────
 * Rome2rio API integration for trains, buses, ferries.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

const ROME2RIO_BASE = 'https://free.rome2rio.com/api/1.4/json';

class TrainService {
  constructor() {
    this.apiKey = env.rome2rioApiKey;
  }

  async searchRoutes({ originName, destinationName, originCoords, destCoords }) {
    if (!this.apiKey) {
      logger.warn('Rome2rio not configured');
      return [];
    }
    try {
      const params = { key: this.apiKey, oName: originName, dName: destinationName };
      if (originCoords) params.oPos = `${originCoords.lat},${originCoords.lng}`;
      if (destCoords) params.dPos = `${destCoords.lat},${destCoords.lng}`;

      const response = await axios.get(`${ROME2RIO_BASE}/Search`, { params, timeout: 20000 });
      if (!response.data?.routes) return [];

      return response.data.routes
        .filter((r) => !(r.name || '').toLowerCase().startsWith('walk'))
        .map((route) => {
          const data = response.data;
          const segments = (route.segments || []).map((seg) => ({
            vehicle: seg.segmentKind || 'other',
            from: data.places?.[seg.sPlace]?.shortName || '',
            to: data.places?.[seg.tPlace]?.shortName || '',
            duration: route.totalDuration ? `${Math.floor(route.totalDuration/60)}h ${Math.round(route.totalDuration%60)}m` : '',
            operator: data.agencies?.[seg.agencies?.[0]?.agency]?.name || '',
          }));
          const prices = route.indicativePrices || [];
          const pLow = prices.length ? Math.min(...prices.map(p => p.priceLow || p.price || 0)) : 0;
          const pHigh = prices.length ? Math.max(...prices.map(p => p.priceHigh || p.price || 0)) : 0;
          let bookingUrl = '';
          for (const seg of route.segments || []) {
            for (const ag of seg.agencies || []) {
              const url = data.agencies?.[ag.agency]?.url;
              if (url) { bookingUrl = url; break; }
            }
            if (bookingUrl) break;
          }
          return {
            name: route.name || 'Unknown', operator: segments[0]?.operator || '',
            vehicle: [...new Set(segments.map(s => s.vehicle))].join(', '),
            departure: { station: segments[0]?.from || '', dateTime: '' },
            arrival: { station: segments[segments.length-1]?.to || '', dateTime: '' },
            duration: route.totalDuration ? `${Math.floor(route.totalDuration/60)}h ${Math.round(route.totalDuration%60)}m` : '',
            durationMinutes: route.totalDuration || 0,
            price: { low: Math.round(pLow), high: Math.round(pHigh), currency: prices[0]?.currency || 'USD' },
            bookingUrl, segments,
          };
        }).slice(0, 15);
    } catch (error) {
      logger.error('Rome2rio error:', error.message);
      return [];
    }
  }
}

module.exports = new TrainService();
