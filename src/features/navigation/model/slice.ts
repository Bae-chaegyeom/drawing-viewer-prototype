import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type NavigationState = {
  currentDrawingId: string | null;
  currentDisciplineId: string | null;
  currentRegionId: string | null;
  currentRevisionVersion: string | null;
};

const initialState: NavigationState = {
  currentDrawingId: null,
  currentDisciplineId: null,
  currentRegionId: null,
  currentRevisionVersion: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setDrawing(state, action: PayloadAction<string | null>) {
      state.currentDrawingId = action.payload;
      state.currentDisciplineId = null;
      state.currentRegionId = null;
      state.currentRevisionVersion = null;
    },
    setDiscipline(state, action: PayloadAction<string | null>) {
      state.currentDisciplineId = action.payload;
      state.currentRegionId = null;
      state.currentRevisionVersion = null;
    },
    setRegion(state, action: PayloadAction<string | null>) {
      state.currentRegionId = action.payload;
      state.currentRevisionVersion = null;
    },
    setRevisionVersion(state, action: PayloadAction<string | null>) {
      state.currentRevisionVersion = action.payload;
    },
  },
});

export const { setDrawing, setDiscipline, setRegion, setRevisionVersion } = navigationSlice.actions;

export default navigationSlice.reducer;
