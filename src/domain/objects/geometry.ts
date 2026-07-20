import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #7 Geometry */
export const ShapeType = z.enum([
  'box',
  'rounded_box',
  'cylinder',
  'hollow_cylinder',
  'sphere',
  'hemisphere',
  'cone',
  'truncated_cone',
  'pipe',
  'torus',
  'extruded_profile',
  'revolved_profile',
  'mesh_scan',
  'custom',
])
export type ShapeType = z.infer<typeof ShapeType>

export const GeometrySource = z.enum([
  'parametric',
  'scan',
  'imported_cad',
  'imported_mesh',
  'estimated',
  'ai_generated',
])
export type GeometrySource = z.infer<typeof GeometrySource>

export const GeometryRepresentation = z.enum(['brep', 'mesh', 'parametric'])
export type GeometryRepresentation = z.infer<typeof GeometryRepresentation>

export const GeometryAccuracy = z.object({
  status: z.enum(['verified', 'estimated', 'unknown', 'pending']),
  linearToleranceMm: z.number().nonnegative().nullable(),
  angularToleranceDeg: z.number().nonnegative().nullable(),
})
export type GeometryAccuracy = z.infer<typeof GeometryAccuracy>

export const Geometry = z.object({
  shapeType: ShapeType,
  source: GeometrySource,
  representation: GeometryRepresentation,
  geometryFile: z.string().default('N/A'),
  lod: z.string().default('engineering'),
  accuracy: GeometryAccuracy,
})
export type Geometry = z.infer<typeof Geometry>
