import { z } from 'zod'
import type { ValidationIssue } from '@/core/validation/types'

/**
 * DYNAMIC_RELATIONSHIP_SCHEMA_V1.md #4 Supported relationship types.
 * The work order (#9) requires this subset at minimum; the full mechanical,
 * transport, structural, and control/inspection vocabulary from the schema
 * document is included so later phases are not blocked.
 */
export const RelationshipType = z.enum([
  // Mechanical power
  'drives',
  'transmitsPowerTo',
  'rotates',
  'coupledTo',
  'gearCoupledTo',
  'beltCoupledTo',
  // Product transport
  'carries',
  'follows',
  'feeds',
  'receives',
  'transfersTo',
  'accumulates',
  'indexes',
  'pushes',
  'blocks',
  // Structural and load
  'supports',
  'mountedOn',
  'attachedTo',
  'loads',
  // Control and inspection
  'detects',
  'tracks',
  'rejects',
  'stops',
  'enables',
  'interlocks',
])
export type RelationshipType = z.infer<typeof RelationshipType>

/** Relationship types that require a rotational axis + pivot on the source object. */
export const ROTATIONAL_RELATIONSHIP_TYPES: RelationshipType[] = ['rotates']

/** Relationship types that require the source (transporter) to declare a path. */
export const PATH_FOLLOWING_RELATIONSHIP_TYPES: RelationshipType[] = ['follows']

/** Relationship types that require a support/contact definition. */
export const CARRIES_RELATIONSHIP_TYPES: RelationshipType[] = ['carries']

export const RelationshipValidationStatus = z.object({
  status: z.enum(['not_evaluated', 'valid', 'invalid']),
  messages: z.array(z.string()).default([]),
})
export type RelationshipValidationStatus = z.infer<
  typeof RelationshipValidationStatus
>

export const Relationship = z.object({
  relationshipId: z.string().min(1),
  type: RelationshipType,
  sourceObjectId: z.string().min(1),
  targetObjectId: z.string().min(1),
  sourceConnectorId: z.string().default('N/A'),
  targetConnectorId: z.string().default('N/A'),
  enabled: z.boolean(),
  status: z.enum(['configured', 'draft', 'disabled']),
  parameters: z.record(z.string(), z.unknown()).default({}),
  /** Present only for rotational relationships (work order blocking rule). */
  axisVectorLocal: z.tuple([z.number(), z.number(), z.number()]).optional(),
  pivotLocalMm: z.tuple([z.number(), z.number(), z.number()]).optional(),
  /** Present only for path-following relationships. */
  pathId: z.string().optional(),
  /** Present only for carries relationships. */
  supportContactIds: z.array(z.string()).optional(),
  validation: RelationshipValidationStatus,
})
export type Relationship = z.infer<typeof Relationship>

export interface RelationshipGraphObject {
  objectId: string
  connectorIds: string[]
}

/**
 * Blocking validation rules, DYNAMIC_RELATIONSHIP_SCHEMA_V1.md #18 and work
 * order #9/#14:
 * - relationship references a missing object
 * - connector references are invalid
 * - a rotational relationship has no valid axis or pivot
 * - a path-following relationship has no path
 * - a carries relationship has no support/contact definition
 */
export function validateRelationship(
  relationship: Relationship,
  knownObjects: Map<string, RelationshipGraphObject>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const source = knownObjects.get(relationship.sourceObjectId)
  const target = knownObjects.get(relationship.targetObjectId)

  if (!source) {
    issues.push({
      path: `relationships.${relationship.relationshipId}.sourceObjectId`,
      message: `Relationship "${relationship.relationshipId}" references missing source object "${relationship.sourceObjectId}".`,
    })
  }
  if (!target) {
    issues.push({
      path: `relationships.${relationship.relationshipId}.targetObjectId`,
      message: `Relationship "${relationship.relationshipId}" references missing target object "${relationship.targetObjectId}".`,
    })
  }

  if (
    source &&
    relationship.sourceConnectorId !== 'N/A' &&
    !source.connectorIds.includes(relationship.sourceConnectorId)
  ) {
    issues.push({
      path: `relationships.${relationship.relationshipId}.sourceConnectorId`,
      message: `Source connector "${relationship.sourceConnectorId}" does not exist on object "${relationship.sourceObjectId}".`,
    })
  }
  if (
    target &&
    relationship.targetConnectorId !== 'N/A' &&
    !target.connectorIds.includes(relationship.targetConnectorId)
  ) {
    issues.push({
      path: `relationships.${relationship.relationshipId}.targetConnectorId`,
      message: `Target connector "${relationship.targetConnectorId}" does not exist on object "${relationship.targetObjectId}".`,
    })
  }

  if (ROTATIONAL_RELATIONSHIP_TYPES.includes(relationship.type)) {
    const hasAxis = !!relationship.axisVectorLocal
    const hasPivot = !!relationship.pivotLocalMm
    if (!hasAxis || !hasPivot) {
      issues.push({
        path: `relationships.${relationship.relationshipId}.axisVectorLocal`,
        message: `Rotational relationship "${relationship.relationshipId}" of type "${relationship.type}" requires both axisVectorLocal and pivotLocalMm.`,
      })
    }
  }

  if (PATH_FOLLOWING_RELATIONSHIP_TYPES.includes(relationship.type)) {
    if (!relationship.pathId) {
      issues.push({
        path: `relationships.${relationship.relationshipId}.pathId`,
        message: `Path-following relationship "${relationship.relationshipId}" of type "${relationship.type}" requires a pathId.`,
      })
    }
  }

  if (CARRIES_RELATIONSHIP_TYPES.includes(relationship.type)) {
    if (!relationship.supportContactIds || relationship.supportContactIds.length === 0) {
      issues.push({
        path: `relationships.${relationship.relationshipId}.supportContactIds`,
        message: `"carries" relationship "${relationship.relationshipId}" requires at least one support/contact definition.`,
      })
    }
  }

  return issues
}

export function validateRelationshipGraph(
  relationships: Relationship[],
  knownObjects: Map<string, RelationshipGraphObject>,
): ValidationIssue[] {
  return relationships.flatMap((r) => validateRelationship(r, knownObjects))
}
