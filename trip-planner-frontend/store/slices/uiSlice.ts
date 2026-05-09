import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  activeBudgetTier: "budget" | "moderate" | "premium";
  activeTripTab: string;
}

const initialState: UIState = {
  sidebarOpen: false,
  activeBudgetTier: "moderate",
  activeTripTab: "transport",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setActiveBudgetTier: (state, action: PayloadAction<UIState["activeBudgetTier"]>) => {
      state.activeBudgetTier = action.payload;
    },
    setActiveTripTab: (state, action: PayloadAction<string>) => {
      state.activeTripTab = action.payload;
    },
  },
});

export const { toggleSidebar, setActiveBudgetTier, setActiveTripTab } = uiSlice.actions;
export default uiSlice.reducer;
