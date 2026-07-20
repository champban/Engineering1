import { z } from 'zod'
import { MassValue, Vector3, isResolved } from '@/core/schema/primitives'
import type { ValidationIssue } from '@/core/validation/types'

/** CORE_OBJECT_SCHEMA_V1.md #10 Physical properties -- mass is mandatory. */
export const StaticOrMovable = z.enum(['static', 'movable'])
export type StaticOrMovable = z.infer<typeof StaticOrMovable>

const optionalMetric = z.union([z.number(), z.literal('N/A')])

export const Physical = z.object({
  mass: MassValue,
  densityKgM3: optionalMetric.default('N/A'),
  volumeM3: optionalMetric.default('N/A'),
  surfaceAreaM2: optionalMetric.default('N/A'),
  centerOfMassLocalMm: Vector3,
  staticOrMovable: StaticOrMovable,
})
export type Physical = z.infer<typeof Physical>

/**
 * Structural/draft validation for mass (work order #6):
 * - Missing mass structure is blocking (enforced by schema required field).
 * - Known negative mass is blocking.
 * - `0` mass is only valid when explicitly verified (schema does not block
 *   0 outright; the "0 must be verified" nuance is enforced at Verified/
 *   Released level via `validateMassForRelease`).
 */
export function validateMassStructure(physical: Physical): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { mass } = physical
  if (mass.value !== null && mass.value < 0) {
    issues.push({
      path: 'physical.mass.value',
      message: `Mass must not be negative; received ${mass.value}.`,
    })
  }
  if (mass.value === 0 && mass.status !== 'verified') {
    issues.push({
      path: 'physical.mass.value',
      message:
        '0 kg is only valid when physically meaningful and explicitly verified; use null with status "unknown" otherwise.',
    })
  }
  return issues
}

/** Released objects require verified or accepted estimated mass. */
export function isMassResolvedForRelease(physical: Physical): boolean {
  return isResolved(physical.mass)
}
