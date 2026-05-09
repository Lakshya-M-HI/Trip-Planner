/**
 * Database Configuration
 * ──────────────────────
 * MongoDB connection with Mongoose.
 * Includes retry logic and graceful shutdown handling.
 */

const mongoose = require('mongoose');
const logger = require('./logger');
const env = require('./env');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

/**
 * Connect to MongoDB with retry logic.
 * In production, the app will retry up to MAX_RETRIES times before failing.
 */
async function connectDB(retryCount = 0) {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      // Mongoose 8+ uses these by default, but explicit for clarity
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error(
      `❌ MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES} failed: ${error.message}`
    );

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`   Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB(retryCount + 1);
    }

    logger.error('❌ All MongoDB connection attempts failed. Exiting.');
    process.exit(1);
  }
}

/**
 * Gracefully close the database connection.
 * Called during shutdown signals (SIGTERM, SIGINT).
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
}

module.exports = { connectDB, disconnectDB };
