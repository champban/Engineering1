import { describe, it, expect } from 'vitest'
import {
  gramsToKg,
  kilogramsToKg,
  tonnesToKg,
  cmToMm,
  mToMm,
  toMillimetres,
  toKilograms,
} from '@/core/validation/units'

describe('mass normalization to kg', () => {
  it('g to kg', () => expect(gramsToKg(1500)).toBeCloseTo(1.5, 9))
  it('kg to kg', () => expect(kilogramsToKg(2.4)).toBeCloseTo(2.4, 9))
  it('t to kg', () => expect(tonnesToKg(0.5)).toBeCloseTo(500, 9))
  it('null passes through', () => expect(toKilograms(null, 'g')).toBeNull())
})

describe('length normalization to mm', () => {
  it('cm to mm', () => expect(cmToMm(12)).toBeCloseTo(120, 9))
  it('m to mm', () => expect(mToMm(2)).toBeCloseTo(2000, 9))
  it('mm to mm', () => expect(toMillimetres(45, 'mm')).toBeCloseTo(45, 9))
  it('null passes through', () => expect(toMillimetres(null, 'm')).toBeNull())
})
