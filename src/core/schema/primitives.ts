import { z } from 'zod'

/**
 * Shared primitive schemas used across the Core Object Schema, orientation
 * schema, and dynamic relationship schema.
 *
 * Design rule (CORE_OBJECT_SCHEMA_V1.md #2): unknown numeric values are
 * represented explicitly with `null` and must never be replaced with `0`.
 */

/** A dimensioned, sourced, and status-tracked numeric value. */
export const DimensionStatus = z.enum([
  'verified',
  'estimated',
  'unknown',
  'pending',
  'not_applicable',
])
export type DimensionStatus = z.infer<typeof DimensionStatus>

export const LengthUnit = z.enum(['mm', 'cm', 'm'])
export type LengthUnit = z.infer<typeof LengthUnit>

export const MassUnit = z.enum(['g', 'kg', 't'])
export type MassUnit = z.infer<typeof MassUnit>

export const DimensionSource = z.enum([
  'measured',
  'estimated',
  'calculated',
  'manufacturer_spec',
  'scan',
  'unknown',
])
export type DimensionSource = z.infer<typeof DimensionSource>

/**
 * A dimension value that may be unresolved.
 *
 * `value` is `null` whenever the dimension is not yet known -- it must never
 * be `0` to mean "unknown". When `status` is `verified` or `estimated`,
 * `value` must be present and, if the field represents a physical extent,
 * positive.
 */
export const DimensionValue = z.object({
  value: z.number().nullable(),
  unit: LengthUnit,
  source: DimensionSource,
  status: DimensionStatus,
  tolerance: z.number().nonnegative().nullable().optional(),
})
export type DimensionValue = z.infer<typeof DimensionValue>

export const MassValue = z.object({
  value: z.number().nullable(),
  unit: MassUnit,
  source: DimensionSource,
  status: DimensionStatus,
  tolerance: z.number().nonnegative().nullable().optional(),
})
export type MassValue = z.infer<typeof MassValue>

/** A 3-component vector, expressed in local object space unless stated otherwise. */
export const Vector3 = z.tuple([z.number(), z.number(), z.number()])
export type Vector3 = z.infer<typeof Vector3>

export const Quaternion = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
])
export type Quaternion = z.infer<typeof Quaternion>

/** Returns true when a dimension/mass value is "known" (resolved). */
export function isResolved(
  entry: { value: number | null; status: DimensionStatus } | null | undefined,
): boolean {
  if (!entry) return false
  return (
    (entry.status === 'verified' || entry.status === 'estimated') &&
    entry.value !== null
  )
}

/** Approximate equality helper used by orientation/vector validation. */
export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) <= epsilon
}

export function vectorLength(v: Vector3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

export function dotProduct(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function isZeroVector(v: Vector3, epsilon = 1e-9): boolean {
  return vectorLength(v) <= epsilon
}
