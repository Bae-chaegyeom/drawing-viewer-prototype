import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from '@/features/navigation/model/slice';
import compareReducer from '@/features/compare/model/slice';
import layerToggleReducer from '@/features/layer-toggle/model/slice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    compare: compareReducer,
    layerToggle: layerToggleReducer,
  },
});

// 타입 추출 (hooks에서 사용)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
