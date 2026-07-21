import { handleError, HttpError, json, parseBody, submitFalJob, validateImageDataUrl } from '../lib/fal.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' })
  try {
    const body = parseBody(event)
    const imageUrl = validateImageDataUrl(body.imageDataUrl)
    const box = body.box
    const values = [box?.xMin, box?.yMin, box?.xMax, box?.yMax]
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      throw new HttpError(400, 'Selection box must contain non-negative integer pixel coordinates.')
    }
    if (box.xMax <= box.xMin || box.yMax <= box.yMin) throw new HttpError(400, 'Selection box must have positive width and height.')
    const job = await submitFalJob('fal-ai/sam2/image', {
      image_url: imageUrl,
      box_prompts: [{ x_min: box.xMin, y_min: box.yMin, x_max: box.xMax, y_max: box.yMax }],
      apply_mask: true,
      output_format: 'png',
    })
    return json(202, job)
  } catch (error) { return handleError(error) }
}
