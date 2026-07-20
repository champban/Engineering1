import { z } from 'zod'
import {
  DimensionValue,
  Vector3,
  isResolved,
  isZeroVector,
} from '@/core/schema/primitives'
import { toMillimetres } from '@/core/validation/units'
import type { ShapeType } from './geometry'
import type { ValidationIssue } from '@/core/validation/types'

/** CORE_OBJECT_SCHEMA_V1.md #8 Shape-dependent dimensions */
export const UnitSystem = z.enum(['metric', 'imperial'])
export type UnitSystem = z.infer<typeof UnitSystem>

export const BoundingBox = z.object({
  lengthMm: z.number().nullable(),
  widthMm: z.number().nullable(),
  heightMm: z.number().nullable(),
})
export type BoundingBox = z.infer<typeof BoundingBox>

const dim = DimensionValue.optional()

export const Dimensions = z.object({
  unitSystem: UnitSystem,
  length: dim,
  width: dim,
  height: dim,
  cornerRadius: dim,
  diameter: dim,
  outerDiameter: dim,
  innerDiameter: dim,
  wallThickness: dim,
  baseDiameter: dim,
  topDiameter: dim,
  majorDiameter: dim,
  minorDiameter: dim,
  profileBoundingWidth: dim,
  profileBoundingHeight: dim,
  extrusionLength: dim,
  boundingLength: dim,
  boundingWidth: dim,
  boundingHeight: dim,
  profileReference: z.string().optional(),
  revolutionAxis: Vector3.optional(),
  customParameterReference: z.string().optional(),
  boundingBox: BoundingBox,
})
export type Dimensions = z.infer<typeof Dimensions>

const DIMENSION_VALUE_KEYS = [
  'length',
  'width',
  'height',
  'cornerRadius',
  'diameter',
  'outerDiameter',
  'innerDiameter',
  'wallThickness',
  'baseDiameter',
  'topDiameter',
  'majorDiameter',
  'minorDiameter',
  'profileBoundingWidth',
  'profileBoundingHeight',
  'extrusionLength',
  'boundingLength',
  'boundingWidth',
  'boundingHeight',
] as const

type DimensionValueKey = (typeof DIMENSION_VALUE_KEYS)[number]

/** Required numeric parameters by shape. */
export const REQUIRED_DIMENSIONS_BY_SHAPE: Record<
  ShapeType,
  DimensionValueKey[]
> = {
  box: ['length', 'width', 'height'],
  rounded_box: ['length', 'width', 'height', 'cornerRadius'],
  cylinder: ['diameter', 'length'],
  hollow_cylinder: ['outerDiameter', 'length'],
  sphere: ['diameter'],
  hemisphere: ['diameter'],
  cone: ['baseDiameter', 'height'],
  truncated_cone: ['baseDiameter', 'topDiameter', 'height'],
  pipe: ['outerDiameter', 'length'],
  torus: ['majorDiameter', 'minorDiameter'],
  extruded_profile: [
    'profileBoundingWidth',
    'profileBoundingHeight',
    'extrusionLength',
  ],
  revolved_profile: [],
  mesh_scan: ['boundingLength', 'boundingWidth', 'boundingHeight'],
  custom: ['boundingLength', 'boundingWidth', 'boundingHeight'],
}

const HOLLOW_SHAPES: ShapeType[] = ['hollow_cylinder', 'pipe']
const RESOLVED_STATUSES = new Set(['verified', 'estimated'])
const UNRESOLVED_STATUSES = new Set(['unknown', 'pending', 'not_applicable'])

/** Draft validation for every supplied dimension value, not only required ones. */
function validateDimensionEntry(
  key: DimensionValueKey,
  entry: z.infer<typeof DimensionValue>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const path = `dimensions.${key}`

  if (RESOLVED_STATUSES.has(entry.status) && entry.value === null) {
    issues.push({
      path: `${path}.value`,
      message: `${key} is marked ${entry.status} but has no numeric value.`,
    })
  }

  if (UNRESOLVED_STATUSES.has(entry.status) && entry.value !== null) {
    issues.push({
      path: `${path}.value`,
      message: `${key} is marked ${entry.status}; unresolved values must use null.`,
    })
  }

  if (entry.value !== null && entry.value <= 0) {
    issues.push({
      path: `${path}.value`,
      message:
        entry.value === 0
          ? `${key} must be positive; use null with status "unknown" instead of 0.`
          : `${key} must be positive when known; ${entry.value} is not valid.`,
    })
  }

  if (RESOLVED_STATUSES.has(entry.status) && entry.source === 'unknown') {
    issues.push({
      path: `${path}.source`,
      message: `${key} is resolved but its source is still unknown.`,
    })
  }

  return issues
}

