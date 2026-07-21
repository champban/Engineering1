const FAL_QUEUE_ORIGIN = 'https://queue.fal.run'

export function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
    body: JSON.stringify(payload),
  }
}

export function requireFalKey() {
  const key = process.env.FAL_KEY
  if (!key) throw new HttpError(503, 'AI provider is not configured. Set FAL_KEY in the server environment.')
  return key
}

export async function submitFalJob(model, input) {
  const key = requireFalKey()
  const response = await fetch(`${FAL_QUEUE_ORIGIN}/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const payload = await safeJson(response)
  if (!response.ok) throw new HttpError(response.status, providerMessage(payload, 'Unable to submit AI job.'))
  const requestId = payload.request_id
  const statusUrl = payload.status_url
  const responseUrl = payload.response_url
  if (typeof requestId !== 'string' || typeof statusUrl !== 'string' || typeof responseUrl !== 'string') {
    throw new HttpError(502, 'AI provider returned an incomplete queue response.')
  }
  return { requestId, statusUrl, responseUrl, model }
}

export async function readFalJob(statusUrl, responseUrl) {
  const key = requireFalKey()
  assertFalUrl(statusUrl)
  assertFalUrl(responseUrl)
  const statusResponse = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` } })
  const statusPayload = await safeJson(statusResponse)
  if (!statusResponse.ok) throw new HttpError(statusResponse.status, providerMessage(statusPayload, 'Unable to read AI job status.'))
  const status = normalizeStatus(statusPayload.status)
  if (status !== 'COMPLETED') {
    return {
      status,
      logs: Array.isArray(statusPayload.logs)
        ? statusPayload.logs.map((entry) => String(entry?.message ?? entry)).slice(-12)
        : [],
    }
  }
  const resultResponse = await fetch(responseUrl, { headers: { Authorization: `Key ${key}` } })
  const result = await safeJson(resultResponse)
  if (!resultResponse.ok) throw new HttpError(resultResponse.status, providerMessage(result, 'Unable to read AI job result.'))
  return { status: 'COMPLETED', result }
}

export function parseBody(event) {
  if (!event.body) throw new HttpError(400, 'Request body is required.')
  try { return JSON.parse(event.body) } catch { throw new HttpError(400, 'Request body must be valid JSON.') }
}

export function validateImageDataUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) throw new HttpError(400, 'imageDataUrl must be an image data URL.')
  if (value.length > 14_000_000) throw new HttpError(413, 'Image is too large. Resize it before AI processing.')
  return value
}

export function handleError(error) {
  if (error instanceof HttpError) return json(error.statusCode, { error: error.message })
  console.error(error)
  return json(500, { error: 'Unexpected server error.' })
}

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function assertFalUrl(value) {
  let parsed
  try { parsed = new URL(value) } catch { throw new HttpError(400, 'Invalid AI job URL.') }
  const allowed = parsed.protocol === 'https:' && (parsed.hostname === 'queue.fal.run' || parsed.hostname.endsWith('.fal.run'))
  if (!allowed) throw new HttpError(400, 'AI job URL host is not allowed.')
}

function normalizeStatus(value) {
  if (value === 'COMPLETED' || value === 'IN_PROGRESS' || value === 'IN_QUEUE' || value === 'FAILED') return value
  return 'IN_PROGRESS'
}

async function safeJson(response) {
  const text = await response.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { message: text.slice(0, 500) } }
}

function providerMessage(payload, fallback) {
  if (typeof payload?.detail === 'string') return payload.detail
  if (typeof payload?.message === 'string') return payload.message
  if (typeof payload?.error === 'string') return payload.error
  return fallback
}
