# PROJECT_CONTEXT.md

Last updated: 2026-07-21
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Project manager / architecture / QA authority: ChatGPT
Implementation owner for the current Phase 1 vertical slice: ChatGPT

## Product vision

Engineering1 is an AI-native universal 2D/3D design, engineering, documentation, simulation, virtual-commissioning, and digital-twin platform.

The first product priority is no longer limited to production-equipment objects. The application must allow the user to capture or upload an image/video of any physical object, choose the target object, remove unrelated surroundings, generate a reusable 3D visual object, calibrate its physical dimensions, attach static engineering/procurement properties, and store it in a reusable Object Gallery for later assembly.

The first three implementation programs are:

1. **Phase 1A — AI Camera-to-Gallery**: image/video capture, object selection, environment removal, AI reconstruction, static properties, reusable gallery.
2. **Phase 1B — Mechanical Layout Assembly**: place Gallery objects in an indoor-factory or outdoor-layout workspace, position/rotate/elevate them, and add transport modules.
3. **Phase 1C — Transport Visual Runtime**: animate cookie packs, multipacks, cartons, or cases on straight, curved, incline, decline, spiral, and buffering conveyor paths.

Later domain modules will support mechanical, industrial, HVAC/thermodynamic, process, electrical, automation, civil, architectural, landscape, and general consumer design workflows.

## Architecture

- React with TypeScript strict mode and Vite.
- Direct Three.js engineering viewport remains the target 3D renderer; native domain documents are authoritative.
- Zod runtime validation for authoritative engineering records.
- Local-first persistence; current Phase 1 alpha uses browser storage while IndexedDB/Dexie and OPFS remain the approved production target.
- Versioned reusable Object Asset records separated from scene instances.
- Universal-object core with optional domain extensions.
- Editor and Runtime are separate workspaces.
- Visual Engineering and future HMI/SCADA are separate workspaces.
- Feature Capability Registry controls whether a function is available, experimental, planned, or disabled.
- Working functions use active colour. Planned or unavailable functions are grey and cannot be invoked.
- AI integrations are adapter-based and provider-neutral at the domain boundary.
- AI provider secrets remain server-side only.
- Netlify Functions are the current approved server boundary for the Phase 1 AI prototype.

Coordinate and units:

- Right-handed coordinate system.
- X = primary length/left-right, Y = vertical, Z = depth/width.
- World floor = XZ plane at Y = 0.
- Internal length = mm; mass = kg; velocity = m/s.
- Domain angles stored in degrees.

## Key decisions

1. Every reusable Gallery item is an Engineering Object, not only a rendered mesh.
2. Camera-to-3D must accept arbitrary real-world objects, not only factory/process equipment.
3. The user must be able to select the target object and exclude unrelated environment/background.
4. AI-generated geometry is initially classified as a visual/draft object, not automatically verified engineering CAD.
5. Manual dimension calibration is mandatory before an object can progress toward Verified or Released status.
6. Original captures remain immutable; cleaned images, generated models, and later engineering revisions are separate derivatives.
7. Gallery assets are independent from scene instances so one asset may be reused in many assemblies and projects.
8. Static geometry/properties come before dynamic simulation, but schemas remain extension-ready for sensors, I/O, controls, process, thermal, structural, and digital-twin modules.
9. HMI/SCADA and PLC features remain visible but disabled until their runtimes and safety/security boundaries are implemented and verified.
10. GitHub is the source of truth for code, schemas, tests, configuration, and documentation.

## Branch and deployment discipline

- `Doc`: requirements, schemas, handoffs, QA reports, context, backlog.
- Feature branches: bounded implementation and preview candidates.
- `develop`: integration branch.
- `main`: production candidate only.

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

A GitHub commit is not a deployment. Production requires P'Boy approval. Do not auto-merge feature branches to `main` and do not publish production after every change.

## Current implementation state

### Phase 0 foundation

- Phase 0 progress remains 95% pending browser acceptance.
- Existing feature branch: `feature/PH0-foundation-scaffold`.
- Verified Phase 0 feature head: `1cef419590c5dd6d802041805952e13d375836cf`.
- Draft PR #1 targets `develop`.
- Merged to `develop`: No.
- Merged to `main`: No.
- Production deployed: No.

### Phase 1A–1C alpha vertical slice

Current branch: `feature/phase1a-camera-gallery`
Base commit: `1cef419590c5dd6d802041805952e13d375836cf`
Feature commit: `f975a998b7ae9cc8a0969ae83fefb937e5579777`
Current branch head: `f5796653e3f65db166f8ed489eb8b8206fabd4e4`
Draft stacked PR: `#2` targeting `develop`
Merge dependency: PR #2 must not be merged before Phase 0 PR #1 is accepted and integrated.

Implemented on the feature branch:

- Feature Capability Registry.
- Camera/Image/Video workspace.
- Image upload and representative video-frame extraction.
- Box selection and point-focus selection.
- Manual selected-region extraction fallback.
- Server-side AI segmentation adapter.
- Server-side AI image-to-3D reconstruction adapter.
- AI queue polling and job-state display.
- Server-only AI secret handling and provider URL allowlisting.
- Calibratable visual 3D proxy.
- Lazy-loaded direct Three.js preview with orbit, pan/zoom controls, engineering-proportion proxy geometry, and generated GLB loading.
- GLB load failure/CORS fallback to a calibrated proxy and rendered-image reference.
- Object name, category, tags, material, and physical dimensions.
- Reusable Object Gallery with search.
- Gallery 3D inspector, asset duplication, deletion, and Draft → Calibrated transition.
- Gallery-to-layout insertion.
- Mechanical layout alpha with X/Z position, elevation, and rotation.
- Straight, curve, incline, decline, spiral, and buffer conveyor definitions.
- Direction, speed, length, width, and elevation properties.
- Transport Visual Runtime with Play/Pause/Reset and speed multiplier.
- Cookie-pack/carton/case transport animation and reverse direction.
- Planned HMI/SCADA and PLC workspaces displayed grey and disabled.
- Netlify Functions and redirects for AI capability, segmentation, reconstruction, and job status.
- Unit tests for Gallery records, capability states, transport paths, lifecycle helpers, and 3D preview proportion normalization.

