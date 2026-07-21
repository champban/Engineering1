import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #18 Extended properties -- optional, freeform. */
export const ExtendedPropertyEntry = z.object({
  status: z.enum(['verified', 'estimated', 'unknown', 'pending', 'not_applicable']),
  value: z.union([z.number(), z.string(), z.boolean(), z.null()]),
  unit: z.string().optional(),
})
export type ExtendedPropertyEntry = z.infer<typeof ExtendedPropertyEntry>

export const ExtendedProperties = z.record(z.string(), ExtendedPropertyEntry)
export type ExtendedProperties = z.infer<typeof ExtendedProperties>

/** CORE_OBJECT_SCHEMA_V1.md #19 Audit. */
export const Audit = z.object({
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  modifiedBy: z.string().min(1),
  modifiedAt: z.string().datetime(),
  sourceFiles: z.array(z.string()).default([]),
  notes: z.string().default('N/A'),
})
export type Audit = z.infer<typeof Audit>
