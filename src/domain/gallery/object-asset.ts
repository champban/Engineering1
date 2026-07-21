export const OBJECT_ASSET_SCHEMA_VERSION = '1.0.0'

export type ObjectAssetLifecycle =
  | 'draft'
  | 'calibrated'
  | 'verified'
  | 'released'

export type ObjectSourceType =
  | 'camera'
  | 'image-upload'
  | 'video-frame'
  | 'manual'
  | 'ai-generated'

export type ObjectGeometryType = 'proxy-box' | 'proxy-cylinder' | 'ai-mesh'

export interface ObjectDimensionsMm {
  length: number
  width: number
  height: number
}

export interface ObjectAsset {
  schemaVersion: string
  id: string
  name: string
  category: string
  tags: string[]
  lifecycle: ObjectAssetLifecycle
  sourceType: ObjectSourceType
  geometryType: ObjectGeometryType
  dimensionsMm: ObjectDimensionsMm
  material: string
  massKg: number | null
  thumbnailDataUrl: string
  sourceImageDataUrl?: string
  segmentedImageUrl?: string
  modelUrl?: string
  renderedPreviewUrl?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  createdAt: string
  updatedAt: string
}

export interface NewObjectAssetInput {
  name: string
  category: string
  tags?: string[]
  lifecycle?: ObjectAssetLifecycle
  sourceType: ObjectSourceType
  geometryType: ObjectGeometryType
  dimensionsMm: ObjectDimensionsMm
  material?: string
  massKg?: number | null
  thumbnailDataUrl: string
  sourceImageDataUrl?: string
  segmentedImageUrl?: string
  modelUrl?: string
  renderedPreviewUrl?: string
}

export function createObjectAsset(input: NewObjectAssetInput): ObjectAsset {
  const now = new Date().toISOString()
  return {
    schemaVersion: OBJECT_ASSET_SCHEMA_VERSION,
    id: createId('obj'),
    name: input.name.trim() || 'Untitled object',
    category: input.category.trim() || 'Uncategorized',
    tags: normalizeTags(input.tags ?? []),
    lifecycle: input.lifecycle ?? 'draft',
    sourceType: input.sourceType,
    geometryType: input.geometryType,
    dimensionsMm: validateDimensions(input.dimensionsMm),
    material: input.material?.trim() || 'Unknown',
    massKg: input.massKg ?? null,
    thumbnailDataUrl: input.thumbnailDataUrl,
    sourceImageDataUrl: input.sourceImageDataUrl,
    segmentedImageUrl: input.segmentedImageUrl,
    modelUrl: input.modelUrl,
    renderedPreviewUrl: input.renderedPreviewUrl,
    createdAt: now,
    updatedAt: now,
  }
}

export function duplicateObjectAsset(asset: ObjectAsset): ObjectAsset {
  const now = new Date().toISOString()
  return {
    ...asset,
    id: createId('obj'),
    name: `${asset.name} copy`,
    lifecycle: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

export function markObjectAssetCalibrated(asset: ObjectAsset): ObjectAsset {
  validateDimensions(asset.dimensionsMm)
  return {
    ...asset,
    lifecycle: 'calibrated',
    updatedAt: new Date().toISOString(),
  }
}

export function validateDimensions(dimensions: ObjectDimensionsMm): ObjectDimensionsMm {
  const values = [dimensions.length, dimensions.width, dimensions.height]
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error('All object dimensions must be finite positive values in millimetres.')
  }
  return { ...dimensions }
}

export function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
}

export function createId(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return `${prefix}_${random}`
}
