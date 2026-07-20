import { z } from 'zod'
import { DimensionValue, isResolved } from '@/core/schema/primitives'
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
  customParameterReference: z.string().optional(),
  boundingBox: BoundingBox,
})
export type Dimensions = z.infer<typeof Dimensions>

/**
 * Required-parameter table from CORE_OBJECT_SCHEMA_V1.md #8, "Required
 * parameters by shape". `innerDiameter` and `wallThickness` are alternatives
 * for hollow shapes, handled specially below.
 */
export const REQUIRED_DIMENSIONS_BY_SHAPE: Record<ShapeType, (keyof Dimensions)[]> = {
  box: ['length', 'width', 'height'],
  rounded_box: ['length', 'width', 'height', 'cornerRadius'],
  cylinder: ['diameter', 'length'],
  hollow_cylinder: ['outerDiameter', 'length'], // + innerDiameter or wallThickness
  sphere: ['diameter'],
  hemisphere: ['diameter'],
  cone: ['baseDiameter', 'height'],
  truncated_cone: ['baseDiameter', 'topDiameter', 'height'],
  pipe: ['outerDiameter', 'length'], // + innerDiameter or wallThickness
  torus: ['majorDiameter', 'minorDiameter'],
  extruded_profile: ['profileBoundingWidth', 'profileBoundingHeight', 'extrusionLength'],
  revolved_profile: [],
  mesh_scan: ['boundingLength', 'boundingWidth', 'boundingHeight'],
  custom: ['boundingLength', 'boundingWidth', 'boundingHeight'],
}

const HOLLOW_SHAPES: ShapeType[] = ['hollow_cylinder', 'pipe']

/**
 * Structural/draft validation for shape-dependent dimensions.
 *
 * Blocking rules enforced here (work order #6, CORE_OBJECT_SCHEMA_V1.md #8):
 * - Applicable diameter/required fields may not be absent.
 * - Outer diameter must exceed inner diameter.
 * - Known length/width/height/diameter/radius/thickness must be positive.
 * - Unknown values must use `null`, never `0`.
 */
export function validateDimensionStructure(
  shapeType: ShapeType,
  dimensions: Dimensions,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const required = REQUIRED_DIMENSIONS_BY_SHAPE[shapeType] ?? []

  for (const key of required) {
    const entry = dimensions[key] as z.infer<typeof DimensionValue> | undefined
    if (!entry) {
      issues.push({
        path: `dimensions.${String(key)}`,
        message: `${String(key)} is required for shape "${shapeType}" and must not be absent.`,
      })
      continue
    }
    if (entry.value !== null && entry.value <= 0) {
      issues.push({
        path: `dimensions.${String(key)}.value`,
        message: `${String(key)} must be positive when known; ${entry.value} is not valid.`,
      })
    }
    if (entry.value === 0) {
      issues.push({
        path: `dimensions.${String(key)}.value`,
        message: `${String(key)} uses 0 to represent an unknown value; use null with status "unknown" instead.`,
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
    if (
      outer?.value !== undefined &&
      outer?.value !== null &&
      inner?.value !== undefined &&
      inner?.value !== null &&
      outer.value <= inner.value
    ) {
      issues.push({
        path: 'dimensions.outerDiameter',
        message: `outerDiameter (${outer.value}) must exceed innerDiameter (${inner.value}).`,
      })
    }
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
    const entry = dimensions[key] as z.infer<typeof DimensionValue> | undefined
    if (!isResolved(entry)) return false
  }
  if (HOLLOW_SHAPES.includes(shapeType)) {
    const innerOk = isResolved(dimensions.innerDiameter)
    const wallOk = isResolved(dimensions.wallThickness)
    if (!innerOk && !wallOk) return false
  }
  return true
}
