import type { LengthUnit, MassUnit } from '@/core/schema/primitives'

/**
 * Unit and normalization policy (work order #11, ARCHITECTURE_DECISION_V1.md #6):
 * - Internal length: millimetres
 * - Internal mass: kilograms
 * - Unknown numeric values use `null`, never `0`
 */

const LENGTH_TO_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
}

const MASS_TO_KG: Record<MassUnit, number> = {
  g: 0.001,
  kg: 1,
  t: 1000,
}

/** Convert a length value to internal millimetres. Null passes through. */
export function toMillimetres(
  value: number | null,
  unit: LengthUnit,
): number | null {
  if (value === null) return null
  return value * LENGTH_TO_MM[unit]
}

/** Convert a mass value to internal kilograms. Null passes through. */
export function toKilograms(value: number | null, unit: MassUnit): number | null {
  if (value === null) return null
  return value * MASS_TO_KG[unit]
}

export function gramsToKg(value: number | null): number | null {
  return toKilograms(value, 'g')
}

export function kilogramsToKg(value: number | null): number | null {
  return toKilograms(value, 'kg')
}

export function tonnesToKg(value: number | null): number | null {
  return toKilograms(value, 't')
}

export function cmToMm(value: number | null): number | null {
  return toMillimetres(value, 'cm')
}

export function mToMm(value: number | null): number | null {
  return toMillimetres(value, 'm')
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}
