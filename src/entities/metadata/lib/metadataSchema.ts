import { z } from 'zod';

const vec2Schema = z.tuple([z.number(), z.number()]);

const transformSchema = z.object({
  relativeTo: z.string().optional(),
  x: z.number(),
  y: z.number(),
  scale: z.number(),
  rotation: z.number(),
});

const polygonSchema = z.object({
  vertices: z.array(vec2Schema),
  polygonTransform: transformSchema,
});

const revisionSchema = z.object({
  version: z.string(),
  image: z.string(),
  date: z.string(),
  description: z.string(),
  changes: z.array(z.string()),
  imageTransform: transformSchema.optional(),
  polygon: polygonSchema.optional(),
});

const regionSchema = z.object({
  polygon: polygonSchema,
  revisions: z.array(revisionSchema),
});

const disciplineSchema = z.object({
  image: z.string().optional(),
  imageTransform: transformSchema.optional(),
  polygon: polygonSchema.optional(),
  regions: z.record(z.string(), regionSchema).optional(),
  revisions: z.array(revisionSchema).optional(),
});

const nullToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === null ? undefined : v), schema);

const positionSchema = z.object({
  vertices: z.array(vec2Schema),
  imageTransform: transformSchema,
});

const drawingSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),

  parent: nullToUndefined(z.string().optional()),
  position: nullToUndefined(positionSchema.optional()),

  disciplines: nullToUndefined(z.record(z.string(), disciplineSchema).optional()),
});

export const metadataSchema = z.object({
  project: z.object({
    name: z.string(),
    unit: z.string(),
  }),

  disciplines: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
  ),

  drawings: z.record(z.string(), drawingSchema),
});

export type MetadataParsed = z.infer<typeof metadataSchema>;
