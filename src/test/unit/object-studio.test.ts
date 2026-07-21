import { describe, expect, it } from 'vitest'
import { createDemoGallery } from '@/domain/demo/demo-workspace'
import {
  applyMaterialPreset,
  calculateNodeVolumeMm3,
  createPrimitiveNode,
  createStudioDocument,
  distance3dMm,
  duplicateStudioNode,
  snapMillimetres,
} from '@/domain/studio/object-studio'

describe('Object Studio domain', () => {
  it('creates a ready-to-edit document from the three demo assets', () => {
    const document = createStudioDocument(createDemoGallery())
    expect(document.nodes).toHaveLength(3)
    expect(document.selectedNodeId).toBe(document.nodes[0].id)
    expect(document.gridMm).toBe(100)
  })

  it('creates and duplicates editable primitives without reusing identity', () => {
    const box = createPrimitiveNode('box')
    const copy = duplicateStudioNode(box)
    expect(copy.id).not.toBe(box.id)
    expect(copy.name).toContain('copy')
    expect(copy.transform.positionMm.x).toBe(box.transform.positionMm.x + 250)
  })

  it('applies a standard surface preset and preserves material identity', () => {
    const node = createPrimitiveNode('box')
    const materialId = node.material.id
    const steel = applyMaterialPreset(node, 'Stainless steel')
    expect(steel.material.name).toBe('Stainless steel')
    expect(steel.material.metalness).toBeGreaterThan(0.8)
    expect(steel.material.id).toBe(materialId)
  })

  it('calculates engineering measurements and volumes', () => {
    expect(distance3dMm({ x: 0, y: 0, z: 0 }, { x: 300, y: 400, z: 0 })).toBe(500)
    const box = createPrimitiveNode('box')
    expect(calculateNodeVolumeMm3(box)).toBe(300_000_000)
  })

  it('snaps millimetres only when snapping is enabled', () => {
    expect(snapMillimetres(1126, 250, true)).toBe(1250)
    expect(snapMillimetres(1126, 250, false)).toBe(1126)
  })
})
