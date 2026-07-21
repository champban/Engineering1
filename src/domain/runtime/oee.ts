export interface OeeInputs {
  plannedMinutes: number
  downtimeMinutes: number
  idealRatePerMinute: number
  totalCount: number
  rejectCount: number
}

export interface OeeResult {
  operatingMinutes: number
  goodCount: number
  availability: number
  performance: number
  quality: number
  oee: number
  wasteRate: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function calculateOee(input: OeeInputs): OeeResult {
  const plannedMinutes = Math.max(0, input.plannedMinutes)
  const downtimeMinutes = Math.min(plannedMinutes, Math.max(0, input.downtimeMinutes))
  const operatingMinutes = Math.max(0, plannedMinutes - downtimeMinutes)
  const totalCount = Math.max(0, input.totalCount)
  const rejectCount = Math.min(totalCount, Math.max(0, input.rejectCount))
  const goodCount = totalCount - rejectCount
  const availability = plannedMinutes > 0 ? clamp01(operatingMinutes / plannedMinutes) : 0
  const performance = operatingMinutes > 0 && input.idealRatePerMinute > 0
    ? clamp01(totalCount / (operatingMinutes * input.idealRatePerMinute))
    : 0
  const quality = totalCount > 0 ? clamp01(goodCount / totalCount) : 0
  const oee = availability * performance * quality
  const wasteRate = totalCount > 0 ? clamp01(rejectCount / totalCount) : 0
  return { operatingMinutes, goodCount, availability, performance, quality, oee, wasteRate }
}

export function percentage(value: number): string {
  return `${(clamp01(value) * 100).toFixed(1)}%`
}
