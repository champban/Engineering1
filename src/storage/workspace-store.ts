import type { ObjectAsset } from '@/domain/gallery/object-asset'
import type { LayoutProject } from '@/domain/layout/layout'

const GALLERY_KEY = 'engineering1.gallery.v1'
const LAYOUT_KEY = 'engineering1.layout.v1'

export interface WorkspaceSnapshot { gallery: ObjectAsset[]; layout: LayoutProject | null }

export function loadGallery(): ObjectAsset[] { return readJson<ObjectAsset[]>(GALLERY_KEY, []) }
export function saveGallery(gallery: readonly ObjectAsset[]): void { writeJson(GALLERY_KEY, gallery) }
export function loadLayout(): LayoutProject | null { return readJson<LayoutProject | null>(LAYOUT_KEY, null) }
export function saveLayout(layout: LayoutProject): void { writeJson(LAYOUT_KEY, layout) }
export function exportWorkspace(snapshot: WorkspaceSnapshot): string { return JSON.stringify(snapshot, null, 2) }

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = globalThis.localStorage?.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch { return fallback }
}

function writeJson(key: string, value: unknown): void {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)) } catch { /* storage can be unavailable */ }
}
