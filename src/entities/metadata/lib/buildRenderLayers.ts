import type { MetadataParsed } from '../lib/metadataSchema';
import type { RenderLayer } from '../model/renderTypes';
// buildRenderLayers.ts 파일 상단(함수 밖)

// type Vec2 = [number, number];

// function applyPolygonTransform(
//   vertices: Vec2[],
//   t: { x: number; y: number; scale: number; rotation: number },
// ): Vec2[] {
//   const cos = Math.cos(t.rotation);
//   const sin = Math.sin(t.rotation);

//   return vertices.map(([x, y]) => {
//     // scale
//     const sx = x * t.scale;
//     const sy = y * t.scale;

//     // rotate around origin
//     const rx = sx * cos - sy * sin;
//     const ry = sx * sin + sy * cos;

//     // translate
//     return [rx + t.x, ry + t.y];
//   });
// }

// function bakePolygon(polygon: any) {
//   if (!polygon) return undefined;
//   const t = polygon.polygonTransform;
//   if (!t) return polygon;

//   return {
//     vertices: applyPolygonTransform(polygon.vertices, t),
//     polygonTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
//   };
// }

const makeId = (...parts: (string | undefined)[]) => parts.filter(Boolean).join('|');

export function buildRenderLayers(meta: MetadataParsed): RenderLayer[] {
  const layers: RenderLayer[] = [];

  const drawings = meta.drawings;

  for (const drawingId of Object.keys(drawings)) {
    const drawing = drawings[drawingId];

    // 0) 도면 자체(base) 레이어
    layers.push({
      id: makeId(drawingId, 'base'),
      kind: 'drawingBase',
      drawingId,
      drawingName: drawing.name,
      image: drawing.image,
      alignToImage: drawing.image,
    });

    // 1) 도면 내 공종 루프
    const disciplines = drawing.disciplines ?? {};
    for (const disciplineId of Object.keys(disciplines)) {
      const disc = disciplines[disciplineId];

      // 규칙 1: alignToImage는 항상 기록
      // discipline.imageTransform.relativeTo가 있으면 그게 기준
      // 없으면 drawing.image
      const disciplineAlignTo = disc.imageTransform?.relativeTo ?? drawing.image;

      // --- 특수 케이스 1) 01 구조: regions A/B --- :contentReference[oaicite:1]{index=1}
      if (disc.regions && Object.keys(disc.regions).length > 0) {
        // discipline 자체 이미지가 있으면(구조 기준 도면) disciplineBase도 생성
        if (disc.image) {
          layers.push({
            id: makeId(drawingId, disciplineId, 'base'),
            kind: 'disciplineBase',
            drawingId,
            drawingName: drawing.name,
            disciplineId,
            image: disc.image,
            alignToImage: disciplineAlignTo,
            imageTransform: disc.imageTransform,
            polygon: disc.polygon,
          });
        }

        // region A/B 각각
        for (const regionKey of Object.keys(disc.regions)) {
          const region = disc.regions[regionKey];

          // regionBase: region 폴리곤을 보여주기 위한 레이어(선택/강조용)
          layers.push({
            id: makeId(drawingId, disciplineId, `region:${regionKey}`),
            kind: 'regionBase',
            drawingId,
            drawingName: drawing.name,
            disciplineId,
            regionKey,
            image: disc.image ?? drawing.image, // 구조 기준 도면이 있으면 그걸 쓰는 편이 자연스러움
            alignToImage: disciplineAlignTo,
            imageTransform: disc.imageTransform,
            polygon: region.polygon,
          });

          // regionRevision들
          for (const rev of region.revisions ?? []) {
            // region revision relativeTo는 구조 도면(04...) 기준 :contentReference[oaicite:2]{index=2}
            const alignTo = rev.imageTransform?.relativeTo ?? disc.image ?? drawing.image;

            layers.push({
              id: makeId(drawingId, disciplineId, `region:${regionKey}`, `rev:${rev.version}`),
              kind: 'regionRevision',
              drawingId,
              drawingName: drawing.name,
              disciplineId,
              regionKey,
              revisionVersion: rev.version,
              image: rev.image,
              alignToImage: alignTo,
              imageTransform: rev.imageTransform,
              polygon: rev.polygon,
              date: rev.date,
              description: rev.description,
              changes: rev.changes,
            });
          }
        }

        continue; // regions 케이스는 여기서 끝
      }

      // --- 특수 케이스 2) 09 건축: discipline 레벨 polygon 없음, revision마다 polygon --- :contentReference[oaicite:3]{index=3}
      const hasRevisions = (disc.revisions?.length ?? 0) > 0;
      const revisionOwnPolygonMode =
        hasRevisions && !disc.polygon && !disc.imageTransform && !disc.image;

      if (revisionOwnPolygonMode) {
        for (const rev of disc.revisions ?? []) {
          const layerTransform = rev.imageTransform ?? disc.imageTransform;
          const alignTo = layerTransform?.relativeTo ?? drawing.image;

          layers.push({
            id: makeId(drawingId, disciplineId, `rev:${rev.version}`),
            kind: 'disciplineRevision',
            drawingId,
            drawingName: drawing.name,
            disciplineId,
            revisionVersion: rev.version,
            image: rev.image,
            alignToImage: alignTo,
            imageTransform: layerTransform,
            polygon: rev.polygon,
            date: rev.date,
            description: rev.description,
            changes: rev.changes,
          });
        }
        continue;
      }

      // 일반 케이스: discipline base 레이어 생성 (image 있을 때)
      if (disc.image) {
        layers.push({
          id: makeId(drawingId, disciplineId, 'base'),
          kind: 'disciplineBase',
          drawingId,
          drawingName: drawing.name,
          disciplineId,
          image: disc.image,
          alignToImage: disciplineAlignTo,
          imageTransform: disc.imageTransform,
          polygon: disc.polygon,
        });
      } else {
        // 특수 케이스 3) 13 구조: polygon 없음(정상) contentReference[oaicite:5]{index=5}
        // imageTransform만 있고 polygon이 없는 케이스도 "레이어는 만들어야 함"
        // (표시는 drawing.image를 쓰고 transform 정보만 남김)
        if (disc.imageTransform) {
          layers.push({
            id: makeId(drawingId, disciplineId, 'transformOnly'),
            kind: 'disciplineBase',
            drawingId,
            drawingName: drawing.name,
            disciplineId,
            image: drawing.image,
            alignToImage: disciplineAlignTo,
            imageTransform: disc.imageTransform,
            polygon: disc.polygon,
          });
        }
      }

      // discipline revisions(일반)
      for (const rev of disc.revisions ?? []) {
        const layerTransform = rev.imageTransform ?? disc.imageTransform;
        const alignTo = layerTransform?.relativeTo ?? disciplineAlignTo;

        layers.push({
          id: makeId(drawingId, disciplineId, `rev:${rev.version}`),
          kind: 'disciplineRevision',
          drawingId,
          drawingName: drawing.name,
          disciplineId,
          revisionVersion: rev.version,
          image: rev.image,
          alignToImage: alignTo,
          imageTransform: layerTransform,
          polygon: rev.polygon,
          date: rev.date,
          description: rev.description,
          changes: rev.changes,
        });
      }
    }
  }

  return layers;
}
