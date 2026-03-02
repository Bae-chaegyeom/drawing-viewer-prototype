import { createSlice } from '@reduxjs/toolkit';

export type LayerToggleState = {
  showBaseImage: boolean;
  showTargetImage: boolean;
  showPolygons: boolean;
  showLabels: boolean;
};

const initialState: LayerToggleState = {
  showBaseImage: true,
  showTargetImage: true,
  showPolygons: true,
  showLabels: true,
};

const layerToggleSlice = createSlice({
  name: 'layerToggle',
  initialState,
  reducers: {
    toggleBaseImage(state) {
      state.showBaseImage = !state.showBaseImage;
    },
    toggleTargetImage(state) {
      state.showTargetImage = !state.showTargetImage;
    },
    togglePolygons(state) {
      state.showPolygons = !state.showPolygons;
    },
    toggleLabels(state) {
      state.showLabels = !state.showLabels;
    },
  },
});

export const { toggleBaseImage, toggleTargetImage, togglePolygons, toggleLabels } =
  layerToggleSlice.actions;

export default layerToggleSlice.reducer;
