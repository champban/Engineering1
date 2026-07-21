import { describe, it, expect } from 'vitest'
import {
  projectedLengthAlongFlowMm,
  projectedWidthAcrossFlowMm,
  effectivePitchMm,
  productsPerMinute,
  evaluateOrientationTolerance,
} from '@/domain/orientation/orientation'

const L = 60
const W = 40

describe('projected dimensions', () => {
  it('lengthwise (0deg): projected length == L, width == W', () => {
    expect(projectedLengthAlongFlowMm(L, W, 0)).toBeCloseTo(L, 6)
    expect(projectedWidthAcrossFlowMm(L, W, 0)).toBeCloseTo(W, 6)
  })

  it('crosswise (90deg): projected length == W, width == L', () => {
    expect(projectedLengthAlongFlowMm(L, W, 90)).toBeCloseTo(W, 6)
    expect(projectedWidthAcrossFlowMm(L, W, 90)).toBeCloseTo(L, 6)
  })

  it('45deg projection uses |Lcos| + |Wsin|', () => {
    const expectedLen = Math.abs(L * Math.cos(Math.PI / 4)) + Math.abs(W * Math.sin(Math.PI / 4))
    expect(projectedLengthAlongFlowMm(L, W, 45)).toBeCloseTo(expectedLen, 6)
  })
})

describe('pitch and throughput', () => {
  it('effective pitch = projected length + gap', () => {
    const projected = projectedLengthAlongFlowMm(L, W, 0) // 60
    expect(effectivePitchMm(projected, 20)).toBeCloseTo(80, 6)
  })

  it('orientation change recalculates pitch and throughput', () => {
    const gap = 20
    const beltSpeed = 0.5 // m/s

    const pitchLengthwise = effectivePitchMm(projectedLengthAlongFlowMm(L, W, 0), gap) // 80mm
    const pitchCrosswise = effectivePitchMm(projectedLengthAlongFlowMm(L, W, 90), gap) // 60mm

    expect(pitchCrosswise).toBeLessThan(pitchLengthwise)

    const ppmLengthwise = productsPerMinute(beltSpeed, pitchLengthwise)
    const ppmCrosswise = productsPerMinute(beltSpeed, pitchCrosswise)

    // Smaller pitch -> higher throughput.
    expect(ppmCrosswise).toBeGreaterThan(ppmLengthwise)
    // 0.5 m/s over 0.08 m pitch * 60 = 375 products/min
    expect(ppmLengthwise).toBeCloseTo(375, 3)
  })

  it('non-positive pitch yields zero throughput', () => {
    expect(productsPerMinute(0.5, 0)).toBe(0)
  })
})

describe('orientation tolerance pass/fail', () => {
  const base = {
    targetRotationRelativeToFlowDeg: 0,
    rotationToleranceDeg: 5,
    skewToleranceDeg: 3,
    tiltToleranceDeg: 2,
    lateralOffsetToleranceMm: 10,
  }

  it('within tolerance passes', () => {
    const r = evaluateOrientationTolerance({
      ...base,
      rotationRelativeToFlowDeg: 2,
      skewAngleDeg: 1,
      tiltAngleDeg: 0.5,
      lateralOffsetMm: 3,
    })
    expect(r.passed).toBe(true)
    expect(r.failures).toEqual([])
  })

  it('skewed 12deg is rejected by +/-5deg (via rotation) and skew rules', () => {
    const r = evaluateOrientationTolerance({
      ...base,
      rotationRelativeToFlowDeg: 12,
      skewAngleDeg: 12,
      tiltAngleDeg: 0,
      lateralOffsetMm: 0,
    })
    expect(r.passed).toBe(false)
    expect(r.failures.length).toBeGreaterThan(0)
  })
})
