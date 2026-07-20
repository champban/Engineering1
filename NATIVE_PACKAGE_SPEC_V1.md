# NATIVE PACKAGE SPECIFICATION V1

Status: Approved for Phase 0 implementation
Package version: `1.0.0`
Owner: ChatGPT
Date: 2026-07-20

## 1. Purpose

Define portable, versioned, local-first packages for projects, reusable objects, and assemblies. The package design shall preserve geometry, materials, engineering properties, orientation, measurements, connectors, hierarchy, revisions, and animation-ready metadata.

## 2. Package types

### Project package

Recommended extension: `.v3dproject`

Contains complete working project, scenes, imported assets, object references, revisions, recovery information, and exports.

### Reusable object package

Extension: `.v3do`

Contains one reusable part or module, including optional child hierarchy.

### Assembly package

Extension: `.v3da`

Contains multiple linked or embedded objects, scene hierarchy, connectors, orientation, and assembly-level properties.

All extensions are ZIP-compatible containers with a documented internal structure. The application shall identify them by manifest, not extension alone.

## 3. Common manifest

Every package contains `/manifest.json`.

```json
{
  "packageType": "v3do",
  "packageVersion": "1.0.0",
  "schemaVersion": "1.0.0",
  "packageId": "PKG-000001",
  "name": "Conveyor Roller",
  "revision": "R000",
  "status": "draft",
  "createdAt": "2026-07-20T00:00:00Z",
  "modifiedAt": "2026-07-20T00:00:00Z",
  "entryFile": "object/object.json",
  "integrity": {
    "algorithm": "SHA-256",
    "files": {}
  }
}
```

## 4. Project package structure

```text
project.v3dproject/
├── manifest.json
├── project/
│   ├── project.json
│   ├── settings.json
│   ├── units.json
│   ├── grid.json
│   ├── views.json
│   ├── scenes.json
│   └── task-state.json
├── objects/
│   ├── linked-objects.json
│   └── embedded/
├── assemblies/
├── captures/
│   ├── photos/
│   ├── videos/
│   ├── sessions/
│   └── calibration/
├── processing/
│   ├── frames/
│   ├── point-clouds/
│   ├── original-meshes/
│   └── reports/
├── models/
│   ├── working/
│   ├── optimized/
│   └── released/
├── textures/
│   ├── source/
│   ├── processed/
│   └── baked/
├── drawings/
├── measurements/
├── simulation/
│   ├── relationships.json
│   ├── paths.json
│   ├── states.json
│   ├── animations.json
│   └── events.json
├── exports/
│   ├── web/
│   ├── mesh/
│   ├── cad/
│   ├── drawings/
│   └── reports/
├── revisions/
├── recovery/
└── audit/
```

## 5. Object package structure

```text
object.v3do/
├── manifest.json
├── object/
│   ├── object.json
│   ├── dimensions.json
│   ├── orientation.json
│   ├── motion.json
│   ├── connections.json
│   ├── measurements.json
│   └── extended-properties.json
├── geometry/
│   ├── model.glb
│   ├── engineering.step
│   ├── mesh.stl
│   ├── source-mesh.obj
│   └── lod/
├── features/
│   ├── sketches.json
│   ├── history.json
│   └── parameters.json
├── materials/
│   ├── materials.json
│   └── textures/
├── children/
├── thumbnails/
│   ├── preview.webp
│   └── preview.png
├── source/
│   ├── capture-reference.json
│   └── import-reference.json
├── revisions/
└── audit/
```

Only files that exist are listed in `manifest.integrity.files`.

## 6. Assembly package structure

```text
assembly.v3da/
├── manifest.json
├── assembly/
│   ├── assembly.json
│   ├── hierarchy.json
│   ├── transforms.json
│   ├── connections.json
│   ├── relationships.json
│   ├── measurements.json
│   ├── views.json
│   ├── scenes.json
│   ├── paths.json
│   ├── animations.json
│   └── events.json
├── objects/
│   ├── references.json
│   └── embedded/
├── thumbnails/
├── exports/
├── revisions/
└── audit/
```

## 7. Linked and embedded modes

### Working mode

Default: linked objects.

Advantages:

- Smaller assembly package.
- Object revision can be updated.
- Repeated objects share one source package.

### Portable/share mode

Default: embedded copies.

Advantages:

- Package opens without external dependencies.
- Stable release snapshot.
- Suitable for download, archive, and handoff.

The package shall record for each object:

- source package ID
- source revision
- linked or embedded mode
- expected hash
- update availability
- local overrides

## 8. Immutable source rule

Original captures and source imports are immutable after import.

Edits create derived files under:

- `models/working`
- `textures/processed`
- `processing`
- `features`

The user may remove original source only through an explicit destructive action with warning and revision record.

## 9. Revision model

Recommended revision sequence:

- `R000` — original/imported baseline
- `R001...R999` — working revisions
- released revision with release status and timestamp

Each revision record includes:

```json
{
  "revision": "R003",
  "parentRevision": "R002",
  "createdAt": "2026-07-20T00:00:00Z",
  "createdBy": "ChatGPT",
  "reason": "Corrected outer diameter",
  "changedFiles": [],
  "validationStatus": "passed",
  "releaseStatus": "working"
}
```

## 10. Autosave and recovery

The browser workspace shall maintain:

- latest autosave pointer
- periodic recovery snapshots
- clean-shutdown marker
- interrupted-write marker
- recovery candidate list

Recovery data is not considered a formal revision until the user restores and saves it.

## 11. File naming

Rules:

- Stable IDs are used internally.
- Display names may be changed without breaking references.
- Export file names are sanitized.
- Duplicate names receive sequential suffixes: `Name`, `Name_001`, `Name_002`.
- Revision is included where appropriate: `Conveyor_Roller_R003.v3do`.

## 12. Integrity and compatibility

Each package shall support:

- SHA-256 file hash listing
- missing-file detection
- corrupted-file warning
- package version
- schema version
- migration status
- minimum application version
- optional maximum tested application version

Unknown optional fields shall be preserved where practical during load/save.

## 13. Large asset strategy

During active work, large assets may remain in OPFS or Google Drive and be referenced from project metadata.

Portable export shall offer:

1. `Metadata only`
2. `Linked package`
3. `Embed required assets`
4. `Full archive including sources`

GitHub shall not store large captures or production 3D binary assets by default.

## 14. Security and privacy

Packages shall not contain credentials, API keys, access tokens, or private connector secrets.

Internet texture metadata may include source URL and license, but imported image bytes shall be copied locally for offline reliability.

## 15. Mandatory save validations

Draft save:

- manifest valid
- unique package ID
- entry file exists
- required object structures exist

Released save:

- all mandatory engineering validation passed
- package integrity generated
- revision assigned
- no broken linked dependencies unless embedded
- no mandatory `unknown` or `pending` fields

## 16. Future-ready simulation folders

Even before animation exists, packages shall preserve:

```json
{
  "animations": [],
  "events": [],
  "paths": [],
  "relationships": [],
  "simulationTracks": []
}
```

## 17. Implementation acceptance criteria

Claude implementation shall eventually demonstrate:

1. Create and save a draft `.v3do`.
2. Reopen the package without data loss.
3. Create `.v3da` with two linked objects.
4. Export a portable assembly with embedded objects.
5. Detect a deliberately missing internal file.
6. Preserve unknown optional fields through load/save.
7. Generate unique duplicate names.
8. Restore from a recovery snapshot.
