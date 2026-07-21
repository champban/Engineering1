import { json } from '../lib/fal.mjs'

export const handler = async () => {
  const configured = Boolean(process.env.FAL_KEY)
  return json(200, {
    configured,
    provider: configured ? 'fal.ai' : null,
    segmentationModel: configured ? 'fal-ai/sam2/image' : null,
    reconstructionModel: configured ? 'tripo3d/tripo/v2.5/image-to-3d' : null,
  })
}
