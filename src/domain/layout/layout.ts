import type { ObjectAsset } from '@/domain/gallery/object-asset'
import { createId } from '@/domain/gallery/object-asset'

export type ConveyorType = 'straight' | 'curve' | 'incline' | 'decline' | 'spiral' | 'buffer'
export type TransportProductType = 'cookie-pack' | 'multipack' | 'carton' | 'case'

export interface SceneObjectInstance {
  id: string
  assetId: string
  name: string
  xMm: number
  zMm: number
  elevationMm: number
  rotationDeg: number
  scale: number
  thumbnailDataUrl: string
}

export interface ConveyorDefinition {
  id: string
  name: string
  type: ConveyorType
  direction: 1 | -1
  lengthMm: number
  widthMm: number
  entryElevationMm: number
  exitElevationMm: number
  radiusMm: number
  turns: number
  speedMps: number
  bufferCapacity: number
  productType: TransportProductType
}

export interface LayoutProject {
  id: string
  name: string
  objects: SceneObjectInstance[]
  conveyors: ConveyorDefinition[]
  updatedAt: string
}

export function createLayoutProject(name = 'Mechanical layout'): LayoutProject {
  return { id: createId('layout'), name, objects: [], conveyors: [createConveyor('straight')], updatedAt: new Date().toISOString() }
}

export function createSceneInstance(asset: ObjectAsset): SceneObjectInstance {
  return { id: createId('inst'), assetId: asset.id, name: asset.name, xMm: 1000, zMm: 1000, elevationMm: 0, rotationDeg: 0, scale: 1, thumbnailDataUrl: asset.thumbnailDataUrl }
}

export function createConveyor(type: ConveyorType): ConveyorDefinition {
  const defaults: Record<ConveyorType, Partial<ConveyorDefinition>> = {
    straight: {},
    curve: { radiusMm: 1200 },
    incline: { exitElevationMm: 1200 },
    decline: { entryElevationMm: 1200 },
    spiral: { radiusMm: 1800, turns: 2.5, exitElevationMm: 3500, bufferCapacity: 24 },
    buffer: { lengthMm: 8000, bufferCapacity: 40 },
  }
  return {
    id: createId('cv'), name: `${capitalize(type)} conveyor`, type, direction: 1,
    lengthMm: 4000, widthMm: 400, entryElevationMm: 900, exitElevationMm: 900,
    radiusMm: 1000, turns: 1, speedMps: 0.35, bufferCapacity: 12,
    productType: 'cookie-pack', ...defaults[type],
  }
}

export interface PathPoint { x: number; y: number }

export function sampleConveyorPath(conveyor: ConveyorDefinition, progress: number): PathPoint {
  const normalized = normalizeProgress(progress)
  const p = conveyor.direction === 1 ? normalized : 1 - normalized
  switch (conveyor.type) {
    case 'straight': return { x: 40 + p * 520, y: 180 }
    case 'curve': {
      const angle = Math.PI * (1 - p / 2)
      return { x: 300 + Math.cos(angle) * 220, y: 300 - Math.sin(angle) * 180 }
    }
    case 'incline': return { x: 40 + p * 520, y: 260 - p * 150 }
    case 'decline': return { x: 40 + p * 520, y: 110 + p * 150 }
    case 'spiral': {
      const angle = p * Math.PI * 2 * Math.max(1, conveyor.turns)
      const radius = 170 - p * 85
      return { x: 300 + Math.cos(angle) * radius, y: 190 + Math.sin(angle) * radius * 0.55 - p * 70 }
    }
    case 'buffer': {
      const rows = 5
      const scaled = p * rows
      const row = Math.min(rows - 1, Math.floor(scaled))
      const local = scaled - row
      const leftToRight = row % 2 === 0
      return { x: leftToRight ? 60 + local * 480 : 540 - local * 480, y: 70 + row * 60 }
    }
  }
}

export function conveyorPathPolyline(conveyor: ConveyorDefinition, samples = 120): string {
  return Array.from({ length: samples }, (_, index) => {
    const point = sampleConveyorPath(conveyor, index / (samples - 1))
    return `${point.x},${point.y}`
  }).join(' ')
}


export interface ConnectedRoute {
  points: PathPoint[]
  segmentIds: string[]
  totalLengthMm: number
}

export function buildConnectedRoute(conveyors: ConveyorDefinition[], samplesPerConveyor = 80): ConnectedRoute {
  if (!conveyors.length) return { points: [], segmentIds: [], totalLengthMm: 0 }
  const points: PathPoint[] = []
  const segmentIds: string[] = []
  let cursorX = 36
  let cursorY = 190
  conveyors.forEach((conveyor, conveyorIndex) => {
    const count = Math.max(2, samplesPerConveyor)
    const raw = Array.from({ length: count }, (_, index) => sampleConveyorPath(conveyor, index / (count - 1)))
    const start = raw[0]
    const translated = raw.map((point) => ({ x: point.x - start.x + cursorX, y: point.y - start.y + cursorY }))
    if (conveyorIndex > 0) translated.shift()
    points.push(...translated)
    segmentIds.push(...translated.map(() => conveyor.id))
    const end = translated[translated.length - 1]
    cursorX = end.x
    cursorY = end.y
  })
  return {
    points,
    segmentIds,
    totalLengthMm: conveyors.reduce((sum, conveyor) => sum + Math.max(100, conveyor.lengthMm), 0),
  }
}

export function connectedRoutePolyline(conveyors: ConveyorDefinition[], samplesPerConveyor = 80): string {
  return buildConnectedRoute(conveyors, samplesPerConveyor).points.map((point) => `${point.x},${point.y}`).join(' ')
}

export function sampleConnectedRoute(conveyors: ConveyorDefinition[], progress: number): PathPoint {
  const route = buildConnectedRoute(conveyors)
  if (!route.points.length) return { x: 0, y: 0 }
  if (route.points.length === 1) return route.points[0]
  const normalized = normalizeProgress(progress)
  const scaled = normalized * (route.points.length - 1)
  const lower = Math.floor(scaled)
  const upper = Math.min(route.points.length - 1, lower + 1)
  const blend = scaled - lower
  const a = route.points[lower]
  const b = route.points[upper]
  return { x: a.x + (b.x - a.x) * blend, y: a.y + (b.y - a.y) * blend }
}

function normalizeProgress(progress: number): number {
  const wrapped = progress % 1
  return wrapped < 0 ? wrapped + 1 : wrapped
}

function capitalize(value: string): string { return `${value.charAt(0).toUpperCase()}${value.slice(1)}` }
