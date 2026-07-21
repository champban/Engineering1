export interface AiCapabilities {
  configured: boolean
  provider: string | null
  segmentationModel: string | null
  reconstructionModel: string | null
}

export interface SelectionBox { xMin: number; yMin: number; xMax: number; yMax: number }
export interface AiJobReference { requestId: string; statusUrl: string; responseUrl: string; model: string }
export interface AiJobResult {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  result?: Record<string, unknown>
  logs?: string[]
  error?: string
}

export async function getAiCapabilities(): Promise<AiCapabilities> {
  try {
    const response = await fetch('/api/ai-capabilities')
    if (!response.ok) return unavailableCapabilities()
    return (await response.json()) as AiCapabilities
  } catch { return unavailableCapabilities() }
}

export async function submitSegmentation(imageDataUrl: string, box: SelectionBox): Promise<AiJobReference> {
  return postJob('/api/ai-segment', { imageDataUrl, box })
}

export async function submitReconstruction(imageDataUrl: string): Promise<AiJobReference> {
  return postJob('/api/ai-reconstruct', { imageDataUrl })
}

export async function pollAiJob(
  job: AiJobReference,
  onStatus: (status: AiJobResult['status']) => void,
  timeoutMs = 300_000,
): Promise<Record<string, unknown>> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const response = await fetch('/api/ai-job-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(job),
    })
    const payload = (await response.json()) as AiJobResult
    if (!response.ok || payload.status === 'FAILED') throw new Error(payload.error || 'AI job failed.')
    onStatus(payload.status)
    if (payload.status === 'COMPLETED' && payload.result) return payload.result
    await new Promise((resolve) => setTimeout(resolve, 1800))
  }
  throw new Error('AI job timed out before completion.')
}

async function postJob(url: string, body: unknown): Promise<AiJobReference> {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const payload = (await response.json()) as AiJobReference & { error?: string }
  if (!response.ok) throw new Error(payload.error || 'Unable to submit AI job.')
  return payload
}

function unavailableCapabilities(): AiCapabilities {
  return { configured: false, provider: null, segmentationModel: null, reconstructionModel: null }
}
