import { z } from 'zod'

/** CORE_OBJECT_SCHEMA_V1.md #9 Surface and material -- mandatory for every object. */
export const TextureMode = z.enum(['none', 'procedural', 'image', 'internet_image'])
export type TextureMode = z.infer<typeof TextureMode>

export const MappingMode = z.enum(['fit', 'fill', 'tile', 'wrap', 'triplanar'])
export type MappingMode = z.infer<typeof MappingMode>

export const SurfaceStatus = z.enum(['verified', 'estimated', 'unknown', 'pending'])
export type SurfaceStatus = z.infer<typeof SurfaceStatus>

export const Surface = z.object({
  material: z.string().min(1),
  materialGrade: z.string().default('N/A'),
  finish: z.string().min(1),
  baseColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'baseColor must be a hex color, e.g. #A0A0A0'),
  textureMode: TextureMode,
  textureReference: z.string().default('N/A'),
  mappingMode: MappingMode,
  roughness: z.number().min(0).max(1),
  metallic: z.number().min(0).max(1),
  opacity: z.number().min(0).max(1),
  normalMap: z.string().default('N/A'),
  displacementMap: z.string().default('N/A'),
  sourceUrl: z.string().default('N/A'),
  license: z.string().default('N/A'),
  status: SurfaceStatus,
})
export type Surface = z.infer<typeof Surface>
