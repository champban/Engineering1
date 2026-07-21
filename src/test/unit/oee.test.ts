import { describe, expect, it } from 'vitest'
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
