import fs from 'node:fs'

const layoutPath = 'src/domain/layout/layout.ts'
const pagePath = 'src/ui/pages/WorkspacePage.tsx'
const testPath = 'src/test/unit/phase1c-transport.test.ts'

const connectedHelpers = `

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
  return buildConnectedRoute(conveyors, samplesPerConveyor).points.map((point) => \`${'${point.x}'},${'${point.y}'}\`).join(' ')
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
`

let layout = fs.readFileSync(layoutPath, 'utf8')
if (!layout.includes('export interface ConnectedRoute')) {
  layout = layout.replace('\nfunction normalizeProgress', connectedHelpers + '\nfunction normalizeProgress')
  fs.writeFileSync(layoutPath, layout)
}

let page = fs.readFileSync(pagePath, 'utf8')
page = page.replace('  conveyorPathPolyline,\n', '  buildConnectedRoute,\n  connectedRoutePolyline,\n  conveyorPathPolyline,\n')
page = page.replace('  sampleConveyorPath,\n', '  sampleConnectedRoute,\n  sampleConveyorPath,\n')
const start = page.indexOf('function RuntimeWorkspace({ conveyors }: { conveyors: ConveyorDefinition[] }) {')
const end = page.indexOf('\nfunction InteractiveThreePreview(', start)
if (start < 0 || end < 0) throw new Error('RuntimeWorkspace block not found')
const replacement = fs.readFileSync('scripts/connected-runtime-block.txt', 'utf8')
page = page.slice(0, start) + replacement + page.slice(end)
fs.writeFileSync(pagePath, page)

let test = fs.readFileSync(testPath, 'utf8')
test = test.replace("import { createConveyor, sampleConveyorPath } from '@/domain/layout/layout'", "import { buildConnectedRoute, createConveyor, sampleConnectedRoute, sampleConveyorPath } from '@/domain/layout/layout'")
if (!test.includes("describe('Phase 1C connected conveyor route'")) {
  test += `\n\ndescribe('Phase 1C connected conveyor route', () => {\n  it('joins multiple conveyor modules into one continuous route', () => {\n    const route = buildConnectedRoute([createConveyor('straight'), createConveyor('curve'), createConveyor('buffer')], 20)\n    expect(route.points.length).toBeGreaterThan(40)\n    expect(route.totalLengthMm).toBe(16000)\n    expect(route.segmentIds.length).toBe(route.points.length)\n  })\n\n  it('samples connected-route progress as a continuous loop', () => {\n    const conveyors = [createConveyor('straight'), createConveyor('incline')]\n    const start = sampleConnectedRoute(conveyors, 0)\n    const wrapped = sampleConnectedRoute(conveyors, 1)\n    expect(wrapped.x).toBeCloseTo(start.x)\n    expect(wrapped.y).toBeCloseTo(start.y)\n  })\n})\n`
  fs.writeFileSync(testPath, test)
}
