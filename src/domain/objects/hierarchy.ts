import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #12 Hierarchy and grouping. */
export const Hierarchy = z.object({
  parentObjectId: z.string().min(1),
  childrenObjectIds: z.array(z.string()).default([]),
  groupId: z.string().default('N/A'),
  moduleId: z.string().default('N/A'),
  inheritParentTransform: z.boolean(),
  locked: z.boolean(),
})
export type Hierarchy = z.infer<typeof Hierarchy>
