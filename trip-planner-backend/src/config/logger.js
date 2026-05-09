/**
 * Logger Configuration
 * ────────────────────
 * Winston logger with structured JSON logging for production
 * and colorized console output for development.
 */

const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development — human-readable with colors
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `${ts} ${level}: ${stack || message}${metaStr}`;
  })
);

// Structured JSON format for production — parseable by log aggregators
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const isDev = (process.env.NODE_ENV || 'development') === 'development';

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  defaultMeta: { service: 'trip-planner-api' },
  transports: [
    // Always log to console
    new winston.transports.Console(),

    // In production, also log errors to a file
    ...(isDev
      ? []
      : [
          new winston.transports.File({
            filename: path.resolve(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.resolve(__dirname, '../../logs/combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          }),
        ]),
  ],
  // Don't crash on uncaught exceptions — log them instead
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
