import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #5 Identity */
export const Identity = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  description: z.string().default('N/A'),
  manufacturer: z.string().default('N/A'),
  model: z.string().default('N/A'),
  partNumber: z.string().default('N/A'),
  serialNumber: z.string().default('N/A'),
  tags: z.array(z.string()).default([]),
})
export type Identity = z.infer<typeof Identity>

/** CORE_OBJECT_SCHEMA_V1.md #6 Lifecycle and verification */
export const ObjectStatus = z.enum(['draft', 'verified', 'released', 'obsolete'])
export type ObjectStatus = z.infer<typeof ObjectStatus>

export const VerificationStatus = z.enum(['unverified', 'verified'])
export type VerificationStatus = z.infer<typeof VerificationStatus>

export const Lifecycle = z.object({
  status: ObjectStatus,
  revision: z.string().min(1),
  verificationStatus: VerificationStatus,
  verifiedBy: z.string().default('N/A'),
  verifiedAt: z.string().datetime().nullable().default(null),
})
export type Lifecycle = z.infer<typeof Lifecycle>
