import { normalizeStudioDocument, type ObjectStudioDocument } from '@/domain/studio/object-studio'

const STUDIO_KEY = 'engineering1.object-studio.v1'

export function loadStudioDocument(): ObjectStudioDocument | null {
  try {
    const value = globalThis.localStorage?.getItem(STUDIO_KEY)
    if (!value) return null
    return normalizeStudioDocument(JSON.parse(value) as ObjectStudioDocument)
  } catch {
    return null
  }
}

export function saveStudioDocument(document: ObjectStudioDocument): void {
  try {
    globalThis.localStorage?.setItem(STUDIO_KEY, JSON.stringify(document))
  } catch {
    return
  }
}

export function exportStudioDocument(document: ObjectStudioDocument): string {
  return JSON.stringify(document, null, 2)
}
