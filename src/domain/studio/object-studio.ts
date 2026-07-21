import type { ObjectAsset, ObjectDimensionsMm } from '@/domain/gallery/object-asset'
import { createId } from '@/domain/gallery/object-asset'

export type StudioTool =
  | 'select'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'paint'
  | 'measure'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'push-pull'
  | 'offset'
  | 'section'
  | 'boolean'

export type StudioViewMode = 'edit' | 'orbit' | 'pan'
export type StudioCameraCommand =
  | 'fit-all'
  | 'fit-selection'
  | 'iso'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'

export type StudioPrimitive = 'asset' | 'box' | 'cylinder' | 'sphere' | 'plane'
export type StudioProjection = 'perspective' | 'orthographic'
export type StudioLightingPreset = 'studio' | 'sunlight' | 'warehouse' | 'inspection'
export type StudioFace = 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back' | 'surface'
export type StudioSketchKind = 'line' | 'rectangle' | 'circle'

export interface StudioVector3 {
  x: number
  y: number
  z: number
}

export interface StudioTransform {
  positionMm: StudioVector3
  rotationDeg: StudioVector3
  scale: StudioVector3
}

export interface StudioMaterial {
  id: string
  name: string
  baseColor: string
  metalness: number
  roughness: number
  opacity: number
  textureDataUrl?: string
  repeatU: number
  repeatV: number
  rotationDeg: number
  wrapMode: 'repeat' | 'clamp' | 'mirror'
}

export interface StudioNode {
  id: string
  sourceAssetId?: string
  name: string
  primitive: StudioPrimitive
  dimensionsMm: ObjectDimensionsMm
  transform: StudioTransform
  material: StudioMaterial
  faceMaterials?: Partial<Record<StudioFace, StudioMaterial>>
  visible: boolean
  locked: boolean
  modelUrl?: string
}

export interface StudioMeasurement {
  id: string
  label: string
  startMm: StudioVector3
  endMm: StudioVector3
  distanceMm: number
}

export interface ObjectStudioDocument {
  schemaVersion: '1.1.0'
  id: string
  name: string
  nodes: StudioNode[]
  selectedNodeId: string | null
  projection: StudioProjection
  gridMm: number
  snapEnabled: boolean
  lightingPreset: StudioLightingPreset
  lightIntensity: number
  background: string
  measurements: StudioMeasurement[]
  updatedAt: string
}

