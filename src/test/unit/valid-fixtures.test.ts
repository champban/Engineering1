import { describe, it, expect } from 'vitest'
import { CoreObjectSchema } from '@/core/schema/core-object'
import {
  validateDraft,
  validateVerified,
  validateReleased,
} from '@/core/validation/engine'
import { validFixtures } from '@/test/fixtures/valid'

describe('valid fixtures', () => {
  for (const { key, object } of validFixtures) {
    it(`${key}: parses against CoreObjectSchema`, () => {
      const result = CoreObjectSchema.safeParse(object)
      if (!result.success) {
        // Surface the first error for a readable failure message.
        throw new Error(JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success).toBe(true)
    })

    it(`${key}: passes draft validation`, () => {
      const result = validateDraft(object)
      expect(result.issues).toEqual([])
      expect(result.valid).toBe(true)
    })

    it(`${key}: passes verified validation`, () => {
      const result = validateVerified(object)
      expect(result.issues).toEqual([])
      expect(result.valid).toBe(true)
    })
  }

  it('released fixtures pass release validation', () => {
    const released = validFixtures.filter(
      (f) => f.object.lifecycle.status === 'released',
    )
    expect(released.length).toBeGreaterThan(0)
    for (const { object } of released) {
      const result = validateReleased(object)
      expect(result.issues).toEqual([])
      expect(result.valid).toBe(true)
    }
  })
})
