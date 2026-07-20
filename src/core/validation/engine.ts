import { CoreObjectSchema, type CoreObject } from '@/core/schema/core-object'
import {
  type ValidationIssue,
  type ValidationResult,
  combine,
} from './types'
import { validateDimensionStructure, areRequiredDimensionsResolved } from '@/domain/objects/dimensions'
import { validateMassStructure, isMassResolvedForRelease } from '@/domain/objects/physical'
import { validateCollisionStructure } from '@/domain/objects/collision'
import { validateMotionStructure } from '@/domain/motion/motion'
import {
  validateOrientationStructure,
  isOrientationResolvedForRelease,
} from '@/domain/orientation/orientation'
import {
  validateRelationshipGraph,
  type RelationshipGraphObject,
} from '@/domain/relationships/relationships'
import { isResolved } from '@/core/schema/primitives'

/** Object categories treated as products, for which orientation is mandatory. */
const PRODUCT_CATEGORIES = ['product', 'cookie']

function isProduct(object: CoreObject): boolean {
  return PRODUCT_CATEGORIES.includes(object.identity.category)
}

/**
 * Draft validation (work order #10):
 * - Mandatory field structures must exist (Zod-parsed already).
 * - `unknown`/`pending` values allowed.
 * - Invalid units, invalid vectors, and negative known engineering values blocked.
 *
 * Accepts a value that has already passed Zod parsing.
 */
export function validateDraft(object: CoreObject): ValidationResult {
  const relationshipObjects = buildLocalRelationshipMap(object)
  return combine(
    validateDimensionStructure(object.geometry.shapeType, object.dimensions),
    validateMassStructure(object.physical),
    validateCollisionStructure(object.collision),
    validateMotionStructure(object.motion),
    isProduct(object) ? validateOrientationStructure(object.orientation) : [],
    validateRelationshipGraph(object.connections, relationshipObjects),
  )
}

/**
 * Verified validation (work order #10):
 * - Mandatory dimensions resolved.
 * - Applicable diameter resolved (part of the shape's required set).
 * - Surface resolved.
 * - Mass resolved.
 * - Product orientation resolved.
 */
export function validateVerified(object: CoreObject): ValidationResult {
  const draft = validateDraft(object)
  const issues: ValidationIssue[] = [...draft.issues]

  if (!areRequiredDimensionsResolved(object.geometry.shapeType, object.dimensions)) {
    issues.push({
      path: 'dimensions',
      message: `Required dimensions for shape "${object.geometry.shapeType}" must be resolved before verification.`,
    })
  }
  if (!isSurfaceResolved(object)) {
    issues.push({
      path: 'surface.status',
      message: 'Surface must be resolved (status verified/estimated) before verification.',
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
      message: 'Product orientation mode/status must be resolved before verification.',
    })
  }

  return { valid: issues.length === 0, issues }
}

/**
 * Released validation (work order #10):
 * - All Verified requirements pass.
 * - Revision exists.
 * - No mandatory `unknown` or `pending` values remain.
 */
export function validateReleased(object: CoreObject): ValidationResult {
  const verified = validateVerified(object)
  const issues: ValidationIssue[] = [...verified.issues]

  if (!object.lifecycle.revision || object.lifecycle.revision.trim() === '') {
    issues.push({
      path: 'lifecycle.revision',
      message: 'A revision must be assigned before release.',
    })
  }

  if (hasUnresolvedMandatoryValue(object)) {
    issues.push({
      path: 'lifecycle.status',
      message: 'Released objects may not contain unresolved mandatory (unknown/pending) values.',
    })
  }

  return { valid: issues.length === 0, issues }
}

function isSurfaceResolved(object: CoreObject): boolean {
  return (
    object.surface.status === 'verified' || object.surface.status === 'estimated'
  )
}

/** Checks mandatory engineering values for lingering unknown/pending states. */
function hasUnresolvedMandatoryValue(object: CoreObject): boolean {
  if (!isMassResolvedForRelease(object.physical)) return true
  if (!areRequiredDimensionsResolved(object.geometry.shapeType, object.dimensions)) {
    return true
  }
  if (!isSurfaceResolved(object)) return true
  if (isProduct(object) && !isOrientationResolvedForRelease(object.orientation)) {
    return true
  }
  return false
}

/**
 * Builds a relationship-resolution map from an object's own connectors, so a
 * single object's outbound relationships can be structurally validated in
 * isolation. Assembly-level validation supplies a richer map.
 */
function buildLocalRelationshipMap(
  object: CoreObject,
): Map<string, RelationshipGraphObject> {
  const map = new Map<string, RelationshipGraphObject>()
  map.set(object.objectId, { objectId: object.objectId, connectorIds: [] })
  for (const rel of object.connections) {
    if (!map.has(rel.targetObjectId)) {
      map.set(rel.targetObjectId, {
        objectId: rel.targetObjectId,
        connectorIds: [],
      })
    }
  }
  return map
}

/** Parses unknown input against the schema, returning issues on failure. */
export function parseCoreObject(
  input: unknown,
): { object: CoreObject; issues: ValidationIssue[] } {
  const result = CoreObjectSchema.safeParse(input)
  if (result.success) {
    return { object: result.data, issues: [] }
  }
  const issues: ValidationIssue[] = result.error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))
  return { object: input as CoreObject, issues }
}

export { isResolved }
