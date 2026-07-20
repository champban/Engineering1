import { validFixtures } from '@/test/fixtures/valid'
import { invalidFixtures } from '@/test/fixtures/invalid'
import { CoreObjectSchema } from '@/core/schema/core-object'
import {
  validateDraft,
  validateVerified,
  validateReleased,
} from '@/core/validation/engine'
import type { CoreObject } from '@/core/schema/core-object'

export interface ValidFixtureSummaryRow {
  key: string
  label: string
  name: string
  shape: string
  status: string
  parses: boolean
  draftOk: boolean
  verifiedOk: boolean
  releasedApplicableOk: boolean
}

export interface InvalidFixtureSummaryRow {
  key: string
  description: string
  level: string
  rejected: boolean
}

export interface FixtureSummary {
  valid: ValidFixtureSummaryRow[]
  invalid: InvalidFixtureSummaryRow[]
  validPassCount: number
  invalidRejectCount: number
}

export function computeFixtureSummary(): FixtureSummary {
  const valid: ValidFixtureSummaryRow[] = validFixtures.map(({ key, label, object }) => {
    const parsed = CoreObjectSchema.safeParse(object)
    const draftOk = validateDraft(object).valid
    const verifiedOk = validateVerified(object).valid
    const releasedApplicableOk =
      object.lifecycle.status === 'released'
        ? validateReleased(object).valid
        : true
    return {
      key,
      label,
      name: object.identity.name,
      shape: object.geometry.shapeType,
      status: object.lifecycle.status,
      parses: parsed.success,
      draftOk,
      verifiedOk,
      releasedApplicableOk,
    }
  })

  const invalid: InvalidFixtureSummaryRow[] = invalidFixtures.map((f) => {
    const input = f.build()
    let rejected = false
    const parsed = CoreObjectSchema.safeParse(input)
    if (f.level === 'parse') {
      rejected = !parsed.success
    } else if (parsed.success) {
      const object = parsed.data as CoreObject
      if (f.level === 'draft') rejected = !validateDraft(object).valid
      else if (f.level === 'verified') rejected = !validateVerified(object).valid
      else rejected = !validateReleased(object).valid
    }
    return { key: f.key, description: f.description, level: f.level, rejected }
  })

  return {
    valid,
    invalid,
    validPassCount: valid.filter(
      (v) => v.parses && v.draftOk && v.verifiedOk && v.releasedApplicableOk,
    ).length,
    invalidRejectCount: invalid.filter((i) => i.rejected).length,
  }
}
