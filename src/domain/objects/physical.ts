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

/** Structural/draft validation for mass and optional physical metrics. */
export function validateMassStructure(physical: Physical): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { mass } = physical
  const resolved = mass.status === 'verified' || mass.status === 'estimated'
  const unresolved =
    mass.status === 'unknown' ||
    mass.status === 'pending' ||
    mass.status === 'not_applicable'

  if (resolved && mass.value === null) {
    issues.push({
      path: 'physical.mass.value',
      message: `Mass is marked ${mass.status} but has no numeric value.`,
    })
  }

  if (unresolved && mass.value !== null) {
    issues.push({
      path: 'physical.mass.value',
      message: `Mass is marked ${mass.status}; unresolved values must use null.`,
    })
  }

  if (mass.value !== null && mass.value < 0) {
    issues.push({
      path: 'physical.mass.value',
      message: `Mass must not be negative; received ${mass.value} ${mass.unit}.`,
    })
  }

  if (mass.value === 0 && mass.status !== 'verified') {
    issues.push({
      path: 'physical.mass.value',
      message:
        'Zero mass is only valid when physically meaningful and explicitly verified; use null with status "unknown" otherwise.',
    })
  }

  if (resolved && mass.source === 'unknown') {
    issues.push({
      path: 'physical.mass.source',
      message: 'Resolved mass must identify a non-unknown source.',
    })
  }

  for (const [key, value] of Object.entries({
    densityKgM3: physical.densityKgM3,
    volumeM3: physical.volumeM3,
    surfaceAreaM2: physical.surfaceAreaM2,
  })) {
    if (typeof value === 'number' && value < 0) {
      issues.push({
        path: `physical.${key}`,
        message: `${key} must not be negative; received ${value}.`,
      })
    }
  }

  return issues
}

/** Released objects require verified or accepted estimated mass. */
export function isMassResolvedForRelease(physical: Physical): boolean {
  return isResolved(physical.mass)
}