export const MATERIAL_PRESETS: readonly Omit<StudioMaterial, 'id'>[] = [
  { name: 'Powder-coated steel', baseColor: '#4f6f8f', metalness: 0.55, roughness: 0.38, opacity: 1, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Stainless steel', baseColor: '#b8c2ca', metalness: 0.9, roughness: 0.22, opacity: 1, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Black polymer', baseColor: '#20262c', metalness: 0.05, roughness: 0.7, opacity: 1, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Food-grade belt', baseColor: '#2f6f83', metalness: 0.02, roughness: 0.78, opacity: 1, repeatU: 2, repeatV: 2, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Printed packaging film', baseColor: '#d7a44c', metalness: 0.02, roughness: 0.46, opacity: 1, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Glass', baseColor: '#a6d9eb', metalness: 0.05, roughness: 0.12, opacity: 0.35, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'clamp' },
  { name: 'Concrete', baseColor: '#8d9092', metalness: 0, roughness: 0.95, opacity: 1, repeatU: 2, repeatV: 2, rotationDeg: 0, wrapMode: 'repeat' },
  { name: 'Wood', baseColor: '#8a5d36', metalness: 0, roughness: 0.72, opacity: 1, repeatU: 1, repeatV: 1, rotationDeg: 0, wrapMode: 'repeat' },
]

export function createDefaultMaterial(name = 'Engineering blue'): StudioMaterial {
  return {
    id: createId('mat'),
    name,
    baseColor: '#56a9f8',
    metalness: 0.12,
    roughness: 0.52,
    opacity: 1,
    repeatU: 1,
    repeatV: 1,
    rotationDeg: 0,
    wrapMode: 'repeat',
  }
}

export function createStudioDocument(assets: readonly ObjectAsset[]): ObjectStudioDocument {
  const nodes = assets.slice(0, 3).map((asset, index) => createStudioNodeFromAsset(asset, index))
  return {
    schemaVersion: '1.1.0',
    id: createId('studio'),
    name: 'Object Studio Project',
    nodes,
    selectedNodeId: nodes[0]?.id ?? null,
    projection: 'perspective',
    gridMm: 100,
    snapEnabled: true,
    lightingPreset: 'studio',
    lightIntensity: 1,
    background: '#091018',
    measurements: [],
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeStudioDocument(document: ObjectStudioDocument): ObjectStudioDocument {
  return {
    ...document,
    schemaVersion: '1.1.0',
    nodes: document.nodes.map((node) => ({
      ...node,
      faceMaterials: node.faceMaterials ?? {},
      transform: {
        positionMm: { ...node.transform.positionMm },
        rotationDeg: { ...node.transform.rotationDeg },
        scale: { ...node.transform.scale },
      },
    })),
  }
}

export function createStudioNodeFromAsset(asset: ObjectAsset, index = 0): StudioNode {
  const spacingMm = Math.max(asset.dimensionsMm.length * 1.5, 700)
  return {
    id: createId('node'),
    sourceAssetId: asset.id,
    name: asset.name,
    primitive: asset.geometryType === 'proxy-cylinder' ? 'cylinder' : 'asset',
    dimensionsMm: { ...asset.dimensionsMm },
    transform: {
      positionMm: { x: index * spacingMm, y: 0, z: 0 },
      rotationDeg: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    material: {
      ...createDefaultMaterial(asset.material),
      baseColor: asset.geometryType === 'proxy-cylinder' ? '#6e8aa3' : '#56a9f8',
    },
    faceMaterials: {},
    visible: true,
    locked: false,
    modelUrl: asset.modelUrl,
  }
}

export function createPrimitiveNode(primitive: Exclude<StudioPrimitive, 'asset'>): StudioNode {
  const dimensions: Record<Exclude<StudioPrimitive, 'asset'>, ObjectDimensionsMm> = {
    box: { length: 1000, width: 600, height: 500 },
    cylinder: { length: 500, width: 500, height: 800 },
    sphere: { length: 600, width: 600, height: 600 },
    plane: { length: 1200, width: 1200, height: 10 },
  }
  return {
    id: createId('node'),
    name: `${capitalize(primitive)} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    primitive,
    dimensionsMm: dimensions[primitive],
    transform: {
      positionMm: { x: 0, y: 0, z: 0 },
      rotationDeg: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    material: createDefaultMaterial(),
    faceMaterials: {},
    visible: true,
    locked: false,
  }
}

export function createSketchNode(
  kind: StudioSketchKind,
  startMm: StudioVector3,
  endMm: StudioVector3,
  gridMm: number,
  snapEnabled: boolean,
): StudioNode {
  const start = snapVector(startMm, gridMm, snapEnabled)
  const end = snapVector(endMm, gridMm, snapEnabled)
  const dx = end.x - start.x
  const dz = end.z - start.z
  const distance = Math.max(1, Math.hypot(dx, dz))
  const centre = { x: (start.x + end.x) / 2, y: 0, z: (start.z + end.z) / 2 }

  if (kind === 'circle') {
    const diameter = Math.max(10, distance * 2)
    const node = createPrimitiveNode('cylinder')
    return {
      ...node,
      name: 'Sketch Circle',
      dimensionsMm: { length: diameter, width: diameter, height: Math.max(10, gridMm / 10) },
      transform: { ...node.transform, positionMm: { x: start.x, y: 0, z: start.z } },
    }
  }

  if (kind === 'rectangle') {
    const node = createPrimitiveNode('plane')
    return {
      ...node,
      name: 'Sketch Rectangle',
      dimensionsMm: {
        length: Math.max(10, Math.abs(dx)),
        width: Math.max(10, Math.abs(dz)),
        height: Math.max(5, gridMm / 20),
      },
      transform: { ...node.transform, positionMm: centre },
    }
  }

  const node = createPrimitiveNode('box')
  return {
    ...node,
    name: 'Sketch Line',
    dimensionsMm: { length: distance, width: Math.max(5, gridMm / 20), height: Math.max(5, gridMm / 20) },
    transform: {
      ...node.transform,
      positionMm: centre,
      rotationDeg: { x: 0, y: -Math.atan2(dz, dx) * 180 / Math.PI, z: 0 },
    },
  }
}

export function duplicateStudioNode(node: StudioNode): StudioNode {
  return {
    ...node,
    id: createId('node'),
    sourceAssetId: undefined,
    name: `${node.name} copy`,
    dimensionsMm: { ...node.dimensionsMm },
    transform: {
      positionMm: {
        x: node.transform.positionMm.x + 250,
        y: node.transform.positionMm.y,
        z: node.transform.positionMm.z + 250,
      },
      rotationDeg: { ...node.transform.rotationDeg },
      scale: { ...node.transform.scale },
    },
    material: cloneMaterial(node.material),
    faceMaterials: Object.fromEntries(
      Object.entries(node.faceMaterials ?? {}).map(([face, material]) => [face, material ? cloneMaterial(material) : material]),
    ) as Partial<Record<StudioFace, StudioMaterial>>,
  }
}

export function applyMaterialPreset(node: StudioNode, presetName: string, face?: StudioFace | null): StudioNode {
  const preset = MATERIAL_PRESETS.find((item) => item.name === presetName)
  if (!preset) return node
  const material: StudioMaterial = {
    ...preset,
    id: face ? node.faceMaterials?.[face]?.id ?? createId('mat') : node.material.id,
    textureDataUrl: face ? node.faceMaterials?.[face]?.textureDataUrl : node.material.textureDataUrl,
  }
  return face ? applyMaterialToFace(node, face, material) : { ...node, material }
}

export function applyMaterialToFace(node: StudioNode, face: StudioFace, material: StudioMaterial): StudioNode {
  return {
    ...node,
    faceMaterials: { ...node.faceMaterials, [face]: material },
  }
}

export function clearFaceMaterial(node: StudioNode, face: StudioFace): StudioNode {
  const next = { ...node.faceMaterials }
  delete next[face]
  return { ...node, faceMaterials: next }
}

export function effectiveMaterial(node: StudioNode, face?: StudioFace | null): StudioMaterial {
  return face ? node.faceMaterials?.[face] ?? node.material : node.material
}

export function snapMillimetres(value: number, gridMm: number, enabled: boolean): number {
  if (!Number.isFinite(value)) return 0
  if (!enabled) return value
  const grid = Math.max(1, Math.abs(gridMm))
  return Math.round(value / grid) * grid
}

export function snapVector(value: StudioVector3, gridMm: number, enabled: boolean): StudioVector3 {
  return {
    x: snapMillimetres(value.x, gridMm, enabled),
    y: snapMillimetres(value.y, gridMm, enabled),
    z: snapMillimetres(value.z, gridMm, enabled),
  }
}

export function distance3dMm(start: StudioVector3, end: StudioVector3): number {
  return Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z)
}

export function calculateNodeVolumeMm3(node: StudioNode): number {
  const { length, width, height } = node.dimensionsMm
  if (node.primitive === 'sphere') {
    const radius = Math.max(length, width, height) / 2
    return 4 / 3 * Math.PI * radius ** 3
  }
  if (node.primitive === 'cylinder') {
    const radius = Math.max(length, width) / 2
    return Math.PI * radius ** 2 * height
  }
  return length * width * height
}

export function touchStudioDocument(document: ObjectStudioDocument): ObjectStudioDocument {
  return { ...document, updatedAt: new Date().toISOString() }
}

function cloneMaterial(material: StudioMaterial): StudioMaterial {
  return { ...material, id: createId('mat') }
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
