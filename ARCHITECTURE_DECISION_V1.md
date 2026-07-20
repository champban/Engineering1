# ARCHITECTURE DECISION V1

Status: Recommended and approved for Phase 0 scaffold
Owner: ChatGPT
Date: 2026-07-20

## 1. Decision summary

The initial application shall use a browser-first, offline-capable, modular frontend architecture with a direct Three.js engineering viewport, React/TypeScript application shell, local metadata in IndexedDB, large local assets in OPFS, runtime schema validation, and isolated adapters for future CAD, photogrammetry, cloud storage, and simulation engines.

## 2. Approved technology stack

### Application shell

- React with TypeScript strict mode.
- Vite using the official React TypeScript template.
- CSS Modules or scoped application CSS plus design tokens.
- No server-side rendering requirement for the engineering editor.

### 3D viewport

- Direct Three.js integration.
- `WebGLRenderer` as the Phase 1 renderer.
- Three.js addons for loaders and controls where appropriate.
- A renderer adapter shall permit a future WebGPU evaluation without coupling application state to renderer internals.

Decision: do not use React Three Fiber as the core engineering scene abstraction in Phase 1. React may own panels and commands, but the scene graph, selection, snapping, geometry handles, measurement overlays, and render loop shall be controlled by a dedicated imperative viewport service.

Reason: this is an editor/simulation application with long-lived scene objects, high-frequency interactions, direct raycasting, custom transform tools, and future worker/simulation synchronization.

### State and commands

- Application state shall be separated into:
  - project/document state
  - viewport interaction state
  - transient UI state
  - undoable engineering commands
- Use a small typed store abstraction. The first scaffold may use Zustand if pinned and wrapped behind project interfaces.
- All geometry-changing operations must execute through a command system supporting undo/redo and audit records.
- Scene objects shall not be the authoritative database; native object data is authoritative and scene objects are render representations.

### Runtime schema validation

- Zod for runtime validation of project, object, assembly, orientation, and dynamic-relationship schemas.
- TypeScript types shall be inferred or kept synchronized with schema definitions.
- Versioned migration interface from the first release.

### Local persistence

- Dexie over IndexedDB for searchable metadata, project indexes, revisions, task state, and lightweight JSON documents.
- OPFS for large binary data such as captures, videos, textures, meshes, generated packages, and recovery snapshots.
- Persistence accessed only through repository interfaces, not directly from UI components.
- Explicit export/import remains mandatory because browser storage can be cleared by the user or browser policy.

### Package creation

- ZIP-compatible native packages.
- `fflate` or an equivalent lightweight ZIP library selected and pinned during scaffold.
- Hashing through Web Crypto SHA-256.
- Package operations should support streaming or chunked processing where feasible.

### Testing

- Vitest for unit and service-level tests.
- Vitest browser mode for browser-specific components where practical.
- Playwright for end-to-end workflows and multi-browser acceptance.
- Fixture-based tests for cookie, motor, belt, support platform, object package, and assembly package.
- Build validation on every integration candidate.

### Deployment

- GitHub is the source of truth.
- Netlify connects to GitHub.
- Feature branches use pull-request deploy previews.
- `develop` uses an integration branch deployment.
- `main` is production candidate only.
- Production publish remains locked until P'Boy approval.

## 3. High-level module architecture

```text
src/
├── app/
│   ├── routing/
│   ├── layout/
│   └── providers/
├── domain/
│   ├── objects/
│   ├── orientation/
│   ├── assemblies/
│   ├── relationships/
│   ├── measurements/
│   ├── materials/
│   ├── geometry/
│   └── validation/
├── commands/
│   ├── command-bus/
│   ├── undo-redo/
│   └── audit/
├── viewport/
│   ├── renderer/
│   ├── scene-adapter/
│   ├── selection/
│   ├── transforms/
│   ├── grid/
│   ├── snapping/
│   ├── measurement-overlay/
│   ├── camera/
│   └── interaction/
├── persistence/
│   ├── indexeddb/
│   ├── opfs/
│   ├── packages/
│   ├── recovery/
│   └── migrations/
├── processing/
│   ├── workers/
│   ├── importers/
│   ├── exporters/
│   └── adapters/
├── simulation/
│   ├── relationships/
│   ├── paths/
│   ├── calculations/
│   └── states/
├── features/
│   ├── project-manager/
│   ├── object-editor/
│   ├── material-studio/
│   ├── measurement/
│   ├── object-library/
│   └── assembly-editor/
├── ui/
│   ├── components/
│   ├── panels/
│   └── design-system/
└── test/
    ├── fixtures/
    ├── unit/
    ├── browser/
    └── e2e/
```

## 4. Domain authority rule

The authoritative data flow is:

```text
Native domain document
→ validated command
→ updated document state
→ viewport adapter update
→ render scene
```

Prohibited architecture:

```text
User changes Three.js mesh directly
→ application attempts to infer engineering data later
```

Every geometry edit must update engineering parameters, feature history, revision state, and render representation through one command.

