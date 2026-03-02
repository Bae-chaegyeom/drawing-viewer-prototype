import type { RootState } from '../../../app/store';

export const selectNavigation = (state: RootState) => state.navigation;

export const selectBreadcrumbText = (state: RootState) => {
  const { currentDrawingId, currentDisciplineId, currentRegionId, currentRevisionVersion } =
    state.navigation;

  const parts: string[] = [];

  if (currentDrawingId) parts.push(currentDrawingId);
  if (currentDisciplineId) parts.push(currentDisciplineId);
  if (currentRegionId) parts.push(`Region ${currentRegionId}`);
  if (currentRevisionVersion) parts.push(currentRevisionVersion);

  return parts.join(' > ');
};
