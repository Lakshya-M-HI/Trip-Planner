/* ═══════════════════════════════════════
   TypeScript types for the entire app.
   Mirrors the backend MongoDB schemas.
   ═══════════════════════════════════════ */

// ── Auth ──
export interface User {
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  avatar: string | null;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  preferredCurrency?: string;
}

// ── Location ──
export interface Location {
  name: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  placeId?: string;
}

export interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// ── Trip ──
export type TripStatus = "planning" | "ready" | "partial" | "failed";

export interface TripInput {
  startLocation: Location;
  destination: Location;
  startDate: string;
  endDate: string;
  budget: { amount: number; currency: string };
  travelers: number;
  preferences?: {
    travelStyle?: "budget" | "moderate" | "luxury";
    interests?: string[];
  };
}

export interface Flight {
  airline: string;
  flightNumber: string;
  departure: { airport: string; iataCode: string; dateTime: string };
  arrival: { airport: string; iataCode: string; dateTime: string };
  duration: string;
  stops: number;
  price: { amount: number; currency: string };
  cabin: string;
  bookingUrl: string;
  seatsAvailable: number;
}

export interface TrainRoute {
  name: string;
  operator: string;
  vehicle: string;
  departure: { station: string; dateTime: string };
  arrival: { station: string; dateTime: string };
  duration: string;
  durationMinutes: number;
  price: { low: number; high: number; currency: string };
  bookingUrl: string;
  segments: { vehicle: string; from: string; to: string; duration: string; operator: string }[];
}

export interface DrivingRoute {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startAddress: string;
  endAddress: string;
  polyline: string;
  fuelEstimate: { liters: number; costEstimate: { amount: number; currency: string } };
  tolls: { estimated: number; currency: string };
}

export interface Hotel {
  name: string;
  hotelId: string;
  starRating: number | null;
  address: string;
  lat: number;
  lng: number;
  price: { perNight: number; total: number; currency: string };
  amenities: string[];
  rating: { score: number | null; reviews: number | null };
  bookingUrl: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
}

export interface TaxiService {
  name: string;
  type: "taxi" | "rental_car" | "ride_hailing";
  phone: string;
  website: string;
  rating: number;
  totalRatings: number | null;
  address: string;
  lat: number;
  lng: number;
  deepLink: string | null;
}

export interface Place {
  name: string;
  fsqId: string;
  category: string;
  categoryIcon: string;
  rating: number | null;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  photos: string[];
  tips: string[];
  popularity: number;
  website: string;
}

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  rainChance: number;
}

export interface DayActivity {
  time: string;
  activity: string;
  location: string;
  estimatedCost: number;
  tips: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: DayActivity[];
  meals: { type: string; suggestion: string; estimatedCost: number }[];
  transport: string;
  dailyCost: number;
}

export interface BudgetBreakdown {
  transport: { amount: number; percentage: number };
  accommodation: { amount: number; percentage: number };
  food: { amount: number; percentage: number };
  activities: { amount: number; percentage: number };
  miscellaneous: { amount: number; percentage: number };
  total: number;
  currency: string;
  withinBudget: boolean;
  savings: number;
}

export interface BudgetTier {
  dayWisePlan: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
  totalCost: number;
}

export interface AIItinerary {
  summary: string;
  budgetTiers: {
    budget: BudgetTier;
    moderate: BudgetTier;
    premium: BudgetTier;
  };
  recommendations: string[];
  tips: string[];
  localFood: { name: string; description: string; priceRange: string }[];
  bestTransportOption: string;
}

export interface Trip {
  id: string;
  tripId: string;
  userId: string;
  status: TripStatus;
  statusMessage: string;
  input: TripInput;
  transport: {
    driving: DrivingRoute | null;
    flights: Flight[];
    trains: TrainRoute[];
  };
  hotels: Hotel[];
  taxiServices: TaxiService[];
  places: Place[];
  weather: {
    forecast: WeatherDay[];
    summary: string;
    packingTips: string[];
  } | null;
  aiItinerary: AIItinerary | null;
  mapData: { type: string; features: unknown[] } | null;
  shareToken: string | null;
  apiErrors: { service: string; error: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  tripId: string;
  status: TripStatus;
  statusMessage: string;
  input: {
    startLocation: { name: string };
    destination: { name: string };
    startDate: string;
    endDate: string;
    budget: { amount: number; currency: string };
  };
  createdAt: string;
}

// ── API Response ──
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
