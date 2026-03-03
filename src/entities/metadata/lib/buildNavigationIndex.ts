import type { Metadata } from '../model/rawTypes';

export type NavRevision = {
  version: string;
  date: string;
  changesCount: number;
};

export type NavRegion = {
  key: string;
  revisions: NavRevision[];
};

export type NavDiscipline = {
  id: string;
  regions?: NavRegion[];
  revisions?: NavRevision[];
};

export type NavDrawing = {
  id: string;
  name: string;
  disciplines: NavDiscipline[];
};

export type NavigationIndex = {
  drawings: NavDrawing[];
};

export function buildNavigationIndex(meta: Metadata): NavigationIndex {
  const drawings: NavDrawing[] = [];

  for (const drawingId of Object.keys(meta.drawings)) {
    const drawing = meta.drawings[drawingId];

    const disciplines: NavDiscipline[] = [];

    const drawingDisciplines = drawing.disciplines ?? {};

    for (const disciplineId of Object.keys(drawingDisciplines)) {
      const disc = drawingDisciplines[disciplineId];

      if (disc.regions && Object.keys(disc.regions).length > 0) {
        const regions: NavRegion[] = [];

        for (const regionKey of Object.keys(disc.regions)) {
          const region = disc.regions[regionKey];

          const revisions: NavRevision[] =
            region.revisions?.map((rev) => ({
              version: rev.version,
              date: rev.date,
              changesCount: rev.changes?.length ?? 0,
            })) ?? [];

          regions.push({
            key: regionKey,
            revisions,
          });
        }

        disciplines.push({
          id: disciplineId,
          regions,
        });

        continue;
      }

      if (disc.revisions && disc.revisions.length > 0) {
        const revisions: NavRevision[] = disc.revisions.map((rev) => ({
          version: rev.version,
          date: rev.date,
          changesCount: rev.changes?.length ?? 0,
        }));

        disciplines.push({
          id: disciplineId,
          revisions,
        });

        continue;
      }

      disciplines.push({
        id: disciplineId,
      });
    }

    drawings.push({
      id: drawingId,
      name: drawing.name,
      disciplines,
    });
  }

  return { drawings };
}
