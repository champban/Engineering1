import { z } from 'zod'
import {
  Vector3,
  approxEqual,
  dotProduct,
  isZeroVector,
  vectorLength,
} from '@/core/schema/primitives'
import type { ValidationIssue } from '@/core/validation/types'

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #4 Orientation modes. */
export const OrientationMode = z.enum([
  'lengthwise',
  'crosswise',
  'edge_leading',
  'corner_leading',
  'fixed_angle',
  'face_up',
  'face_down',
  'random',
  'stacked',
  'nested',
  'custom',
  'unknown',
])
export type OrientationMode = z.infer<typeof OrientationMode>

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #2 Orientation reference frames. */
export const ReferenceFrame = z.enum(['world', 'transport', 'processInterface'])
export type ReferenceFrame = z.infer<typeof ReferenceFrame>

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #5 Path behavior. */
export const PathBehavior = z.enum([
  'follow_tangent',
  'maintain_world_orientation',
  'maintain_relative_orientation',
  'rotate_fixed_angle',
  'rotate_gradually',
  'align_to_centerline',
  'free_rotation',
  'flip',
])
export type PathBehavior = z.infer<typeof PathBehavior>

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #6 Orientation status. */
export const OrientationStatus = z.enum([
  'correct',
  'acceptable',
  'misaligned',
  'rotated',
  'flipped',
  'overlapped',
  'tilted',
  'unknown',
  'rejected',
])
export type OrientationStatus = z.infer<typeof OrientationStatus>

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #16 Orientation source and confidence. */
export const OrientationSource = z.enum([
  'user_defined',
  'cad_defined',
  'vision_detected',
  'simulation_calculated',
  'sensor_reported',
  'estimated',
  'unknown',
])
export type OrientationSource = z.infer<typeof OrientationSource>

/** PRODUCT_ORIENTATION_SCHEMA_V1.md #3 Mandatory orientation object. */
export const Orientation = z.object({
  mode: OrientationMode,
  referenceFrame: ReferenceFrame,
  forwardVectorLocal: Vector3,
  upVectorLocal: Vector3,
  rightVectorLocal: Vector3,
  faceUp: z.string().min(1),
  contactFace: z.string().min(1),
  leadingEdge: z.string().min(1),
  trailingEdge: z.string().default('N/A'),
  rotationRelativeToFlowDeg: z.number(),
  skewAngleDeg: z.number(),
  tiltAngleDeg: z.number(),
  rollAngleDeg: z.number().default(0),
  laneId: z.string().min(1),
  lateralOffsetMm: z.number(),
  verticalOffsetMm: z.number().default(0),
  pathBehavior: PathBehavior,
  status: OrientationStatus,
  confidence: z.number().min(0).max(1).default(1),
  source: OrientationSource,
})
export type Orientation = z.infer<typeof Orientation>

/**
 * Blocking orientation validation (PRODUCT_ORIENTATION_SCHEMA_V1.md #17,
 * work order #6):
 * - Zero forward or up vector.
 * - Forward and up vectors are not sufficiently independent (approximately
 *   orthogonal).
 * - Released product has unknown mode or status.
 */
export function validateOrientationStructure(
  orientation: Orientation,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const { forwardVectorLocal: forward, upVectorLocal: up } = orientation

  if (isZeroVector(forward)) {
    issues.push({
      path: 'orientation.forwardVectorLocal',
      message: 'forwardVectorLocal must not be a zero vector.',
    })
  }
  if (isZeroVector(up)) {
    issues.push({
      path: 'orientation.upVectorLocal',
      message: 'upVectorLocal must not be a zero vector.',
    })
  }

  if (!isZeroVector(forward) && !isZeroVector(up)) {
    const cosine =
      dotProduct(forward, up) / (vectorLength(forward) * vectorLength(up))
    if (!approxEqual(cosine, 0, 0.05)) {
      issues.push({
        path: 'orientation.upVectorLocal',
        message:
          'forwardVectorLocal and upVectorLocal must be approximately orthogonal.',
      })
    }
  }

  return issues
}

