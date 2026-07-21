import { describe, expect, it } from 'vitest'
import { normalizedPreviewDimensions } from '@/viewport/components/preview-geometry'

describe('3D preview normalization', () => {
  it('preserves engineering proportions while fitting the longest dimension to one', () => {
    expect(normalizedPreviewDimensions({ length: 400, width: 200, height: 100 })).toEqual([1, 0.25, 0.5])
  })
})
