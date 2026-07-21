// CoreObject type is used structurally via clone() of valid fixtures
import { cookieFixture } from '../valid/cookie'
import { motorFixture } from '../valid/motor'
import { beltFixture } from '../valid/belt'
import { platformFixture } from '../valid/platform'

/** Deep clone so each invalid case starts from a pristine valid base. */
function clone<T>(value: T): T {
  return structuredClone(value)
}

export interface InvalidFixture {
  key: string
  /** What the fixture violates (work order #6 list). */
  description: string
  /**
   * The level at which the violation must be caught:
   * - 'parse'  : rejected by Zod schema parsing
   * - 'draft'  : structurally invalid even for a draft
   * - 'verified': passes draft, fails verified
   * - 'released': passes verified, fails release
   */
  level: 'parse' | 'draft' | 'verified' | 'released'
  build: () => unknown
}

export const invalidFixtures: InvalidFixture[] = [
  {
    key: 'missing_shape_field',
    description: 'Missing mandatory shape field (geometry.shapeType absent)',
    level: 'parse',
    build: () => {
      const o = clone(beltFixture) as Record<string, unknown>
      const geometry = { ...(o.geometry as object) } as Record<string, unknown>
      delete geometry.shapeType
      o.geometry = geometry
      return o
    },
  },
  {
    key: 'missing_diameter_for_cylinder',
    description: 'Missing diameter for a cylinder',
    level: 'draft',
    build: () => {
      const o = clone(motorFixture)
      delete (o.dimensions as Record<string, unknown>).diameter
      return o
    },
  },
  {
    key: 'outer_le_inner_diameter',
    description: 'Outer diameter less than or equal to inner diameter',
    level: 'draft',
    build: () => {
      const o = clone(motorFixture)
      o.geometry.shapeType = 'hollow_cylinder'
      o.dimensions.outerDiameter = {
        value: 50,
        unit: 'mm',
        source: 'measured',
        status: 'verified',
        tolerance: 0.1,
      }
      o.dimensions.innerDiameter = {
        value: 60,
        unit: 'mm',
        source: 'measured',
        status: 'verified',
        tolerance: 0.1,
      }
      return o
    },
  },
  {
    key: 'negative_known_dimension',
    description: 'Negative known dimension',
    level: 'draft',
    build: () => {
      const o = clone(platformFixture)
      o.dimensions.length = {
        value: -1200,
        unit: 'mm',
        source: 'measured',
        status: 'verified',
        tolerance: 1,
      }
      return o
    },
  },
  {
    key: 'unknown_as_zero',
    description: 'Unknown represented incorrectly as zero',
    level: 'draft',
    build: () => {
      const o = clone(platformFixture)
      o.dimensions.width = {
        value: 0,
        unit: 'mm',
        source: 'unknown',
        status: 'unknown',
      }
      return o
    },
  },
  {
    key: 'missing_surface_field',
    description: 'Missing mandatory surface field (baseColor absent)',
    level: 'parse',
    build: () => {
      const o = clone(beltFixture) as Record<string, unknown>
      const surface = { ...(o.surface as object) } as Record<string, unknown>
      delete surface.baseColor
      o.surface = surface
      return o
    },
  },
  {
    key: 'missing_mass_structure',
    description: 'Missing mass structure',
    level: 'parse',
    build: () => {
      const o = clone(beltFixture) as Record<string, unknown>
      const physical = { ...(o.physical as object) } as Record<string, unknown>
      delete physical.mass
      o.physical = physical
      return o
    },
  },
  {
    key: 'released_with_unknown_mass',
    description: 'Released object with unknown mass',
    level: 'released',
    build: () => {
      const o = clone(platformFixture)
      o.lifecycle.status = 'released'
      o.physical.mass = { value: null, unit: 'kg', source: 'unknown', status: 'unknown' }
      return o
    },
  },
  {
    key: 'product_zero_forward_vector',
    description: 'Product with zero forward vector',
    level: 'draft',
    build: () => {
      const o = clone(cookieFixture)
      o.orientation.forwardVectorLocal = [0, 0, 0]
      return o
    },
  },
  {
    key: 'product_non_orthogonal_vectors',
    description: 'Product forward and up vectors not approximately orthogonal',
    level: 'draft',
    build: () => {
      const o = clone(cookieFixture)
      o.orientation.forwardVectorLocal = [1, 0, 0]
      o.orientation.upVectorLocal = [1, 0.05, 0]
      return o
    },
  },
  {
    key: 'invalid_motion_capability_type',
    description: 'Invalid motion capability/type combination',
    level: 'draft',
    build: () => {
      const o = clone(motorFixture)
      // rotatable capability with translation type is invalid
      o.motion.capability = 'rotatable'
      o.motion.type = 'translation'
      return o
    },
  },
  {
    key: 'invalid_relationship_reference',
    description: 'Invalid relationship source/target reference (missing object)',
    level: 'draft',
    build: () => {
      const o = clone(beltFixture)
      o.connections = [
        {
          relationshipId: 'REL-BAD',
          type: 'drives',
          sourceObjectId: 'OBJ-DOES-NOT-EXIST',
          targetObjectId: 'OBJ-ALSO-MISSING',
          sourceConnectorId: 'N/A',
          targetConnectorId: 'N/A',
          enabled: true,
          status: 'configured',
          parameters: {},
          validation: { status: 'not_evaluated', messages: [] },
        },
      ]
      return o
    },
  },
  {
    key: 'negative_support_load',
    description: 'Negative support load limit',
    level: 'draft',
    build: () => {
      const o = clone(platformFixture)
      o.collision.supportCapability.maximumPointLoadKg = -300
      return o
    },
  },
]
