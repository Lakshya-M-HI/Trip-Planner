/**
 * Price Alert Model
 * ─────────────────
 * Stores user price alerts for flights and hotels.
 * A cron job periodically checks prices and updates alert status.
 */

const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    tripId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['flight', 'hotel'],
      required: true,
    },

    // Search criteria to re-query the API
    criteria: {
      // For flights
      origin: String,
      destination: String,
      date: Date,
      // For hotels
      cityCode: String,
      checkIn: Date,
      checkOut: Date,
    },

    // Price tracking
    initialPrice: {
      type: Number,
      required: true,
    },

    currentPrice: {
      type: Number,
      default: null,
    },

    targetPrice: {
      type: Number,
      required: true,
    },

    lowestPrice: {
      type: Number,
      default: null,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isTriggered: {
      type: Boolean,
      default: false,
    },

    triggeredAt: {
      type: Date,
      default: null,
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },

    priceHistory: [
      {
        price: Number,
        checkedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes
priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ isActive: 1, lastCheckedAt: 1 });

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

module.exports = PriceAlert;