export function isOrientationResolvedForRelease(
  orientation: Orientation,
): boolean {
  return orientation.mode !== 'unknown' && orientation.status !== 'unknown'
}

/**
 * PRODUCT_ORIENTATION_SCHEMA_V1.md #8 Projected dimensions.
 *
 * Preliminary 2D footprint projection for a rectangular product with local
 * length `lengthMm` and width `widthMm`, at in-plane rotation `thetaDeg`
 * relative to the flow direction (0deg = lengthwise, 90deg = crosswise).
 */
export function projectedLengthAlongFlowMm(
  lengthMm: number,
  widthMm: number,
  thetaDeg: number,
): number {
  const theta = (thetaDeg * Math.PI) / 180
  return Math.abs(lengthMm * Math.cos(theta)) + Math.abs(widthMm * Math.sin(theta))
}

export function projectedWidthAcrossFlowMm(
  lengthMm: number,
  widthMm: number,
  thetaDeg: number,
): number {
  const theta = (thetaDeg * Math.PI) / 180
  return Math.abs(lengthMm * Math.sin(theta)) + Math.abs(widthMm * Math.cos(theta))
}

/**
 * PRODUCT_ORIENTATION_SCHEMA_V1.md #9 Pitch and capacity dependency.
 *
 * `pitch = projectedLengthAlongFlow + targetGap`
 */
export function effectivePitchMm(
  projectedLengthAlongFlowMmValue: number,
  targetGapMm: number,
): number {
  return projectedLengthAlongFlowMmValue + targetGapMm
}

/** Nominal single-lane throughput, PRODUCT_ORIENTATION_SCHEMA_V1.md #9. */
export function productsPerMinute(beltSpeedMps: number, pitchMm: number): number {
  const pitchM = pitchMm / 1000
  if (pitchM <= 0) return 0
  return (beltSpeedMps / pitchM) * 60
}

export interface OrientationToleranceCheckInput {
  rotationRelativeToFlowDeg: number
  skewAngleDeg: number
  tiltAngleDeg: number
  lateralOffsetMm: number
  targetRotationRelativeToFlowDeg: number
  rotationToleranceDeg: number
  skewToleranceDeg: number
  tiltToleranceDeg: number
  lateralOffsetToleranceMm: number
}

export interface OrientationToleranceResult {
  passed: boolean
  failures: string[]
}

/**
 * PRODUCT_ORIENTATION_SCHEMA_V1.md #11 Orientation requirements at machine
 * interfaces: evaluate pass/fail against a machine acceptance window.
 */
export function evaluateOrientationTolerance(
  input: OrientationToleranceCheckInput,
): OrientationToleranceResult {
  const failures: string[] = []

  const rotationDelta = Math.abs(
    input.rotationRelativeToFlowDeg - input.targetRotationRelativeToFlowDeg,
  )
  if (rotationDelta > input.rotationToleranceDeg) {
    failures.push(
      `rotation delta ${rotationDelta.toFixed(2)}deg exceeds tolerance ${input.rotationToleranceDeg}deg`,
    )
  }
  if (Math.abs(input.skewAngleDeg) > input.skewToleranceDeg) {
    failures.push(
      `skew ${input.skewAngleDeg}deg exceeds tolerance ${input.skewToleranceDeg}deg`,
    )
  }
  if (Math.abs(input.tiltAngleDeg) > input.tiltToleranceDeg) {
    failures.push(
      `tilt ${input.tiltAngleDeg}deg exceeds tolerance ${input.tiltToleranceDeg}deg`,
    )
  }
  if (Math.abs(input.lateralOffsetMm) > input.lateralOffsetToleranceMm) {
    failures.push(
      `lateral offset ${input.lateralOffsetMm}mm exceeds tolerance ${input.lateralOffsetToleranceMm}mm`,
    )
  }

  return { passed: failures.length === 0, failures }
}
