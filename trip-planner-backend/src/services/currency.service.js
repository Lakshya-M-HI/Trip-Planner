/**
 * Currency Conversion Service
 * ───────────────────────────
 * Exchange rate API for multi-currency support.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

class CurrencyService {
  constructor() {
    this.apiKey = env.exchangeRateApiKey;
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours
  }

  /**
   * Get exchange rates for a base currency.
   * @param {string} baseCurrency — e.g., 'USD'
   * @returns {{ rates: object, lastUpdated: string }}
   */
  async getExchangeRates(baseCurrency = 'USD') {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    if (!this.apiKey) { logger.warn('Exchange rate API not configured'); return { rates: {}, lastUpdated: '' }; }

    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${baseCurrency}`,
        { timeout: 10000 }
      );

      if (response.data?.result !== 'success') {
        logger.warn('Exchange rate API failed:', response.data?.['error-type']);
        return { rates: {}, lastUpdated: '' };
      }

      const data = {
        rates: response.data.conversion_rates || {},
        lastUpdated: response.data.time_last_update_utc || '',
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      logger.error('Currency API error:', error.message);
      return { rates: {}, lastUpdated: '' };
    }
  }

  /**
   * Convert an amount from one currency to another.
   * @param {number} amount
   * @param {string} from — Source currency code
   * @param {string} to — Target currency code
   * @returns {{ convertedAmount: number, rate: number }}
   */
  async convert(amount, from, to) {
    if (from === to) return { convertedAmount: amount, rate: 1 };

    try {
      const { rates } = await this.getExchangeRates(from);
      const rate = rates[to];
      if (!rate) {
        logger.warn(`Exchange rate not found: ${from} → ${to}`);
        return { convertedAmount: amount, rate: 1 };
      }
      return { convertedAmount: Math.round(amount * rate * 100) / 100, rate };
    } catch {
      return { convertedAmount: amount, rate: 1 };
    }
  }
}

module.exports = new CurrencyService();
