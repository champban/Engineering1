import { z } from 'zod'
import { Quaternion, Vector3 } from '@/core/schema/primitives'

/** CORE_OBJECT_SCHEMA_V1.md #11 Transform and coordinate system. */
export const CoordinateSpace = z.enum(['local', 'world', 'parent'])
export type CoordinateSpace = z.infer<typeof CoordinateSpace>

export const HomeTransform = z.object({
  positionMm: Vector3,
  rotationDegXYZ: Vector3,
  scaleXYZ: Vector3,
})
export type HomeTransform = z.infer<typeof HomeTransform>

export const Transform = z.object({
  positionMm: Vector3,
  rotationDegXYZ: Vector3,
  quaternionXYZW: Quaternion,
  scaleXYZ: Vector3,
  originLocalMm: Vector3,
  coordinateSpace: CoordinateSpace,
  homeTransform: HomeTransform,
})
export type Transform = z.infer<typeof Transform>
