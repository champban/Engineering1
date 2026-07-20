/**
 * Viewport boundaries (work order #13, ARCHITECTURE_DECISION_V1.md #4-5).
 *
 * Interfaces only. These prevent React components and Three.js objects from
 * becoming the domain model. No Three.js implementation exists in Phase 0.
 *
 * The domain document is authoritative; the viewport is a render
 * representation that is updated through these adapters.
 */

import type { CoreObject } from '@/core/schema/core-object'

export interface ViewportMountOptions {
  container: HTMLElement
  antialias?: boolean
}

/**
 * Owns the render loop, scene graph, cameras, raycasting, selection,
 * transform gizmos, grid/snapping visuals, and measurement overlays.
 * Unmounting a React panel must not destroy scene state (arch #5).
 */
export interface ViewportAdapter {
  mount(options: ViewportMountOptions): void
  unmount(): void
  /** Synchronise the render scene from an authoritative domain object. */
  syncObject(object: CoreObject): void
  removeObject(objectId: string): void
  /** True once mounted with a live renderer and running loop. */
  readonly isMounted: boolean
}

export type RendererBackend = 'webgl' | 'webgpu'

/**
 * Isolates the concrete renderer so a future WebGPU evaluation does not
 * couple application state to renderer internals (arch #2).
 */
export interface RendererAdapter {
  readonly backend: RendererBackend
  createContext(canvas: HTMLCanvasElement): void
  resize(widthPx: number, heightPx: number): void
  renderFrame(): void
  dispose(): void
}
