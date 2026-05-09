/**
 * Express Application Setup
 * ─────────────────────────
 * Configures Express with all middleware in the correct order.
 * Exports the app instance (separate from server start for testability).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const AppError = require('./utils/AppError');

const app = express();

// ═══════════════════════════════════════════════════
// 1. SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true, // Allow cookies (refresh token)
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Prevent HTTP parameter pollution
app.use(hpp());

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// ═══════════════════════════════════════════════════
// 2. PARSING MIDDLEWARE
// ═══════════════════════════════════════════════════

// Parse JSON bodies (limit to 10KB to prevent abuse)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies (for refresh token)
app.use(cookieParser());

// Compress responses
app.use(compression());

// ═══════════════════════════════════════════════════
// 3. LOGGING
// ═══════════════════════════════════════════════════

// HTTP request logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  // In production, log to Winston
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ═══════════════════════════════════════════════════
// 4. RATE LIMITING
// ═══════════════════════════════════════════════════

app.use('/api', generalLimiter);

// ═══════════════════════════════════════════════════
// 5. ROUTES
// ═══════════════════════════════════════════════════

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Trip Planner API is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Mount all API routes
app.use('/api', routes);

// ═══════════════════════════════════════════════════
// 6. ERROR HANDLING
// ═══════════════════════════════════════════════════

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
