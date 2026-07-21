import { describe, expect, it } from 'vitest'
import {
  canvasPointToWorld,
  createConveyor,
  duplicateSceneInstance,
  evaluateConveyorConnections,
  reorderConveyor,
  snapToGrid,
  type SceneObjectInstance,
} from '@/domain/layout/layout'

describe('Phase 1B layout interaction helpers', () => {
  it('snaps engineering coordinates to the selected grid', () => {
    expect(snapToGrid(1124, 250)).toBe(1000)
    expect(snapToGrid(1130, 250)).toBe(1250)
  })

  it('converts canvas pointer positions into bounded world millimetres', () => {
    expect(canvasPointToWorld(
      { xPx: 300, yPx: 190 },
      { widthPx: 600, heightPx: 380 },
      250,
    )).toEqual({ xMm: 5000, zMm: 3500 })
    expect(canvasPointToWorld(
      { xPx: 900, yPx: -20 },
      { widthPx: 600, heightPx: 380 },
      250,
    )).toEqual({ xMm: 10000, zMm: 0 })
  })

  it('duplicates scene instances without reusing their identity', () => {
    const instance: SceneObjectInstance = {
      id: 'inst-original',
      assetId: 'asset-1',
      name: 'Case packer',
      xMm: 1000,
      zMm: 1500,
      elevationMm: 0,
      rotationDeg: 0,
      scale: 1,
      thumbnailDataUrl: 'data:image/svg+xml,test',
    }
    const duplicate = duplicateSceneInstance(instance, 500)
    expect(duplicate.id).not.toBe(instance.id)
    expect(duplicate.name).toBe('Case packer copy')
    expect(duplicate.xMm).toBe(1500)
    expect(duplicate.zMm).toBe(2000)
  })

  it('reorders modules and flags incompatible conveyor interfaces', () => {
    const first = { ...createConveyor('straight'), id: 'first', productType: 'cookie-pack' as const }
    const second = {
      ...createConveyor('curve'),
      id: 'second',
      entryElevationMm: first.exitElevationMm + 100,
      productType: 'carton' as const,
    }
    expect(reorderConveyor([first, second], 'second', -1).map((item) => item.id)).toEqual(['second', 'first'])
    expect(evaluateConveyorConnections([first, second])).toEqual([
      {
        fromId: 'first',
        toId: 'second',
        elevationGapMm: 100,
        productTypeMatch: false,
        compatible: false,
      },
    ])
  })
})
