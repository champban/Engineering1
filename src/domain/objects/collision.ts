import { z } from 'zod'
import type { ValidationIssue } from '@/core/validation/types'

/** CORE_OBJECT_SCHEMA_V1.md #15 Collision and support role. */
export const CollisionRole = z.enum(['solid', 'trigger', 'support_surface', 'ignore'])
export type CollisionRole = z.infer<typeof CollisionRole>

const optionalLoad = z.union([z.number(), z.literal('N/A')])

export const SupportCapability = z.object({
  enabled: z.boolean(),
  maximumTotalLoadKg: optionalLoad,
  maximumDistributedLoadKgM2: optionalLoad,
  maximumLineLoadKgM: optionalLoad,
  maximumPointLoadKg: optionalLoad,
  safetyFactor: optionalLoad,
})
export type SupportCapability = z.infer<typeof SupportCapability>

export const Collision = z.object({
  enabled: z.boolean(),
  role: CollisionRole,
  shapeSource: z.enum(['geometry', 'bounding_box', 'custom']),
  clearanceEnvelopeMm: z.number().nonnegative(),
  supportCapability: SupportCapability,
})
export type Collision = z.infer<typeof Collision>

/** Blocking rule (work order #6): negative support load limit. */
export function validateCollisionStructure(collision: Collision): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const cap = collision.supportCapability
  const loadFields: (keyof SupportCapability)[] = [
    'maximumTotalLoadKg',
    'maximumDistributedLoadKgM2',
    'maximumLineLoadKgM',
    'maximumPointLoadKg',
    'safetyFactor',
  ]
  for (const field of loadFields) {
    const value = cap[field]
    if (typeof value === 'number' && value < 0) {
      issues.push({
        path: `collision.supportCapability.${field}`,
        message: `${field} must not be negative; received ${value}.`,
      })
    }
  }
  return issues
}
