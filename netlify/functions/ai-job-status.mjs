import { handleError, HttpError, json, parseBody, readFalJob } from '../lib/fal.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' })
  try {
    const body = parseBody(event)
    if (typeof body.statusUrl !== 'string' || typeof body.responseUrl !== 'string') {
      throw new HttpError(400, 'statusUrl and responseUrl are required.')
    }
    return json(200, await readFalJob(body.statusUrl, body.responseUrl))
  } catch (error) { return handleError(error) }
}
