import { z } from 'zod'
import {
  Vector3,
  approxEqual,
  crossProduct,
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

function validateDirectionVector(
  path: string,
  vector: Vector3,
): ValidationIssue[] {
  if (isZeroVector(vector)) {
    return [{ path, message: `${path.split('.').at(-1)} must not be a zero vector.` }]
  }

  const length = vectorLength(vector)
  if (!approxEqual(length, 1, 0.05)) {
    return [
      {
        path,
        message: `${path.split('.').at(-1)} must be a unit direction vector; length is ${length.toFixed(4)}.`,
      },
    ]
  }

  return []
}

function orthogonalityIssue(
  firstPath: string,
  first: Vector3,
  secondPath: string,
  second: Vector3,
): ValidationIssue | null {
  if (isZeroVector(first) || isZeroVector(second)) return null
  const cosine = dotProduct(first, second) / (vectorLength(first) * vectorLength(second))
  if (approxEqual(cosine, 0, 0.05)) return null
  return {
    path: secondPath,
    message: `${firstPath.split('.').at(-1)} and ${secondPath.split('.').at(-1)} must be approximately orthogonal.`,
  }
}

/** Blocking orientation-vector validation. */
export function validateOrientationStructure(
  orientation: Orientation,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const forward = orientation.forwardVectorLocal
  const up = orientation.upVectorLocal
  const right = orientation.rightVectorLocal

  issues.push(
    ...validateDirectionVector('orientation.forwardVectorLocal', forward),
    ...validateDirectionVector('orientation.upVectorLocal', up),
    ...validateDirectionVector('orientation.rightVectorLocal', right),
  )

  for (const issue of [
    orthogonalityIssue(
      'orientation.forwardVectorLocal',
      forward,
      'orientation.upVectorLocal',
      up,
    ),
    orthogonalityIssue(
      'orientation.forwardVectorLocal',
      forward,
      'orientation.rightVectorLocal',
      right,
    ),
    orthogonalityIssue(
      'orientation.upVectorLocal',
      up,
      'orientation.rightVectorLocal',
      right,
    ),
  ]) {
    if (issue) issues.push(issue)
  }

  if (!isZeroVector(forward) && !isZeroVector(up) && !isZeroVector(right)) {
    const expectedRight = crossProduct(forward, up)
    const alignment =
      dotProduct(expectedRight, right) /
      (vectorLength(expectedRight) * vectorLength(right))
    if (alignment < 0.95) {
      issues.push({
        path: 'orientation.rightVectorLocal',
        message:
          'rightVectorLocal must be consistent with the right-handed forward × up orientation basis.',
      })
    }
  }

  return issues
}

function isResolvedLabel(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return normalized !== '' && normalized !== 'n/a' && normalized !== 'unknown'
}

export function isOrientationResolvedForRelease(
  orientation: Orientation,
): boolean {
  return (
    orientation.mode !== 'unknown' &&
    orientation.status !== 'unknown' &&
    orientation.source !== 'unknown' &&
    orientation.confidence > 0 &&
    isResolvedLabel(orientation.faceUp) &&
    isResolvedLabel(orientation.contactFace) &&
    isResolvedLabel(orientation.leadingEdge) &&
    isResolvedLabel(orientation.laneId) &&
    validateOrientationStructure(orientation).length === 0
  )
}

/** Preliminary 2D footprint projection for a rectangular product. */
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

/** `pitch = projectedLengthAlongFlow + targetGap`. */
export function effectivePitchMm(
  projectedLengthAlongFlowMmValue: number,
  targetGapMm: number,
): number {
  if (projectedLengthAlongFlowMmValue < 0 || targetGapMm < 0) return 0
  return projectedLengthAlongFlowMmValue + targetGapMm
}

/** Nominal single-lane throughput. */
export function productsPerMinute(beltSpeedMps: number, pitchMm: number): number {
  const pitchM = pitchMm / 1000
  if (beltSpeedMps <= 0 || pitchM <= 0) return 0
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

/** Absolute shortest circular angular distance in degrees, in the range 0..180. */
export function shortestAngularDeltaDeg(aDeg: number, bDeg: number): number {
  const signed = ((aDeg - bDeg + 180) % 360 + 360) % 360 - 180
  return Math.abs(signed)
}

/** Evaluate a machine-interface orientation acceptance window. */
export function evaluateOrientationTolerance(
  input: OrientationToleranceCheckInput,
): OrientationToleranceResult {
  const failures: string[] = []

  for (const [name, value] of Object.entries({
    rotationToleranceDeg: input.rotationToleranceDeg,
    skewToleranceDeg: input.skewToleranceDeg,
    tiltToleranceDeg: input.tiltToleranceDeg,
    lateralOffsetToleranceMm: input.lateralOffsetToleranceMm,
  })) {
    if (value < 0) failures.push(`${name} must not be negative`)
  }

  const rotationDelta = shortestAngularDeltaDeg(
    input.rotationRelativeToFlowDeg,
    input.targetRotationRelativeToFlowDeg,
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
