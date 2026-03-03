export type Vec2 = [number, number];

export type ImageTransform = {
  relativeTo?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type PolygonTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type Polygon = {
  vertices: Vec2[];
  polygonTransform: PolygonTransform;
};

export type Revision = {
  version: string;
  image: string;
  date: string;
  description: string;
  changes: string[];

  imageTransform?: ImageTransform;
  polygon?: Polygon;
};

export type Region = {
  polygon: Polygon;
  revisions: Revision[];
};

export type Discipline = {
  image?: string;
  imageTransform?: ImageTransform;

  polygon?: Polygon;
  regions?: Record<string, Region>;

  revisions?: Revision[];
};

export type Drawing = {
  id: string;
  name: string;
  image: string;

  parent?: string;

  position?: {
    vertices: Vec2[];
    imageTransform: Omit<ImageTransform, 'relativeTo'>;
  };

  disciplines?: Record<string, Discipline>;
};

export type Metadata = {
  project: {
    name: string;
    unit: string;
  };

  disciplines: {
    id?: string;
    name: string;
  }[];

  drawings: Record<string, Drawing>;
};
