/**
 * Package interface preparation (work order #12, NATIVE_PACKAGE_SPEC_V1.md).
 *
 * Types only. ZIP import/export is explicitly NOT implemented in Phase 0.
 */

export type PackageType = 'v3dproject' | 'v3do' | 'v3da'
export type PackageStatus = 'draft' | 'verified' | 'released' | 'obsolete'

export interface IntegrityFileEntry {
  /** SHA-256 hash of the file bytes, produced via Web Crypto at export time. */
  sha256: string
  sizeBytes: number
}

export interface PackageIntegrity {
  algorithm: 'SHA-256'
  files: Record<string, IntegrityFileEntry>
}

/** NATIVE_PACKAGE_SPEC_V1.md #3 Common manifest. */
export interface PackageManifest {
  packageType: PackageType
  packageVersion: string
  schemaVersion: string
  packageId: string
  name: string
  revision: string
  status: PackageStatus
  createdAt: string
  modifiedAt: string
  entryFile: string
  integrity: PackageIntegrity
  /** Preserved even when unknown, per #12 compatibility rule. */
  minimumApplicationVersion?: string
  maximumTestedApplicationVersion?: string
}

export interface ProjectManifest extends PackageManifest {
  packageType: 'v3dproject'
}

export interface ObjectPackageManifest extends PackageManifest {
  packageType: 'v3do'
}

export interface AssemblyPackageManifest extends PackageManifest {
  packageType: 'v3da'
}

/** NATIVE_PACKAGE_SPEC_V1.md #7 Linked and embedded modes. */
export type AssetMode = 'linked' | 'embedded'

export interface AssetManifestEntry {
  assetId: string
  relativePath: string
  mode: AssetMode
  sourcePackageId?: string
  sourceRevision?: string
  expectedSha256?: string
  updateAvailable?: boolean
  hasLocalOverrides?: boolean
}

/** NATIVE_PACKAGE_SPEC_V1.md #9 Revision model. */
export interface RevisionManifest {
  revision: string
  parentRevision: string | null
  createdAt: string
  createdBy: string
  reason: string
  changedFiles: string[]
  validationStatus: 'passed' | 'failed' | 'not_evaluated'
  releaseStatus: 'working' | 'released'
}
