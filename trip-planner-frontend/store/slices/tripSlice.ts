import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { Trip, TripSummary, TripInput, ApiResponse } from "@/lib/types";

interface TripState {
  trips: TripSummary[];
  currentTrip: Trip | null;
  totalTrips: number;
  page: number;
  isLoading: boolean;
  isPlanningLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  totalTrips: 0,
  page: 1,
  isLoading: false,
  isPlanningLoading: false,
  error: null,
};

export const createTrip = createAsyncThunk(
  "trip/create",
  async (input: TripInput, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ tripId: string; status: string }>>(
        "/trips",
        input
      );
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to create trip");
    }
  }
);

export const fetchTrips = createAsyncThunk(
  "trip/fetchAll",
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<TripSummary[]>>("/trips", { params });
      return { trips: data.data, meta: data.meta! };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch trips");
    }
  }
);

export const fetchTripById = createAsyncThunk(
  "trip/fetchById",
  async (tripId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<{ trip: Trip }>>(`/trips/${tripId}`);
      return data.data.trip;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Trip not found");
    }
  }
);

export const fetchTripStatus = createAsyncThunk(
  "trip/fetchStatus",
  async (tripId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<
        ApiResponse<{ tripId: string; status: string; message: string }>
      >(`/trips/${tripId}/status`);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch status");
    }
  }
);

export const deleteTrip = createAsyncThunk(
  "trip/delete",
  async (tripId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/trips/${tripId}`);
      return tripId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to delete trip");
    }
  }
);

export const shareTrip = createAsyncThunk(
  "trip/share",
  async (tripId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ tripId: string; shareToken: string }>>(
        `/trips/${tripId}/share`
      );
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to share trip");
    }
  }
);

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createTrip.pending, (state) => { state.isPlanningLoading = true; state.error = null; })
      .addCase(createTrip.fulfilled, (state) => { state.isPlanningLoading = false; })
      .addCase(createTrip.rejected, (state, action) => {
        state.isPlanningLoading = false;
        state.error = action.payload as string;
      });

    // Fetch All
    builder
      .addCase(fetchTrips.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.trips = action.payload.trips;
        state.totalTrips = action.payload.meta.total;
        state.page = action.payload.meta.page;
        state.isLoading = false;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch By ID
    builder
      .addCase(fetchTripById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.currentTrip = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder.addCase(deleteTrip.fulfilled, (state, action) => {
      state.trips = state.trips.filter((t) => t.tripId !== action.payload);
      state.totalTrips -= 1;
    });

    // Share
    builder.addCase(shareTrip.fulfilled, (state, action) => {
      if (state.currentTrip && state.currentTrip.tripId === action.payload.tripId) {
        state.currentTrip.shareToken = action.payload.shareToken;
      }
    });

    // Status
    builder.addCase(fetchTripStatus.fulfilled, (state, action) => {
      if (state.currentTrip && state.currentTrip.tripId === action.payload.tripId) {
        state.currentTrip.status = action.payload.status as Trip["status"];
        state.currentTrip.statusMessage = action.payload.message;
      }
    });
  },
});

export const { clearCurrentTrip, clearError } = tripSlice.actions;
export default tripSlice.reducer;
