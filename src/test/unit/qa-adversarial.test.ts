import { describe, expect, it } from 'vitest'
import {
  parseCoreObject,
  validateDraft,
  validateReleased,
} from '@/core/validation/engine'
import { cookieFixture } from '@/test/fixtures/valid/cookie'
import { motorFixture } from '@/test/fixtures/valid/motor'
import { platformFixture } from '@/test/fixtures/valid/platform'
import {
  evaluateOrientationTolerance,
  validateOrientationStructure,
} from '@/domain/orientation/orientation'
import type { RelationshipGraphObject } from '@/domain/relationships/relationships'

const clone = <T>(value: T): T => structuredClone(value)

describe('PH0-009 adversarial engineering validation', () => {
  it('rejects a resolved numeric value marked unknown', () => {
    const object = clone(platformFixture)
    object.dimensions.length = {
      value: 1200,
      unit: 'mm',
      source: 'unknown',
      status: 'unknown',
    }
    expect(validateDraft(object).valid).toBe(false)
  })

  it('rejects a negative known optional dimension', () => {
    const object = clone(platformFixture)
    object.dimensions.diameter = {
      value: -25,
      unit: 'mm',
      source: 'measured',
      status: 'verified',
    }
    expect(validateDraft(object).valid).toBe(false)
  })

  it('rejects released lifecycle when verification metadata is unverified', () => {
    const object = clone(cookieFixture)
    object.lifecycle.verificationStatus = 'unverified'
    object.lifecycle.verifiedBy = 'N/A'
    object.lifecycle.verifiedAt = null
    expect(validateReleased(object).valid).toBe(false)
  })

  it('validates orientation for transport products beyond cookie category', () => {
    const object = clone(cookieFixture)
    object.identity.category = 'primary_pack'
    object.orientation.forwardVectorLocal = [0, 0, 0]
    expect(validateDraft(object).valid).toBe(false)
  })

  it('rejects zero or inconsistent right vector', () => {
    const orientation = clone(cookieFixture.orientation)
    orientation.rightVectorLocal = [0, 0, 0]
    expect(validateOrientationStructure(orientation).length).toBeGreaterThan(0)
  })

  it('uses circular angular delta for 359deg versus 1deg', () => {
    const result = evaluateOrientationTolerance({
      rotationRelativeToFlowDeg: 359,
      targetRotationRelativeToFlowDeg: 1,
      rotationToleranceDeg: 3,
      skewAngleDeg: 0,
      skewToleranceDeg: 3,
      tiltAngleDeg: 0,
      tiltToleranceDeg: 2,
      lateralOffsetMm: 0,
      lateralOffsetToleranceMm: 10,
    })
    expect(result.passed).toBe(true)
  })

  it('rejects zero rotation axis for a rotatable motor', () => {
    const object = clone(motorFixture)
    object.motion.axisVectorLocal = [0, 0, 0]
    expect(validateDraft(object).valid).toBe(false)
  })

  it('rejects a missing relationship target when project graph is supplied', () => {
    const object = clone(motorFixture)
    object.connections = [
      {
        relationshipId: 'REL-MISSING-TARGET',
        type: 'drives',
        sourceObjectId: object.objectId,
        targetObjectId: 'OBJ-NOT-PRESENT',
        sourceConnectorId: 'N/A',
        targetConnectorId: 'N/A',
        enabled: true,
        status: 'configured',
        parameters: {},
        validation: { status: 'not_evaluated', messages: [] },
      },
    ]
    const graph = new Map<string, RelationshipGraphObject>([
      [object.objectId, { objectId: object.objectId, connectorIds: [] }],
    ])
    expect(validateDraft(object, { relationshipObjects: graph }).valid).toBe(
      false,
    )
  })

  it('returns null instead of an unsafe CoreObject cast after parse failure', () => {
    const result = parseCoreObject({ objectId: 'incomplete' })
    expect(result.object).toBeNull()
    expect(result.issues.length).toBeGreaterThan(0)
  })
})
