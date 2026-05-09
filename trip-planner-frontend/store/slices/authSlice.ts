import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api, { setAccessToken } from "@/lib/api";
import type { User, AuthState, LoginPayload, RegisterPayload, ApiResponse } from "@/lib/types";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true initially to check refresh on mount
};

// ── Async Thunks ──

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
        "/auth/login",
        payload
      );
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
        "/auth/register",
        payload
      );
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
      // After refreshing, fetch the user profile
      setAccessToken(data.data.accessToken);
      const profileRes = await api.get<ApiResponse<{ user: User }>>("/auth/me");
      return { accessToken: data.data.accessToken, user: profileRes.data.data.user };
    } catch {
      return rejectWithValue("Session expired");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Logout even if API call fails
  }
  setAccessToken(null);
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: Partial<User>, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ApiResponse<{ user: User }>>("/auth/me", payload);
      return data.data.user;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// ── Slice ──

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      setAccessToken(null);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state) => { state.isLoading = false; });

    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false; });

    // Refresh Session
    builder
      .addCase(refreshSession.pending, (state) => { state.isLoading = true; })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