## 5. Viewport lifecycle

The viewport service owns:

- renderer
- scene
- cameras
- render loop
- raycasting
- selection highlights
- transform gizmos
- grid and snapping visuals
- measurement overlays
- object render adapters

React owns:

- application navigation
- panels
- property forms
- toolbars
- task dialogs
- project state presentation
- error boundaries

React unmounting a panel must not destroy scene state.

## 6. Coordinate and unit convention

Internal engineering length unit: millimetres.

- X: primary length / left-right axis.
- Y: vertical axis.
- Z: depth/width axis.
- Right-handed coordinate system.
- World floor: XZ plane at Y = 0.
- Angles stored in degrees in documents and converted to radians only at rendering/calculation boundaries where required.
- Mass normalized internally to kilograms.
- Velocity normalized to metres per second.
- Angular velocity normalized to radians per second internally, with RPM supported in engineering UI.

## 7. Persistence boundaries

### IndexedDB/Dexie

Store:

- project index
- object metadata
- revision metadata
- recent projects
- preferences
- validation results
- lightweight scene documents
- asset index

### OPFS

Store:

- photos and videos
- point clouds
- meshes
- GLB/STL/STEP files
- source and processed textures
- native package bytes
- autosave/recovery snapshots

### Portable package

The package exporter reads the validated domain documents and referenced OPFS assets, then creates `.v3dproject`, `.v3do`, or `.v3da` according to `NATIVE_PACKAGE_SPEC_V1.md`.

## 8. Worker boundary

CPU-intensive work shall run outside the main UI thread where browser-compatible:

- image frame analysis
- geometry statistics
- mesh simplification adapters
- hashing
- ZIP packaging
- large-file parsing
- calculation batches

Photogrammetry reconstruction and heavy STEP/BRep conversion shall use an adapter interface because they may require:

- local native worker
- dedicated backend
- cloud GPU service
- WebAssembly implementation

The frontend shall not assume which execution environment is used.

## 9. CAD and mesh boundary

Three.js is the rendering and interaction layer, not the complete CAD kernel.

Geometry layers:

1. Parametric feature document.
2. Optional BRep/CAD representation.
3. Engineering render mesh.
4. Web/mobile optimized mesh.

Future OpenCascade.js or backend CAD service shall be introduced through `CadKernelAdapter`. Core schemas shall not expose library-specific objects.

## 10. Simulation boundary

Initial phases store relationship, path, state, pivot, orientation, and load data.

Future simulation shall use a deterministic engine independent of frame rate:

```text
Simulation clock
→ engineering calculations/state transitions
→ domain state snapshot
→ viewport interpolation/rendering
```

Visual animation must not be the source of engineering truth.

## 11. Security requirements

- No API keys in repository or package files.
- Validate all imported JSON before use.
- Restrict imported URL schemes.
- Treat external file names and metadata as untrusted input.
- Sanitize exported names.
- Limit decompressed package sizes and file counts to reduce ZIP bomb risk.
- Use Content Security Policy appropriate for Netlify deployment.
- Avoid dynamic code execution from project files.
- Internet image import must copy bytes into project storage and record source/license metadata.

## 12. Performance requirements

Initial targets:

- UI remains responsive during file and geometry operations.
- Main-thread blocking operations longer than 50 ms should be identified and moved to workers when practical.
- Object library uses thumbnails and lazy loading.
- Large assemblies use LOD and visibility culling later.
- Render loop may pause or lower frequency when the scene is unchanged.
- Changes to properties should update only affected render nodes.

## 13. Browser support

Priority:

1. Current Chromium desktop.
2. Current iPhone Safari for viewer and practical editing subsets.
3. Current Firefox desktop.

The scaffold shall include capability detection for:

- WebGL support
- OPFS availability
- IndexedDB availability
- Web Workers
- Web Crypto

Fallback behavior:

- OPFS unavailable: use IndexedDB Blob storage for limited-size projects and show a capability warning.
- WebGL unavailable: block 3D workspace with a clear error.

## 14. Phase 0 scaffold deliverables

Claude shall create only:

- React/TypeScript/Vite scaffold.
- Approved directory structure.
- Domain schema modules.
- Zod validators.
- Dexie database shell.
- OPFS capability service shell.
- Three.js viewport shell with empty scene and lifecycle cleanup.
- Unit-test and end-to-end-test configuration.
- Four valid fixtures and several invalid fixtures.
- No production deployment.

## 15. Explicitly deferred

Not part of the scaffold:

- full grid and snapping
- geometry creation
- push/pull
- photogrammetry
- materials editor
- measurement
- assembly tools
- dynamic simulation
- animation timeline
- OEE

## 16. Acceptance gates

The scaffold is accepted only when:

- TypeScript strict build passes.
- Unit tests pass.
- Runtime validators reject all defined invalid fixtures.
- Empty viewport mounts and unmounts without leaking listeners or animation frames.
- Persistence services pass capability and basic metadata tests.
- No schema fields are renamed or removed.
- No production deployment occurs.
