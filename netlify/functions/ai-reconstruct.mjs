import { handleError, json, parseBody, submitFalJob, validateImageDataUrl } from '../lib/fal.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' })
  try {
    const body = parseBody(event)
    const imageUrl = validateImageDataUrl(body.imageDataUrl)
    const job = await submitFalJob('tripo3d/tripo/v2.5/image-to-3d', {
      image_url: imageUrl,
      texture: 'standard',
      texture_alignment: 'original_image',
      orientation: 'align_image',
      pbr: true,
      auto_size: false,
      face_limit: 50000,
    })
    return json(202, job)
  } catch (error) { return handleError(error) }
}
