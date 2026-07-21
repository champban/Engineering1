import { describe, expect, it } from 'vitest'
import { buildConnectedRoute, createConveyor, sampleConnectedRoute, sampleConveyorPath } from '@/domain/layout/layout'

describe('Phase 1C transport path sampling', () => {
  it('moves a straight conveyor product from left to right', () => {
    const conveyor = createConveyor('straight')
    const start = sampleConveyorPath(conveyor, 0)
    const end = sampleConveyorPath(conveyor, 0.99)
    expect(end.x).toBeGreaterThan(start.x)
  })

  it('reverses transport direction without changing the physical path', () => {
    const conveyor = { ...createConveyor('incline'), direction: -1 as const }
    const start = sampleConveyorPath(conveyor, 0)
    const end = sampleConveyorPath(conveyor, 0.99)
    expect(start.x).toBeGreaterThan(end.x)
  })

  it('creates a multi-turn spiral path with changing elevation representation', () => {
    const conveyor = createConveyor('spiral')
    const points = [0, 0.25, 0.5, 0.75, 0.99].map((progress) => sampleConveyorPath(conveyor, progress))
    expect(new Set(points.map((point) => Math.round(point.x))).size).toBeGreaterThan(2)
    expect(new Set(points.map((point) => Math.round(point.y))).size).toBeGreaterThan(2)
  })

  it('uses a serpentine path for buffer accumulation', () => {
    const conveyor = createConveyor('buffer')
    const firstRowStart = sampleConveyorPath(conveyor, 0)
    const firstRowEnd = sampleConveyorPath(conveyor, 0.19)
    const secondRowEnd = sampleConveyorPath(conveyor, 0.39)
    expect(firstRowEnd.x).toBeGreaterThan(firstRowStart.x)
    expect(secondRowEnd.x).toBeLessThan(firstRowEnd.x)
  })
})


describe('Phase 1C connected conveyor route', () => {
  it('joins multiple conveyor modules into one continuous route', () => {
    const route = buildConnectedRoute([createConveyor('straight'), createConveyor('curve'), createConveyor('buffer')], 20)
    expect(route.points.length).toBeGreaterThan(40)
    expect(route.totalLengthMm).toBe(16000)
    expect(route.segmentIds.length).toBe(route.points.length)
  })

  it('samples connected-route progress as a continuous loop', () => {
    const conveyors = [createConveyor('straight'), createConveyor('incline')]
    const start = sampleConnectedRoute(conveyors, 0)
    const wrapped = sampleConnectedRoute(conveyors, 1)
    expect(wrapped.x).toBeCloseTo(start.x)
    expect(wrapped.y).toBeCloseTo(start.y)
  })
})
