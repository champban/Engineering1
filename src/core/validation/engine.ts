import { CoreObjectSchema, type CoreObject } from '@/core/schema/core-object'
import { type ValidationIssue, type ValidationResult, combine } from './types'
import {
  validateDimensionStructure,
  areRequiredDimensionsResolved,
} from '@/domain/objects/dimensions'
import {
  validateMassStructure,
  isMassResolvedForRelease,
} from '@/domain/objects/physical'
import { validateCollisionStructure } from '@/domain/objects/collision'
import { validateMotionStructure } from '@/domain/motion/motion'
import {
  validateOrientationStructure,
  isOrientationResolvedForRelease,
} from '@/domain/orientation/orientation'
import {
  validateRelationshipGraph,
  validateRelationshipStructure,
  type RelationshipGraphObject,
} from '@/domain/relationships/relationships'
import { isResolved } from '@/core/schema/primitives'

const PRODUCT_TOKENS = [
  'product',
  'cookie',
  'biscuit',
  'payload',
  'pack',
  'multipack',
  'case',
  'carton',
  'pallet',
]

function isProduct(object: CoreObject): boolean {
  const values = [
    object.identity.category,
    object.identity.subCategory,
    ...object.identity.tags,
  ].map((value) => value.toLowerCase())

  return values.some((value) =>
    PRODUCT_TOKENS.some((token) =>
      new RegExp(`(^|[_\\-\\s])${token}([_\\-\\s]|$)`).test(value),
    ),
  )
}

export interface ValidationContext {
  /** Complete object/connector graph when project-level reference checks are possible. */
  relationshipObjects?: Map<string, RelationshipGraphObject>
}

/** Draft validation. */
export function validateDraft(
  object: CoreObject,
  context: ValidationContext = {},
): ValidationResult {
  const relationshipStructureIssues = object.connections.flatMap((relationship) =>
    validateRelationshipStructure(relationship, object.objectId),
  )
  const relationshipGraphIssues = context.relationshipObjects
    ? validateRelationshipGraph(object.connections, context.relationshipObjects)
    : []

  return combine(
    validateDimensionStructure(object.geometry.shapeType, object.dimensions),
    validateMassStructure(object.physical),
    validateCollisionStructure(object.collision),
    validateMotionStructure(object.motion),
    validateOrientationStructure(object.orientation),
    relationshipStructureIssues,
    relationshipGraphIssues,
  )
}

/** Verified validation. */
export function validateVerified(
  object: CoreObject,
  context: ValidationContext = {},
): ValidationResult {
  const draft = validateDraft(object, context)
  const issues: ValidationIssue[] = [...draft.issues]

  if (
    !areRequiredDimensionsResolved(
      object.geometry.shapeType,
      object.dimensions,
    )
  ) {
    issues.push({
      path: 'dimensions',
      message: `Required dimensions for shape "${object.geometry.shapeType}" must be resolved before verification.`,
    })
  }
  if (!isSurfaceResolved(object)) {
    issues.push({
      path: 'surface.status',
      message:
        'Surface must be resolved (status verified/estimated) before verification.',
    })
  }
  if (!isMassResolvedForRelease(object.physical)) {
    issues.push({
      path: 'physical.mass.value',
      message: 'Mass must be resolved before verification.',
    })
  }
  if (isProduct(object) && !isOrientationResolvedForRelease(object.orientation)) {
    issues.push({
      path: 'orientation',
      message:
        'Product orientation and mandatory product landmarks must be resolved before verification.',
    })
  }

  return { valid: issues.length === 0, issues }
}

/** Released validation. */
export function validateReleased(
  object: CoreObject,
  context: ValidationContext = {},
): ValidationResult {
  const verified = validateVerified(object, context)
  const issues: ValidationIssue[] = [...verified.issues]

  if (!object.lifecycle.revision.trim()) {
    issues.push({
      path: 'lifecycle.revision',
      message: 'A revision must be assigned before release.',
    })
  }

  if (object.lifecycle.verificationStatus !== 'verified') {
    issues.push({
      path: 'lifecycle.verificationStatus',
      message: 'Lifecycle verificationStatus must be verified before release.',
    })
  }
  if (
    !object.lifecycle.verifiedBy.trim() ||
    object.lifecycle.verifiedBy.trim().toLowerCase() === 'n/a'
  ) {
    issues.push({
      path: 'lifecycle.verifiedBy',
      message: 'verifiedBy must identify the verifier before release.',
    })
  }
  if (!object.lifecycle.verifiedAt) {
    issues.push({
      path: 'lifecycle.verifiedAt',
      message: 'verifiedAt must be recorded before release.',
    })
  }

  if (hasUnresolvedMandatoryValue(object)) {
    issues.push({
      path: 'lifecycle.status',
      message:
        'Released objects may not contain unresolved mandatory (unknown/pending) values.',
    })
  }

  return { valid: issues.length === 0, issues }
}

function isSurfaceResolved(object: CoreObject): boolean {
  return (
    object.surface.status === 'verified' || object.surface.status === 'estimated'
  )
}

function hasUnresolvedMandatoryValue(object: CoreObject): boolean {
  if (!isMassResolvedForRelease(object.physical)) return true
  if (
    !areRequiredDimensionsResolved(
      object.geometry.shapeType,
      object.dimensions,
    )
  ) {
    return true
  }
  if (!isSurfaceResolved(object)) return true
  if (isProduct(object) && !isOrientationResolvedForRelease(object.orientation)) {
    return true
  }
  return false
}

/** Parses unknown input against the schema without unsafe casting on failure. */
export function parseCoreObject(
  input: unknown,
): { object: CoreObject | null; issues: ValidationIssue[] } {
  const result = CoreObjectSchema.safeParse(input)
  if (result.success) {
    return { object: result.data, issues: [] }
  }
  const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
  return { object: null, issues }
}

export { isResolved }