AI prototype configuration:

- Provider boundary: fal.ai-compatible server functions.
- Segmentation adapter target: `fal-ai/sam2/image`.
- Reconstruction adapter target: `tripo3d/tripo/v2.5/image-to-3d`.
- Required server environment variable: `FAL_KEY`.
- When `FAL_KEY` is absent, AI controls remain disabled/grey while manual extraction and proxy creation remain available.
- Never place or commit `FAL_KEY` in browser code, repository files, chat messages, or downloadable packages.

## Quality status

Local implementation verification completed in the working runtime:

- `npm ci`: Passed.
- Dependency audit: 0 reported vulnerabilities.
- TypeScript strict check: Passed.
- ESLint: Passed.
- Unit tests: 61/61 Passed.
- Production build: Passed.
- Production build uses code splitting: main application JavaScript 223.47 kB and lazy Three.js preview chunk 588.90 kB before gzip.

Actual GitHub feature-branch verification:

- GitHub Actions Quality Gate run #26 on commit `f5796653e3f65db166f8ed489eb8b8206fabd4e4`: Passed.
- Checkout: Passed.
- Locked dependency installation: Passed.
- TypeScript check: Passed.
- ESLint: Passed.
- Unit tests: Passed.
- Production build: Passed.

Important verification limitation:

- P'Boy opened the deployed static preview successfully and confirmed the Phase 1 workspace shell rendered correctly. Full end-to-end object capture, Gallery, layout, and runtime acceptance remains pending.
- AI segmentation and AI reconstruction are not yet verified against a real object because the isolated preview environment does not yet contain `FAL_KEY`.

## Netlify Phase 1 acceptance deployment

- Dedicated preview project approved and created: `engineering1-phase1-preview`.
- Site ID: `0f15372e-afba-4361-b170-800eb29ea5f5`.
- Dashboard: `https://app.netlify.com/projects/engineering1-phase1-preview`.
- Reserved URL: `https://engineering1-phase1-preview.netlify.app`.
- The preview project is isolated from production and from the Phase 0 acceptance site.
- Static preview deployment is live and Netlify reports deploy state `ready`.
- Current live static deploy ID: `6a5ef317f8efcc78c652b2d0`.
- P'Boy opened the site and verified the workspace shell visually.
- The live static deploy does not include Netlify Functions or live AI because the project is not yet connected to the feature branch and `FAL_KEY` is not configured.
- Static preview package: `Engineering1-Phase1A-1C-preview-dist.zip`.
- Static preview SHA-256: `846365dab348a3e1772b61055c6a80dee2da645f9972037d599c3a6d4f20f96c`.
- Full source/functions package: `Engineering1-Phase1A-1C-source.zip`.
- Full source SHA-256: `37b18c092980f4e3acfa8c401184ea2348047be25f97294f861fd2c4867af40f`.
- The static package supports browser acceptance of the UI/manual fallback, but live AI requires a Functions-enabled source deployment and server-side `FAL_KEY`.

Current status vocabulary:

- Implemented: Yes, bounded Phase 1A–1C alpha vertical slice.
- Tested locally: Yes, typecheck/lint/unit/build.
- Tested on actual GitHub branch: Yes, Quality Gate passed.
- Verified in an interactive browser: Partially; live shell verified, full workflow pending.
- AI provider verified with a real object: No, pending.
- Merged to `develop`: No.
- Merged to `main`: No.
- Released: No.
- Deployed: Static acceptance preview is live; Functions-enabled AI deployment is pending.

## Current gates and next work

### P0

1. Perform full real-browser acceptance for upload, selection, manual environment removal, 3D proxy review, Gallery save/duplicate/delete/calibrate, layout insertion, and conveyor Runtime.
2. Connect the Netlify project to `feature/phase1a-camera-gallery` so Functions are built from source.
3. Configure `FAL_KEY` only in the isolated preview site's server environment.
4. Test AI segmentation, generated GLB loading, orbit review, scale calibration, and save-to-Gallery using a real object.
5. Verify cross-origin loading for provider-hosted GLB assets; use a server proxy or object storage adapter if direct CORS fails.

### P1

- Add robust multi-frame video selection and user correction of segmentation masks.
- Replace alpha browser storage with IndexedDB/Dexie and OPFS.
- Add revision management and Draft → Calibrated → Verified → Released workflow.
- Add object renaming, category management, folders, revision history, and Gallery import/export.
- Add proper scene-object grouping and assemblies.
- Add conveyor connectors and multi-conveyor path continuity.

### P2

- Add BOM, specification, commercial/fabricated classification, documents, and procurement records.
- Add camera scale references and measurable calibration overlays.
- Add multi-view reconstruction and later mesh-to-parametric/BRep adapters.

## Progress reporting

Every meaningful report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes phase percentage, weighted overall percentage, branch, commit SHA, tests, issues, production status, and next owner/task.

`Total progress = Σ(phase weight × phase completion)`