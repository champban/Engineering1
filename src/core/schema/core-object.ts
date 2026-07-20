import { z } from 'zod'
import { Identity, Lifecycle } from '@/domain/objects/identity'
import { Geometry } from '@/domain/objects/geometry'
import { Dimensions } from '@/domain/objects/dimensions'
import { Surface } from '@/domain/objects/surface'
import { Physical } from '@/domain/objects/physical'
import { Transform } from '@/domain/objects/transform'
import { Hierarchy } from '@/domain/objects/hierarchy'
import { Orientation } from '@/domain/orientation/orientation'
import { Motion } from '@/domain/motion/motion'
import { Collision } from '@/domain/objects/collision'
import { Relationship } from '@/domain/relationships/relationships'
import { Measurements } from '@/domain/objects/measurements'
import { ExtendedProperties, Audit } from '@/domain/objects/extended'

export const SCHEMA_VERSION = '1.0.0' as const

/**
 * CORE_OBJECT_SCHEMA_V1.md #3-4: top-level object structure. Every field
 * listed as mandatory in the source document is required here (rule #22:
 * Claude must not rename or remove mandatory fields without a new approved
 * schema version).
 */
export const CoreObjectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  objectId: z.string().min(1),
  identity: Identity,
  lifecycle: Lifecycle,
  geometry: Geometry,
  dimensions: Dimensions,
  surface: Surface,
  physical: Physical,
  transform: Transform,
  hierarchy: Hierarchy,
  orientation: Orientation,
  motion: Motion,
  collision: Collision,
  connections: z.array(Relationship).default([]),
  measurements: Measurements.default([]),
  extendedProperties: ExtendedProperties.default({}),
  audit: Audit,
})

export type CoreObject = z.infer<typeof CoreObjectSchema>

export {
  Identity,
  Lifecycle,
  Geometry,
  Dimensions,
  Surface,
  Physical,
  Transform,
  Hierarchy,
  Orientation,
  Motion,
  Collision,
  Relationship,
  Measurements,
  ExtendedProperties,
  Audit,
}
