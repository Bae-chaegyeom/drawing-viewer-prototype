export type RenderKind =
  | 'drawingBase'
  | 'disciplineBase'
  | 'disciplineRevision'
  | 'regionBase'
  | 'regionRevision';

export type RenderLayer = {
  id: string;

  kind: RenderKind;

  drawingId: string;
  drawingName: string;

  disciplineId?: string; // "건축", "구조"
  regionKey?: string; // "A", "B"
  revisionVersion?: string; // "REV1", "REV2A"

  image: string;
  alignToImage: string;
  imageTransform?: any;
  polygon?: any;

  date?: string;
  description?: string;
  changes?: string[];
};
