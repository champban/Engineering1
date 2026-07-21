import type { ObjectStudioDocument } from '@/domain/studio/object-studio'

const STUDIO_KEY = 'engineering1.object-studio.v1'

export function loadStudioDocument(): ObjectStudioDocument | null {
  try {
    const value = globalThis.localStorage?.getItem(STUDIO_KEY)
    return value ? JSON.parse(value) as ObjectStudioDocument : null
  } catch {
    return null
  }
}

export function saveStudioDocument(document: ObjectStudioDocument): void {
  try {
    globalThis.localStorage?.setItem(STUDIO_KEY, JSON.stringify(document))
  } catch {
    // Browser storage may be unavailable.
  }
}

export function exportStudioDocument(document: ObjectStudioDocument): string {
  return JSON.stringify(document, null, 2)
}
