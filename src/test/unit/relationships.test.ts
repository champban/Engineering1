import { describe, it, expect } from 'vitest'
import {
  validateRelationship,
  validateRelationshipGraph,
  type Relationship,
  type RelationshipGraphObject,
} from '@/domain/relationships/relationships'

function graph(
  objects: { id: string; connectors?: string[] }[],
): Map<string, RelationshipGraphObject> {
  const map = new Map<string, RelationshipGraphObject>()
  for (const o of objects) {
    map.set(o.id, { objectId: o.id, connectorIds: o.connectors ?? [] })
  }
  return map
}

function rel(partial: Partial<Relationship>): Relationship {
  return {
    relationshipId: 'REL',
    type: 'drives',
    sourceObjectId: 'A',
    targetObjectId: 'B',
    sourceConnectorId: 'N/A',
    targetConnectorId: 'N/A',
    enabled: true,
    status: 'configured',
    parameters: {},
    validation: { status: 'not_evaluated', messages: [] },
    ...partial,
  }
}

describe('relationship validation', () => {
  it('valid drives relationship with known objects passes', () => {
    const known = graph([{ id: 'A' }, { id: 'B' }])
    expect(validateRelationship(rel({}), known)).toEqual([])
  })

  it('missing source object is blocked', () => {
    const known = graph([{ id: 'B' }])
    const issues = validateRelationship(rel({ sourceObjectId: 'A' }), known)
    expect(issues.length).toBeGreaterThan(0)
  })

  it('invalid connector reference is blocked', () => {
    const known = graph([{ id: 'A', connectors: ['out'] }, { id: 'B' }])
    const issues = validateRelationship(
      rel({ sourceConnectorId: 'nonexistent' }),
      known,
    )
    expect(issues.some((i) => i.path.includes('sourceConnectorId'))).toBe(true)
  })

  it('rotational relationship without axis/pivot is blocked', () => {
    const known = graph([{ id: 'A' }, { id: 'B' }])
    const issues = validateRelationship(rel({ type: 'rotates' }), known)
    expect(issues.some((i) => i.path.includes('axisVectorLocal'))).toBe(true)
  })

  it('carries relationship without support contact is blocked', () => {
    const known = graph([{ id: 'A' }, { id: 'B' }])
    const issues = validateRelationship(rel({ type: 'carries' }), known)
    expect(issues.some((i) => i.path.includes('supportContactIds'))).toBe(true)
  })

  it('valid Motor -> Transmission -> Pulley -> Belt -> Cookie chain', () => {
    const known = graph([
      { id: 'motor-001', connectors: ['shaft-output'] },
      { id: 'transmission-001', connectors: ['shaft-input', 'shaft-output'] },
      { id: 'pulley-001', connectors: ['shaft-input'] },
      { id: 'belt-001' },
      { id: 'cookie-001' },
    ])

    const chain: Relationship[] = [
      rel({
        relationshipId: 'R1',
        type: 'drives',
        sourceObjectId: 'motor-001',
        targetObjectId: 'transmission-001',
        sourceConnectorId: 'shaft-output',
        targetConnectorId: 'shaft-input',
      }),
      rel({
        relationshipId: 'R2',
        type: 'transmitsPowerTo',
        sourceObjectId: 'transmission-001',
        targetObjectId: 'pulley-001',
        sourceConnectorId: 'shaft-output',
        targetConnectorId: 'shaft-input',
      }),
      rel({
        relationshipId: 'R3',
        type: 'beltCoupledTo',
        sourceObjectId: 'pulley-001',
        targetObjectId: 'belt-001',
      }),
      rel({
        relationshipId: 'R4',
        type: 'carries',
        sourceObjectId: 'belt-001',
        targetObjectId: 'cookie-001',
        supportContactIds: ['belt_surface'],
      }),
    ]

    expect(validateRelationshipGraph(chain, known)).toEqual([])
  })
})
