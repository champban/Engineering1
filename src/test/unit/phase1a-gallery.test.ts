import { describe, expect, it } from 'vitest'
import {
  createObjectAsset,
  duplicateObjectAsset,
  markObjectAssetCalibrated,
  normalizeTags,
  validateDimensions,
} from '@/domain/gallery/object-asset'
import {
  getCapability,
  isCapabilityInteractive,
} from '@/domain/capabilities/feature-capability'

describe('Phase 1A reusable object records', () => {
  it('creates a reusable draft object with versioned static properties', () => {
    const asset = createObjectAsset({
      name: 'Cookie pack',
      category: 'Products',
      tags: [' Cookie ', 'PACK', 'cookie'],
      sourceType: 'image-upload',
      geometryType: 'proxy-box',
      dimensionsMm: { length: 95, width: 38, height: 14 },
      thumbnailDataUrl: 'data:image/png;base64,AA==',
    })

    expect(asset.schemaVersion).toBe('1.0.0')
    expect(asset.lifecycle).toBe('draft')
    expect(asset.tags).toEqual(['cookie', 'pack'])
    expect(asset.dimensionsMm.length).toBe(95)
  })

  it('rejects zero or unresolved dimensions instead of treating them as valid', () => {
    expect(() => validateDimensions({ length: 0, width: 20, height: 10 })).toThrow()
  })

  it('normalizes duplicate tags', () => {
    expect(normalizeTags(['Motor', ' motor ', '', 'Drive'])).toEqual(['motor', 'drive'])
  })

  it('duplicates a Gallery asset as a new draft revision candidate', () => {
    const asset = createObjectAsset({
      name: 'Tree',
      category: 'Landscape',
      sourceType: 'image-upload',
      geometryType: 'ai-mesh',
      dimensionsMm: { length: 1500, width: 1500, height: 3200 },
      thumbnailDataUrl: 'data:image/png;base64,AA==',
    })
    const copy = duplicateObjectAsset(asset)
    expect(copy.id).not.toBe(asset.id)
    expect(copy.name).toBe('Tree copy')
    expect(copy.lifecycle).toBe('draft')
  })

  it('marks an object calibrated only after positive dimensions are present', () => {
    const asset = createObjectAsset({
      name: 'Motor',
      category: 'Mechanical',
      sourceType: 'image-upload',
      geometryType: 'proxy-box',
      dimensionsMm: { length: 300, width: 180, height: 220 },
      thumbnailDataUrl: 'data:image/png;base64,AA==',
    })
    expect(markObjectAssetCalibrated(asset).lifecycle).toBe('calibrated')
  })
})

describe('feature capability states', () => {
  it('keeps implemented and experimental capabilities interactive', () => {
    expect(isCapabilityInteractive(getCapability('camera.upload'))).toBe(true)
    expect(isCapabilityInteractive(getCapability('camera.ai-reconstruction'))).toBe(true)
  })

  it('keeps future control functions grey and non-interactive', () => {
    const hmi = getCapability('hmi.editor')
    expect(hmi.status).toBe('planned')
    expect(isCapabilityInteractive(hmi)).toBe(false)
  })
})
