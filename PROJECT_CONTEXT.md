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
Current branch head / CI-trigger commit: `685e4dd67cba2f0efc0adeaf525b62183afa1ea2`

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
- Object name, category, tags, material, and physical dimensions.
- Reusable Object Gallery with search.
- Gallery-to-layout insertion.
- Mechanical layout alpha with X/Z position, elevation, and rotation.
- Straight, curve, incline, decline, spiral, and buffer conveyor definitions.
- Direction, speed, length, width, and elevation properties.
- Transport Visual Runtime with Play/Pause/Reset and speed multiplier.
- Cookie-pack/carton/case transport animation and reverse direction.
- Planned HMI/SCADA and PLC workspaces displayed grey and disabled.
- Netlify Functions and redirects for AI capability, segmentation, reconstruction, and job status.
- Unit tests for Gallery records, capability states, and transport paths.

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
- Unit tests in the reconstructed local baseline: 58/58 Passed, including nine new Phase 1 tests.
- Production build: Passed.
- Build output: HTML 0.62 kB, CSS 13.25 kB, JavaScript 220.07 kB.

Important verification limitation:

- The repository feature branch includes the newer Phase 0 QA test set, so the expected GitHub branch total is higher than the reconstructed local baseline. GitHub Actions verification on the actual branch remains pending.
- A headless-browser screenshot/smoke attempt hung in the current runtime. Browser interaction is therefore not yet marked Verified.

Current status vocabulary:

- Implemented: Yes, bounded Phase 1A–1C alpha vertical slice.
- Tested locally: Yes, typecheck/lint/unit/build.
- Verified in an interactive browser: No, pending.
- Merged to `develop`: No.
- Merged to `main`: No.
- Released: No.
- Deployed: No.

## Current gates and next work

### P0

1. Run GitHub Actions against the actual Phase 1 feature branch and resolve any repository-baseline failures.
2. Perform real-browser acceptance for upload, selection, manual environment removal, Gallery save, layout insertion, and conveyor Runtime.
3. Configure `FAL_KEY` only in the isolated preview site's server environment.
4. Deploy the feature branch to an isolated Netlify acceptance site with Functions enabled.
5. Test AI segmentation and AI reconstruction with a real object.

### P1

- Add robust multi-frame video selection and user correction of segmentation masks.
- Add actual GLB rendering in the engineering viewport instead of linking only to the generated model.
- Replace alpha browser storage with IndexedDB/Dexie and OPFS.
- Add revision management and Draft → Calibrated → Verified → Released workflow.
- Add object deletion, renaming, duplication, categories, folders, and gallery import/export.
- Add proper scene-object grouping and assemblies.
- Add conveyor connectors and multi-conveyor path continuity.

### P2

- Add BOM, specification, commercial/fabricated classification, documents, and procurement records.
- Add camera scale references and measurable calibration overlays.
- Add multi-view reconstruction and later mesh-to-parametric/BRep adapters.

## Progress reporting

Every meaningful report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes phase percentage, weighted overall percentage, branch, commit SHA, tests, issues, production status, and next owner/task.

`Total progress = Σ(phase weight × phase completion)`
