# AI Trip Planner — Backend API

Production-grade Node.js/Express backend for an AI-powered trip planner.

## Features

- 🔐 **JWT Authentication** — Access + refresh tokens with Argon2 password hashing
- ✈️ **Flight Search** — Via Amadeus API (real-time availability & pricing)
- 🚂 **Train/Bus/Ferry** — Via Rome2rio API (multi-modal transport)
- 🚗 **Driving Routes** — Via Google Maps Directions (distance, duration, fuel cost)
- 🏨 **Hotel Search** — Via Amadeus API (availability & pricing)
- 🚕 **Taxi & Car Rental** — Via Google Maps Places (contacts, websites, deep links)
- 🏛️ **Tourist Attractions** — Via Foursquare API (landmarks, museums, parks)
- 🌤️ **Weather Forecast** — Via OpenWeatherMap (packing tips included)
- 💱 **Multi-Currency** — Via ExchangeRate API (18+ currencies supported)
- 🤖 **AI Itinerary** — Via Google Gemini 2.5 Flash (3 budget tiers)
- 📄 **PDF Export** — Download your trip plan as a PDF
- 🔗 **Trip Sharing** — Share trips via unique token-based links
- 📊 **Price Alerts** — Monitor flight/hotel prices (cron-based)
- 🗺️ **Map Data** — GeoJSON features for interactive map rendering

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + Argon2 |
| AI | Google Gemini 2.5 Flash |
| Logging | Winston |
| Validation | Joi |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template & fill in your API keys
cp .env.example .env

# 3. Start MongoDB (local) or use MongoDB Atlas free tier

# 4. Start development server
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/logout-all` | Logout all devices |
| GET | `/api/auth/me` | Get profile |
| PATCH | `/api/auth/me` | Update profile |
| POST | `/api/auth/change-password` | Change password |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trips` | Create & plan a new trip |
| GET | `/api/trips` | List my trips (paginated) |
| GET | `/api/trips/:tripId` | Get trip details |
| GET | `/api/trips/:tripId/status` | Poll planning status |
| DELETE | `/api/trips/:tripId` | Delete a trip |
| POST | `/api/trips/:tripId/share` | Generate share link |
| GET | `/api/trips/:tripId/export/pdf` | Download as PDF |
| GET | `/api/trips/shared/:tripId` | View shared trip |

### Location & Utilities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/location/geocode?address=...` | Geocode address |
| GET | `/api/location/geocode/reverse?lat=...&lng=...` | Reverse geocode |
| GET | `/api/location/autocomplete?q=...` | Location search |
| GET | `/api/location/place/:placeId` | Place details |
| GET | `/api/location/currency/rates?base=USD` | Exchange rates |
| GET | `/api/location/currency/convert?amount=100&from=USD&to=INR` | Convert |

## Deployment Recommendation

**For Starting Out:** [Railway](https://railway.app) ($5/mo hobby) + [MongoDB Atlas](https://cloud.mongodb.com) (free M0 tier)

**For Scale:** AWS EC2/ECS + MongoDB Atlas M10+

## Project Structure

```
src/
├── config/          # DB, env, logger
├── controllers/     # HTTP request handlers (thin)
├── middlewares/      # Auth, error handler, rate limiter, validator
├── models/          # Mongoose schemas
├── routes/          # API endpoint definitions
├── services/        # Business logic & API integrations
├── utils/           # Helpers, constants, custom errors
├── validations/     # Joi schemas
├── app.js           # Express setup
└── server.js        # Entry point
```
