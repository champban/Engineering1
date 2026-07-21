import type { ObjectDimensionsMm } from '@/domain/gallery/object-asset'

export function normalizedPreviewDimensions(
  dimensionsMm: ObjectDimensionsMm,
): [number, number, number] {
  const longest = Math.max(dimensionsMm.length, dimensionsMm.width, dimensionsMm.height, 1)
  return [
    dimensionsMm.length / longest,
    dimensionsMm.height / longest,
    dimensionsMm.width / longest,
  ]
}
