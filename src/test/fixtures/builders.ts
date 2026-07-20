import type { CoreObject } from '@/core/schema/core-object'
import type { Transform } from '@/domain/objects/transform'
import type { DimensionValue, MassValue } from '@/core/schema/primitives'

const NOW = '2026-07-20T00:00:00Z'

export function verifiedMm(value: number, tolerance = 0.1): DimensionValue {
  return { value, unit: 'mm', source: 'measured', status: 'verified', tolerance }
}

export function verifiedKg(value: number, tolerance = 0.05): MassValue {
  return { value, unit: 'kg', source: 'measured', status: 'verified', tolerance }
}

export function unknownMm(): DimensionValue {
  return { value: null, unit: 'mm', source: 'unknown', status: 'unknown' }
}

export function unknownKg(): MassValue {
  return { value: null, unit: 'kg', source: 'unknown', status: 'unknown' }
}

export function identityTransform(): Transform {
  return {
    positionMm: [0, 0, 0],
    rotationDegXYZ: [0, 0, 0],
    quaternionXYZW: [0, 0, 0, 1],
    scaleXYZ: [1, 1, 1],
    originLocalMm: [0, 0, 0],
    coordinateSpace: 'local',
    homeTransform: {
      positionMm: [0, 0, 0],
      rotationDegXYZ: [0, 0, 0],
      scaleXYZ: [1, 1, 1],
    },
  }
}

export function defaultAudit(): CoreObject['audit'] {
  return {
    createdBy: "P'Boy",
    createdAt: NOW,
    modifiedBy: 'ChatGPT',
    modifiedAt: NOW,
    sourceFiles: [],
    notes: 'N/A',
  }
}

/** Neutral orientation object for non-product parts. */
export function neutralOrientation(): CoreObject['orientation'] {
  return {
    mode: 'fixed_angle',
    referenceFrame: 'world',
    forwardVectorLocal: [1, 0, 0],
    upVectorLocal: [0, 1, 0],
    rightVectorLocal: [0, 0, 1],
    faceUp: 'top_face',
    contactFace: 'bottom_face',
    leadingEdge: 'front_edge',
    trailingEdge: 'back_edge',
    rotationRelativeToFlowDeg: 0,
    skewAngleDeg: 0,
    tiltAngleDeg: 0,
    rollAngleDeg: 0,
    laneId: 'N/A',
    lateralOffsetMm: 0,
    verticalOffsetMm: 0,
    pathBehavior: 'maintain_world_orientation',
    status: 'correct',
    confidence: 1,
    source: 'user_defined',
  }
}
