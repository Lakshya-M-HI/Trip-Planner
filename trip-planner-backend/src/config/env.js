/**
 * Environment Configuration
 * ─────────────────────────
 * Centralized environment variable loading and validation.
 * Fails fast on missing critical variables so you never get
 * mysterious runtime errors in production.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates that all required environment variables are set.
 * Throws a clear error listing every missing variable.
 */
const requiredVars = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'GOOGLE_MAPS_API_KEY',
  'AMADEUS_CLIENT_ID',
  'AMADEUS_CLIENT_SECRET',
  'ROME2RIO_API_KEY',
  'FOURSQUARE_API_KEY',
  'GEMINI_API_KEY',
  'OPENWEATHER_API_KEY',
  'EXCHANGE_RATE_API_KEY',
];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(
    `\n❌ FATAL: Missing required environment variables:\n   ${missing.join('\n   ')}\n`
  );
  process.exit(1);
}

if (missing.length > 0) {
  console.warn(
    `\n⚠️  WARNING: Missing environment variables (non-fatal in dev):\n   ${missing.join('\n   ')}\n`
  );
}

const env = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-planner',

  // JWT
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',

  // External APIs
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  amadeusClientId: process.env.AMADEUS_CLIENT_ID || '',
  amadeusClientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
  rome2rioApiKey: process.env.ROME2RIO_API_KEY || '',
  foursquareApiKey: process.env.FOURSQUARE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || '',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = env;
