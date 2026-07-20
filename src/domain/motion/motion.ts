import { z } from 'zod'
import { Vector3, isZeroVector } from '@/core/schema/primitives'
import type { ValidationIssue } from '@/core/validation/types'

/** CORE_OBJECT_SCHEMA_V1.md #14 Motion-ready properties. */
export const MotionCapability = z.enum([
  'static',
  'movable',
  'rotatable',
  'linear',
  'path_following',
  'compound',
  'unknown',
])
export type MotionCapability = z.infer<typeof MotionCapability>

export const MotionType = z.enum([
  'none',
  'rotation',
  'translation',
  'path',
  'compound',
])
export type MotionType = z.infer<typeof MotionType>

export const ALLOWED_MOTION_TYPES_BY_CAPABILITY: Record<
  MotionCapability,
  MotionType[]
> = {
  static: ['none'],
  movable: ['translation', 'compound'],
  rotatable: ['rotation'],
  linear: ['translation'],
  path_following: ['path'],
  compound: ['compound'],
  unknown: ['none', 'rotation', 'translation', 'path', 'compound'],
}

export const MotionLimits = z.object({
  minimumPositionMm: z.number().nullable(),
  maximumPositionMm: z.number().nullable(),
  minimumAngleDeg: z.number().nullable(),
  maximumAngleDeg: z.number().nullable(),
  continuousRotation: z.boolean(),
  status: z.enum(['configured', 'unknown', 'not_applicable']),
})
export type MotionLimits = z.infer<typeof MotionLimits>

export const MotionState = z.string().min(1)

export const AnimationTrack = z.object({
  trackId: z.string(),
  targetProperty: z.string(),
  keyframes: z.array(z.unknown()).default([]),
})
export type AnimationTrack = z.infer<typeof AnimationTrack>

export const MotionEvent = z.object({
  eventId: z.string(),
  type: z.string(),
  enabled: z.boolean().default(false),
})
export type MotionEvent = z.infer<typeof MotionEvent>

export const Motion = z.object({
  capability: MotionCapability,
  type: MotionType,
  enabled: z.boolean(),
  axisVectorLocal: Vector3,
  pivotLocalMm: Vector3,
  allowedTranslationAxes: z.array(z.enum(['x', 'y', 'z'])).default([]),
  allowedRotationAxes: z.array(z.enum(['x', 'y', 'z'])).default([]),
  limits: MotionLimits,
  initialState: MotionState,
  homeState: MotionState,
  availableStates: z.array(z.string()).default([]),
  animationTracks: z.array(AnimationTrack).default([]),
  events: z.array(MotionEvent).default([]),
})
export type Motion = z.infer<typeof Motion>

/** Blocking motion-ready validation. */
export function validateMotionStructure(motion: Motion): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const allowedTypes = ALLOWED_MOTION_TYPES_BY_CAPABILITY[motion.capability]

  if (!allowedTypes.includes(motion.type)) {
    issues.push({
      path: 'motion.type',
      message: `Motion type "${motion.type}" is not valid for capability "${motion.capability}". Allowed: ${allowedTypes.join(', ')}.`,
    })
  }

  if (motion.type === 'rotation' || motion.type === 'translation') {
    if (isZeroVector(motion.axisVectorLocal)) {
      issues.push({
        path: 'motion.axisVectorLocal',
        message: `${motion.type} motion requires a non-zero axisVectorLocal.`,
      })
    }
  }

  if (motion.type === 'rotation' && motion.allowedRotationAxes.length === 0) {
    issues.push({
      path: 'motion.allowedRotationAxes',
      message: 'Rotation motion requires at least one allowed rotation axis.',
    })
  }

  if (
    motion.type === 'translation' &&
    motion.allowedTranslationAxes.length === 0
  ) {
    issues.push({
      path: 'motion.allowedTranslationAxes',
      message: 'Translation motion requires at least one allowed translation axis.',
    })
  }

  if (motion.capability === 'static') {
    if (motion.enabled) {
      issues.push({
        path: 'motion.enabled',
        message: 'Static objects must have motion.enabled = false.',
      })
    }
    if (
      motion.allowedTranslationAxes.length > 0 ||
      motion.allowedRotationAxes.length > 0
    ) {
      issues.push({
        path: 'motion.allowedTranslationAxes',
        message: 'Static objects must declare no allowed motion axes.',
      })
    }
  }

  const limits = motion.limits
  if (
    limits.minimumPositionMm !== null &&
    limits.maximumPositionMm !== null &&
    limits.minimumPositionMm > limits.maximumPositionMm
  ) {
    issues.push({
      path: 'motion.limits.minimumPositionMm',
      message: 'minimumPositionMm must not exceed maximumPositionMm.',
    })
  }
  if (
    limits.minimumAngleDeg !== null &&
    limits.maximumAngleDeg !== null &&
    limits.minimumAngleDeg > limits.maximumAngleDeg
  ) {
    issues.push({
      path: 'motion.limits.minimumAngleDeg',
      message: 'minimumAngleDeg must not exceed maximumAngleDeg.',
    })
  }

  if (!motion.availableStates.includes(motion.initialState)) {
    issues.push({
      path: 'motion.initialState',
      message: 'initialState must be included in availableStates.',
    })
  }
  if (!motion.availableStates.includes(motion.homeState)) {
    issues.push({
      path: 'motion.homeState',
      message: 'homeState must be included in availableStates.',
    })
  }

  return issues
}

/** Static default factory (CORE_OBJECT_SCHEMA_V1.md #14 "Static default"). */
export function createStaticMotionDefaults(): Motion {
  return {
    capability: 'static',
    type: 'none',
    enabled: false,
    axisVectorLocal: [0, 0, 1],
    pivotLocalMm: [0, 0, 0],
    allowedTranslationAxes: [],
    allowedRotationAxes: [],
    limits: {
      minimumPositionMm: null,
      maximumPositionMm: null,
      minimumAngleDeg: null,
      maximumAngleDeg: null,
      continuousRotation: false,
      status: 'not_applicable',
    },
    initialState: 'static',
    homeState: 'static',
    availableStates: ['static'],
    animationTracks: [],
    events: [],
  }
}
