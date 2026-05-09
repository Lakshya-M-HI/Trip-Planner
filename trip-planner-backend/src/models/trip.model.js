/**
 * Trip Model
 * ──────────
 * Comprehensive schema for storing trip plans.
 * Contains user input, aggregated API data, and AI-generated itinerary.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { TRIP_STATUS, TRIP_ID_LENGTH } = require('../utils/constants');

// ── Sub-schemas ──

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    formattedAddress: { type: String, default: '' },
    placeId: { type: String, default: '' },
  },
  { _id: false }
);

const flightSchema = new mongoose.Schema(
  {
    airline: String,
    flightNumber: String,
    departure: {
      airport: String,
      iataCode: String,
      dateTime: String,
    },
    arrival: {
      airport: String,
      iataCode: String,
      dateTime: String,
    },
    duration: String,
    stops: { type: Number, default: 0 },
    price: {
      amount: Number,
      currency: String,
    },
    cabin: String,
    bookingUrl: String,
    seatsAvailable: Number,
  },
  { _id: false }
);

const trainRouteSchema = new mongoose.Schema(
  {
    name: String,
    operator: String,
    vehicle: String,       // 'train', 'bus', 'ferry'
    departure: {
      station: String,
      dateTime: String,
    },
    arrival: {
      station: String,
      dateTime: String,
    },
    duration: String,
    durationMinutes: Number,
    price: {
      low: Number,
      high: Number,
      currency: String,
    },
    bookingUrl: String,
    segments: [
      {
        vehicle: String,
        from: String,
        to: String,
        duration: String,
        operator: String,
      },
    ],
  },
  { _id: false }
);

const drivingSchema = new mongoose.Schema(
  {
    distance: { text: String, value: Number },       // e.g., "450 km", 450000 (meters)
    duration: { text: String, value: Number },       // e.g., "5 hours 30 min", 19800 (seconds)
    startAddress: String,
    endAddress: String,
    polyline: String,                                 // Encoded polyline for map rendering
    fuelEstimate: {
      liters: Number,
      costEstimate: { amount: Number, currency: String },
    },
    tolls: { estimated: Number, currency: String },
    steps: [
      {
        instruction: String,
        distance: { text: String, value: Number },
        duration: { text: String, value: Number },
      },
    ],
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    hotelId: String,
    starRating: Number,
    address: String,
    lat: Number,
    lng: Number,
    price: {
      perNight: Number,
      total: Number,
      currency: String,
    },
    amenities: [String],
    rating: { score: Number, reviews: Number },
    photos: [String],
    bookingUrl: String,
    checkIn: String,
    checkOut: String,
    roomType: String,
  },
  { _id: false }
);

const taxiServiceSchema = new mongoose.Schema(
  {
    name: String,
    type: { type: String, enum: ['taxi', 'rental_car', 'ride_hailing'] },
    phone: String,
    website: String,
    rating: Number,
    totalRatings: Number,
    address: String,
    lat: Number,
    lng: Number,
    priceLevel: Number,
    openNow: Boolean,
    deepLink: String,           // Uber/Ola/Lyft deep link
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: String,
    fsqId: String,
    category: String,
    categoryIcon: String,
    rating: Number,
    address: String,
    distance: Number,            // in meters from destination
    lat: Number,
    lng: Number,
    photos: [String],
    tips: [String],
    popularity: Number,
    openingHours: String,
    website: String,
  },
  { _id: false }
);

const weatherDaySchema = new mongoose.Schema(
  {
    date: String,
    tempMin: Number,
    tempMax: Number,
    feelsLike: Number,
    humidity: Number,
    description: String,
    icon: String,
    windSpeed: Number,
    rainChance: Number,
  },
  { _id: false }
);

const aiDayPlanSchema = new mongoose.Schema(
  {
    day: Number,
    date: String,
    title: String,
    activities: [
      {
        time: String,
        activity: String,
        location: String,
        estimatedCost: Number,
        tips: String,
      },
    ],
    meals: [
      {
        type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        suggestion: String,
        estimatedCost: Number,
      },
    ],
    transport: String,
    dailyCost: Number,
  },
  { _id: false }
);

const budgetBreakdownSchema = new mongoose.Schema(
  {
    transport: { amount: Number, percentage: Number },
    accommodation: { amount: Number, percentage: Number },
    food: { amount: Number, percentage: Number },
    activities: { amount: Number, percentage: Number },
    miscellaneous: { amount: Number, percentage: Number },
    total: Number,
    currency: String,
    withinBudget: Boolean,
    savings: Number,
  },
  { _id: false }
);

// ── Main Trip Schema ──

const tripSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(TRIP_STATUS),
      default: TRIP_STATUS.PLANNING,
      index: true,
    },

    statusMessage: {
      type: String,
      default: 'Planning your trip...',
    },

    // ── User Input ──
    input: {
      startLocation: { type: locationSchema, required: true },
      destination: { type: locationSchema, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      budget: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: 'INR' },
      },
      travelers: { type: Number, default: 1, min: 1, max: 20 },
      preferences: {
        travelStyle: {
          type: String,
          enum: ['budget', 'moderate', 'luxury'],
          default: 'moderate',
        },
        interests: [String],
      },
    },

    // ── Aggregated Transport Data ──
    transport: {
      driving: drivingSchema,
      flights: [flightSchema],
      trains: [trainRouteSchema],
    },

    // ── Hotels ──
    hotels: [hotelSchema],

    // ── Taxi & Rental Cars ──
    taxiServices: [taxiServiceSchema],

    // ── Tourist Attractions ──
    places: [placeSchema],

    // ── Weather Forecast ──
    weather: {
      forecast: [weatherDaySchema],
      summary: String,
      packingTips: [String],
    },

    // ── AI-Generated Itinerary ──
    aiItinerary: {
      summary: String,
      budgetTiers: {
        budget: {
          dayWisePlan: [aiDayPlanSchema],
          budgetBreakdown: budgetBreakdownSchema,
          totalCost: Number,
        },
        moderate: {
          dayWisePlan: [aiDayPlanSchema],
          budgetBreakdown: budgetBreakdownSchema,
          totalCost: Number,
        },
        premium: {
          dayWisePlan: [aiDayPlanSchema],
          budgetBreakdown: budgetBreakdownSchema,
          totalCost: Number,
        },
      },
      recommendations: [String],
      tips: [String],
      localFood: [
        {
          name: String,
          description: String,
          priceRange: String,
        },
      ],
      bestTransportOption: String,
    },

    // ── Map Data (GeoJSON) ──
    mapData: {
      type: {
        type: String,
        enum: ['FeatureCollection'],
        default: 'FeatureCollection',
      },
      features: [mongoose.Schema.Types.Mixed],
    },

    // ── Metadata ──
    apiErrors: [
      {
        service: String,
        error: String,
        timestamp: Date,
      },
    ],

    shareToken: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// ── Pre-save: generate tripId if not set ──
tripSchema.pre('save', function (next) {
  if (!this.tripId) {
    this.tripId = crypto.randomBytes(TRIP_ID_LENGTH).toString('base64url').slice(0, TRIP_ID_LENGTH);
  }
  next();
});

// ── Compound indexes for efficient queries ──
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ tripId: 1, userId: 1 });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
