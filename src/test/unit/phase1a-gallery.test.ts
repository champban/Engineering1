import { describe, expect, it } from 'vitest'
import { createObjectAsset, normalizeTags, validateDimensions } from '@/domain/gallery/object-asset'
import { getCapability, isCapabilityInteractive } from '@/domain/capabilities/feature-capability'

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
