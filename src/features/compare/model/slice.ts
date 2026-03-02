import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CompareMode = 'none' | 'overlay' | 'split' | 'reveal';

export type CompareState = {
  mode: CompareMode;
  baseLayerId: string | null;
  targetLayerId: string | null;
  opacity: number;
};

const initialState: CompareState = {
  mode: 'none',
  baseLayerId: null,
  targetLayerId: null,
  opacity: 0.6,
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<CompareMode>) {
      state.mode = action.payload;
    },
    setBaseLayer(state, action: PayloadAction<string | null>) {
      state.baseLayerId = action.payload;
    },
    setTargetLayer(state, action: PayloadAction<string | null>) {
      state.targetLayerId = action.payload;
    },
    setOpacity(state, action: PayloadAction<number>) {
      state.opacity = Math.min(1, Math.max(0, action.payload));
    },
  },
});

export const { setMode, setBaseLayer, setTargetLayer, setOpacity } = compareSlice.actions;
export default compareSlice.reducer;
