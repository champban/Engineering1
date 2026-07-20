import { z } from 'zod'
import { isZeroVector } from '@/core/schema/primitives'
import type { ValidationIssue } from '@/core/validation/types'

export const RelationshipType = z.enum([
  'drives',
  'transmitsPowerTo',
  'rotates',
  'coupledTo',
  'gearCoupledTo',
  'beltCoupledTo',
  'carries',
  'follows',
  'feeds',
  'receives',
  'transfersTo',
  'accumulates',
  'indexes',
  'pushes',
  'blocks',
  'supports',
  'mountedOn',
  'attachedTo',
  'loads',
  'detects',
  'tracks',
  'rejects',
  'stops',
  'enables',
  'interlocks',
])
export type RelationshipType = z.infer<typeof RelationshipType>

export const ROTATIONAL_RELATIONSHIP_TYPES: RelationshipType[] = ['rotates']
export const PATH_FOLLOWING_RELATIONSHIP_TYPES: RelationshipType[] = ['follows']
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
  axisVectorLocal: z.tuple([z.number(), z.number(), z.number()]).optional(),
  pivotLocalMm: z.tuple([z.number(), z.number(), z.number()]).optional(),
  pathId: z.string().optional(),
  supportContactIds: z.array(z.string()).optional(),
  validation: RelationshipValidationStatus,
})
export type Relationship = z.infer<typeof Relationship>

export interface RelationshipGraphObject {
  objectId: string
  connectorIds: string[]
}

/** Validate conditions that do not require the complete project object graph. */
export function validateRelationshipStructure(
  relationship: Relationship,
  ownerObjectId?: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const path = `relationships.${relationship.relationshipId}`

  if (ownerObjectId && relationship.sourceObjectId !== ownerObjectId) {
    issues.push({
      path: `${path}.sourceObjectId`,
      message: `Outbound relationship source "${relationship.sourceObjectId}" must match owning object "${ownerObjectId}".`,
    })
  }

  if (relationship.sourceObjectId === relationship.targetObjectId) {
    issues.push({
      path: `${path}.targetObjectId`,
      message: 'Relationship source and target must not be the same object.',
    })
  }

  if (ROTATIONAL_RELATIONSHIP_TYPES.includes(relationship.type)) {
    if (!relationship.axisVectorLocal || !relationship.pivotLocalMm) {
      issues.push({
        path: `${path}.axisVectorLocal`,
        message: `Rotational relationship "${relationship.relationshipId}" requires both axisVectorLocal and pivotLocalMm.`,
      })
    } else if (isZeroVector(relationship.axisVectorLocal)) {
      issues.push({
        path: `${path}.axisVectorLocal`,
        message: `Rotational relationship "${relationship.relationshipId}" requires a non-zero axisVectorLocal.`,
      })
    }
  }

  if (
    PATH_FOLLOWING_RELATIONSHIP_TYPES.includes(relationship.type) &&
    !relationship.pathId?.trim()
  ) {
    issues.push({
      path: `${path}.pathId`,
      message: `Path-following relationship "${relationship.relationshipId}" requires a pathId.`,
    })
  }

  if (
    CARRIES_RELATIONSHIP_TYPES.includes(relationship.type) &&
    (!relationship.supportContactIds ||
      relationship.supportContactIds.length === 0)
  ) {
    issues.push({
      path: `${path}.supportContactIds`,
      message: `"carries" relationship "${relationship.relationshipId}" requires at least one support/contact definition.`,
    })
  }

  return issues
}

/** Validate object and connector references using the complete project graph. */
export function validateRelationship(
  relationship: Relationship,
  knownObjects: Map<string, RelationshipGraphObject>,
): ValidationIssue[] {
  const issues = validateRelationshipStructure(relationship)
  const path = `relationships.${relationship.relationshipId}`
  const source = knownObjects.get(relationship.sourceObjectId)
  const target = knownObjects.get(relationship.targetObjectId)

  if (!source) {
    issues.push({
      path: `${path}.sourceObjectId`,
      message: `Relationship "${relationship.relationshipId}" references missing source object "${relationship.sourceObjectId}".`,
    })
  }
  if (!target) {
    issues.push({
      path: `${path}.targetObjectId`,
      message: `Relationship "${relationship.relationshipId}" references missing target object "${relationship.targetObjectId}".`,
    })
  }

  if (
    source &&
    relationship.sourceConnectorId !== 'N/A' &&
    !source.connectorIds.includes(relationship.sourceConnectorId)
  ) {
    issues.push({
      path: `${path}.sourceConnectorId`,
      message: `Source connector "${relationship.sourceConnectorId}" does not exist on object "${relationship.sourceObjectId}".`,
    })
  }
  if (
    target &&
    relationship.targetConnectorId !== 'N/A' &&
    !target.connectorIds.includes(relationship.targetConnectorId)
  ) {
    issues.push({
      path: `${path}.targetConnectorId`,
      message: `Target connector "${relationship.targetConnectorId}" does not exist on object "${relationship.targetObjectId}".`,
    })
  }

  return issues
}

export function validateRelationshipGraph(
  relationships: Relationship[],
  knownObjects: Map<string, RelationshipGraphObject>,
): ValidationIssue[] {
  return relationships.flatMap((relationship) =>
    validateRelationship(relationship, knownObjects),
  )
}