/** Structural/draft validation for shape-dependent dimensions. */
export function validateDimensionStructure(
  shapeType: ShapeType,
  dimensions: Dimensions,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const required = REQUIRED_DIMENSIONS_BY_SHAPE[shapeType] ?? []

  for (const key of DIMENSION_VALUE_KEYS) {
    const entry = dimensions[key]
    if (entry) issues.push(...validateDimensionEntry(key, entry))
  }

  for (const key of required) {
    if (!dimensions[key]) {
      issues.push({
        path: `dimensions.${key}`,
        message: `${key} is required for shape "${shapeType}" and must not be absent.`,
      })
    }
  }

  for (const [key, value] of Object.entries(dimensions.boundingBox)) {
    if (value !== null && value <= 0) {
      issues.push({
        path: `dimensions.boundingBox.${key}`,
        message: `${key} must be positive when known; ${value} is not valid.`,
      })
    }
  }

  if (HOLLOW_SHAPES.includes(shapeType)) {
    const hasInner = dimensions.innerDiameter !== undefined
    const hasWall = dimensions.wallThickness !== undefined
    if (!hasInner && !hasWall) {
      issues.push({
        path: 'dimensions.innerDiameter',
        message:
          'Hollow shapes require innerDiameter or wallThickness and neither is present.',
      })
    }

    const outer = dimensions.outerDiameter
    const inner = dimensions.innerDiameter
    const wall = dimensions.wallThickness
    const outerMm = outer ? toMillimetres(outer.value, outer.unit) : null
    const innerMm = inner ? toMillimetres(inner.value, inner.unit) : null
    const wallMm = wall ? toMillimetres(wall.value, wall.unit) : null

    if (outerMm !== null && innerMm !== null && outerMm <= innerMm) {
      issues.push({
        path: 'dimensions.outerDiameter',
        message: `outerDiameter (${outerMm} mm) must exceed innerDiameter (${innerMm} mm).`,
      })
    }

    if (outerMm !== null && wallMm !== null && wallMm * 2 >= outerMm) {
      issues.push({
        path: 'dimensions.wallThickness',
        message:
          'wallThickness must be less than half of outerDiameter for a hollow shape.',
      })
    }
  }

  if (shapeType === 'revolved_profile') {
    if (!dimensions.profileReference?.trim()) {
      issues.push({
        path: 'dimensions.profileReference',
        message: 'revolved_profile requires a profileReference.',
      })
    }
    if (!dimensions.revolutionAxis || isZeroVector(dimensions.revolutionAxis)) {
      issues.push({
        path: 'dimensions.revolutionAxis',
        message: 'revolved_profile requires a non-zero revolutionAxis.',
      })
    }
  }

  if (shapeType === 'custom' && !dimensions.customParameterReference?.trim()) {
    issues.push({
      path: 'dimensions.customParameterReference',
      message: 'custom shape requires a customParameterReference.',
    })
  }

  return issues
}

/** Verified-level check: all required dimensions for the shape are resolved. */
export function areRequiredDimensionsResolved(
  shapeType: ShapeType,
  dimensions: Dimensions,
): boolean {
  const required = REQUIRED_DIMENSIONS_BY_SHAPE[shapeType] ?? []
  for (const key of required) {
    if (!isResolved(dimensions[key])) return false
  }

  if (HOLLOW_SHAPES.includes(shapeType)) {
    if (
      !isResolved(dimensions.innerDiameter) &&
      !isResolved(dimensions.wallThickness)
    ) {
      return false
    }
  }

  if (shapeType === 'revolved_profile') {
    if (!dimensions.profileReference?.trim()) return false
    if (!dimensions.revolutionAxis || isZeroVector(dimensions.revolutionAxis)) {
      return false
    }
  }

  if (shapeType === 'custom' && !dimensions.customParameterReference?.trim()) {
    return false
  }

  return true
}
