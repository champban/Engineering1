/**
 * Storage boundaries (work order #13, ARCHITECTURE_DECISION_V1.md #7).
 *
 * Interfaces only. Persistence is accessed only through repository interfaces,
 * never directly from UI components. No Dexie/IndexedDB/OPFS implementation
 * exists in Phase 0.
 */

import type { CoreObject } from '@/core/schema/core-object'
import type {
  ObjectPackageManifest,
  AssemblyPackageManifest,
  ProjectManifest,
  RevisionManifest,
} from '@/domain/packages/manifests'

export interface ProjectIndexEntry {
  projectId: string
  name: string
  updatedAt: string
  revision: string
}

/** Searchable metadata store (IndexedDB/Dexie in a later phase). */
export interface ProjectRepository {
  listProjects(): Promise<ProjectIndexEntry[]>
  getManifest(projectId: string): Promise<ProjectManifest | null>
  getObject(projectId: string, objectId: string): Promise<CoreObject | null>
  putObject(projectId: string, object: CoreObject): Promise<void>
  listRevisions(projectId: string): Promise<RevisionManifest[]>
}

/** Large binary asset store (OPFS in a later phase). */
export interface AssetRepository {
  putAsset(assetId: string, bytes: Blob): Promise<void>
  getAsset(assetId: string): Promise<Blob | null>
  deleteAsset(assetId: string): Promise<void>
  hasAsset(assetId: string): Promise<boolean>
}

/**
 * Reads validated domain documents + referenced assets and produces a native
 * package (.v3dproject / .v3do / .v3da). ZIP handling is deferred (arch #7).
 */
export interface PackageSerializer {
  serializeObjectPackage(
    object: CoreObject,
  ): Promise<{ manifest: ObjectPackageManifest; bytes: Blob }>
  serializeAssemblyPackage(
    objects: CoreObject[],
  ): Promise<{ manifest: AssemblyPackageManifest; bytes: Blob }>
  deserialize(bytes: Blob): Promise<{ objects: CoreObject[] }>
}
