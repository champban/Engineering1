import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #17 Measurements. */
export const MeasurementType = z.enum([
  'distance',
  'diameter',
  'radius',
  'angle',
  'bounding',
  'annotation',
])
export type MeasurementType = z.infer<typeof MeasurementType>

export const MeasurementSource = z.enum([
  'manual_measurement',
  'calculated',
  'imported',
  'estimated',
])
export type MeasurementSource = z.infer<typeof MeasurementSource>

export const Measurement = z.object({
  measurementId: z.string().min(1),
  type: MeasurementType,
  value: z.number().nullable(),
  unit: z.string().min(1),
  source: MeasurementSource,
  status: z.enum(['verified', 'estimated', 'unknown', 'pending']),
  tolerance: z.number().nonnegative().nullable().optional(),
  annotationVisible: z.boolean().default(true),
})
export type Measurement = z.infer<typeof Measurement>

export const Measurements = z.array(Measurement)
export type Measurements = z.infer<typeof Measurements>
