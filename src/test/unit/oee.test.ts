import { describe, expect, it } from 'vitest'
import {
  calculateEngineeringCompleteness,
  createBomLine,
  createDemoEquipmentRecords,
  createEquipmentDocument,
  createEquipmentRecord,
  createUtilityRequirement,
  summarizeBom,
} from '@/domain/equipment/equipment-record'
import { createObjectAsset } from '@/domain/gallery/object-asset'
import { calculateOee, percentage } from '@/domain/runtime/oee'

describe('OEE calculation', () => {
  it('calculates availability, performance, quality, OEE, and waste', () => {
    const result = calculateOee({
      plannedMinutes: 480,
      downtimeMinutes: 48,
      idealRatePerMinute: 100,
      totalCount: 38880,
      rejectCount: 388,
    })
    expect(result.availability).toBeCloseTo(0.9)
    expect(result.performance).toBeCloseTo(0.9)
    expect(result.quality).toBeCloseTo(0.9900205)
    expect(result.oee).toBeCloseTo(0.801916, 5)
    expect(result.wasteRate).toBeCloseTo(0.0099794)
    expect(result.goodCount).toBe(38492)
  })

  it('clamps impossible inputs safely', () => {
    const result = calculateOee({
      plannedMinutes: 60,
      downtimeMinutes: 90,
      idealRatePerMinute: 100,
      totalCount: 50,
      rejectCount: 70,
    })
    expect(result.operatingMinutes).toBe(0)
    expect(result.goodCount).toBe(0)
    expect(result.oee).toBe(0)
    expect(result.wasteRate).toBe(1)
  })

  it('formats percentages consistently', () => {
    expect(percentage(0.8564)).toBe('85.6%')
  })
})

describe('Phase 2A equipment engineering records', () => {
  it('summarizes multi-currency BOM cost and critical spares', () => {
    const first = {
      ...createBomLine(1),
      quantity: 2,
      unitCost: 100,
      currency: 'EUR' as const,
      criticality: 'A' as const,
      sparePart: true,
    }
    const second = {
      ...createBomLine(2),
      quantity: 3,
      unitCost: 500,
      currency: 'THB' as const,
      criticality: 'C' as const,
      sparePart: false,
    }
    const summary = summarizeBom([first, second])
    expect(summary.totalLines).toBe(2)
    expect(summary.totalQuantity).toBe(5)
    expect(summary.criticalALines).toBe(1)
    expect(summary.sparePartLines).toBe(1)
    expect(summary.valueByCurrency.EUR).toBe(200)
    expect(summary.valueByCurrency.THB).toBe(1500)
  })

  it('calculates engineering-record readiness without claiming formal verification', () => {
    const draft = createEquipmentRecord({ assetId: 'asset-1', recordKind: 'equipment' })
    expect(calculateEngineeringCompleteness(draft).missing).toContain('manufacturer')
    const complete = {
      ...draft,
      equipmentTag: 'EQP-001',
      manufacturer: 'Example OEM',
      model: 'M-1',
      supplier: 'Example supplier',
      designRatePerMinute: 100,
      installedPowerKw: 5,
      leadTimeWeeks: 12,
      utilities: [createUtilityRequirement('electrical')],
      bom: [createBomLine(1)],
      documents: [{ ...createEquipmentDocument(), status: 'approved' as const }],
    }
    expect(calculateEngineeringCompleteness(complete).ratio).toBe(1)
  })

  it('creates three usable engineering-data demo records', () => {
    const makeAsset = (name: string, category: string) => createObjectAsset({
      name,
      category,
      sourceType: 'manual',
      geometryType: 'proxy-box',
      lifecycle: 'calibrated',
      dimensionsMm: { length: 100, width: 80, height: 60 },
      thumbnailDataUrl: 'data:image/svg+xml,test',
    })
    const records = createDemoEquipmentRecords([
      makeAsset('Cookie Single Pack', 'Product format'),
      makeAsset('Gearmotor 0.75 kW', 'Drive'),
      makeAsset('Landscape Tree Placeholder', 'Landscape'),
    ])
    expect(records.map((record) => record.recordKind)).toEqual(['product-format', 'equipment', 'infrastructure'])
    expect(records.find((record) => record.recordKind === 'equipment')?.bom.length).toBeGreaterThan(1)
  })
})
