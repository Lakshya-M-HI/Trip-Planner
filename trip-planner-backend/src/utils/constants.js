/**
 * Application Constants
 * ─────────────────────
 * Centralized constant values used across the application.
 */

module.exports = {
  // ── Trip statuses ──
  TRIP_STATUS: {
    PLANNING: 'planning',
    READY: 'ready',
    FAILED: 'failed',
    PARTIAL: 'partial', // Some API calls failed but trip is usable
  },

  // ── Supported currencies ──
  CURRENCIES: [
    'INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD', 'AED',
    'THB', 'MYR', 'CHF', 'CNY', 'KRW', 'NZD', 'ZAR', 'BRL', 'MXN',
  ],

  DEFAULT_CURRENCY: 'INR',

  // ── Rate limiting ──
  RATE_LIMIT: {
    GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,                  // 100 requests per window
    },
    AUTH: {
      windowMs: 15 * 60 * 1000,
      max: 20,                   // 20 auth requests per window
    },
    TRIP_CREATE: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,                   // 10 trip creations per hour
    },
  },

  // ── Pagination defaults ──
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },

  // ── Foursquare category IDs ──
  FOURSQUARE_CATEGORIES: {
    TOURIST_ATTRACTION: '16000',
    LANDMARK: '16026',
    ARTS_ENTERTAINMENT: '10000',
    MUSEUM: '10010',
    PARK: '16032',
    TEMPLE: '12109',
    BEACH: '16003',
    SHOPPING: '17000',
    RESTAURANT: '13000',
  },

  // ── Trip ID length ──
  TRIP_ID_LENGTH: 10,

  // ── Token cookie config ──
  REFRESH_TOKEN_COOKIE: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/api/auth',
    },
  },

  // ── Price alert check interval (cron expression) ──
  PRICE_ALERT_CRON: '0 */6 * * *', // Every 6 hours

  // ── AI budget tiers ──
  BUDGET_TIERS: ['budget', 'moderate', 'premium'],
};
