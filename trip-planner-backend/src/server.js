/**
 * Server Entry Point
 * ──────────────────
 * Starts the Express server and connects to MongoDB.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB, disconnectDB } = require('./config/db');

// ── Price Alert Cron Job ──
const cron = require('node-cron');
const { PRICE_ALERT_CRON } = require('./utils/constants');

let server;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the Express server
    server = app.listen(env.port, () => {
      logger.info(`
  ╔══════════════════════════════════════════════════╗
  ║       🌍 AI Trip Planner API Server             ║
  ╠══════════════════════════════════════════════════╣
  ║  Port:        ${String(env.port).padEnd(33)}║
  ║  Environment: ${env.nodeEnv.padEnd(33)}║
  ║  Health:      http://localhost:${env.port}/api/health  ║
  ╚══════════════════════════════════════════════════╝
      `);
    });

    // ── Start price alert cron job ──
    cron.schedule(PRICE_ALERT_CRON, async () => {
      logger.info('Running price alert check...');
      try {
        const PriceAlert = require('./models/priceAlert.model');
        const alerts = await PriceAlert.find({ isActive: true, isTriggered: false });
        logger.info(`Checking ${alerts.length} active price alerts`);
        // TODO: Implement actual price checking against APIs
        // For each alert, re-query the relevant API and compare prices
      } catch (err) {
        logger.error('Price alert cron error:', err.message);
      }
    });

    // ── Graceful shutdown ──
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await disconnectDB();

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30s timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      // Give time for logging, then exit
      setTimeout(() => process.exit(1), 1000);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
