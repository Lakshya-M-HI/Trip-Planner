import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tripReducer from "./slices/tripSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trip: tripReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
