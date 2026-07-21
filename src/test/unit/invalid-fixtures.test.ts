import { describe, it, expect } from 'vitest'
import { CoreObjectSchema, type CoreObject } from '@/core/schema/core-object'
import {
  validateDraft,
  validateVerified,
  validateReleased,
} from '@/core/validation/engine'
import { invalidFixtures } from '@/test/fixtures/invalid'

describe('invalid fixtures are rejected at the expected level', () => {
  for (const fixture of invalidFixtures) {
    it(`${fixture.key}: ${fixture.description}`, () => {
      const input = fixture.build()

      if (fixture.level === 'parse') {
        const parsed = CoreObjectSchema.safeParse(input)
        expect(parsed.success).toBe(false)
        return
      }

      // Non-parse cases must still parse structurally, then fail at their level.
      const parsed = CoreObjectSchema.safeParse(input)
      expect(parsed.success).toBe(true)
      const object = parsed.success ? parsed.data : (input as CoreObject)

      let result
      if (fixture.level === 'draft') result = validateDraft(object)
      else if (fixture.level === 'verified') result = validateVerified(object)
      else result = validateReleased(object)

      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
      // Every issue must be human-readable with a path.
      for (const issue of result.issues) {
        expect(issue.path.length).toBeGreaterThan(0)
        expect(issue.message.length).toBeGreaterThan(0)
      }
    })
  }

  it('covers all 13 required invalid categories', () => {
    expect(invalidFixtures.length).toBeGreaterThanOrEqual(13)
  })
})
