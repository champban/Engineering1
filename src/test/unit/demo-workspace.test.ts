import { describe, expect, it } from 'vitest'
import { createDemoWorkspace } from '@/domain/demo/demo-workspace'

describe('Engineering1 getting-started demo workspace', () => {
  it('contains three reusable objects from different domains', () => {
    const { gallery } = createDemoWorkspace()
    expect(gallery).toHaveLength(3)
    expect(new Set(gallery.map((asset) => asset.id)).size).toBe(3)
    expect(gallery.map((asset) => asset.category)).toEqual([
      'Product / Package',
      'Mechanical Component',
      'Landscape',
    ])
    for (const asset of gallery) {
      expect(asset.thumbnailDataUrl.startsWith('data:image/svg+xml')).toBe(true)
      expect(asset.dimensionsMm.length).toBeGreaterThan(0)
      expect(asset.dimensionsMm.width).toBeGreaterThan(0)
      expect(asset.dimensionsMm.height).toBeGreaterThan(0)
      expect(asset.lifecycle).toBe('calibrated')
    }
  })

  it('links every demo scene instance to an existing Gallery asset', () => {
    const { gallery, layout } = createDemoWorkspace()
    const assetIds = new Set(gallery.map((asset) => asset.id))
    expect(layout.objects).toHaveLength(3)
    expect(layout.objects.every((instance) => assetIds.has(instance.assetId))).toBe(true)
  })

  it('starts with transport paths that are immediately playable', () => {
    const { layout } = createDemoWorkspace()
    expect(layout.conveyors.map((conveyor) => conveyor.type)).toEqual([
      'straight',
      'curve',
      'spiral',
      'buffer',
    ])
  })
})
