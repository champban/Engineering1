# PROJECT_CONTEXT.md

Last updated: 2026-07-21
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Project manager / architecture / QA authority: ChatGPT
Implementation owner for the current Phase 1 vertical slice: ChatGPT

## Product vision

Engineering1 is an AI-native universal 2D/3D design, engineering, documentation, simulation, virtual-commissioning, and digital-twin platform.

The first product priority is not limited to production-equipment objects. The application must allow the user to capture or upload an image/video of any physical object, choose the target object, remove unrelated surroundings, generate a reusable 3D visual object, calibrate its physical dimensions, attach static engineering/procurement properties, and store it in a reusable Object Gallery for later assembly.

The first three implementation programs are:

1. **Phase 1A — AI Camera-to-Gallery**: image/video capture, object selection, environment removal, AI reconstruction, static properties, reusable gallery.
2. **Phase 1B — Mechanical Layout Assembly**: place Gallery objects in indoor-factory or outdoor-layout workspaces, position/rotate/elevate them, and add transport modules.
3. **Phase 1C — Transport Visual Runtime and OEE Alpha**: animate products across connected conveyor routes and calculate Availability, Performance, Quality, OEE, waste, and good output.

Later domain modules will support mechanical, industrial, HVAC/thermodynamic, process, electrical, automation, civil, architectural, landscape, and general consumer design workflows.

## Architecture

- React with TypeScript strict mode and Vite.
- Direct Three.js engineering viewport; native domain documents remain authoritative.
- Zod runtime validation for authoritative engineering records.
- Local-first persistence; current alpha uses browser storage while IndexedDB/Dexie and OPFS remain the production target.
- Versioned reusable Object Asset records separated from scene instances.
- Universal-object core with optional domain extensions.
- Editor and Runtime are separate workspaces.
- Feature Capability Registry controls available, experimental, planned, and disabled functions.
- Working functions use active colour. Planned or unavailable functions are grey and cannot be invoked.
- AI integrations are adapter-based and provider-neutral at the domain boundary.
- AI provider secrets remain server-side only.
- Netlify Functions are the approved server boundary for the Phase 1 AI prototype.

Coordinate and units:

- Right-handed coordinate system.
- X = primary length/left-right, Y = vertical, Z = depth/width.
- World floor = XZ plane at Y = 0.
- Internal length = mm; mass = kg; velocity = m/s.
- Domain angles stored in degrees.

## Key decisions

1. Every reusable Gallery item is an Engineering Object, not only a rendered mesh.
2. Camera-to-3D accepts arbitrary real-world objects, not only factory/process equipment.
3. The user selects the target object and excludes unrelated background/environment.
4. AI-generated geometry is initially a visual/draft object, not verified engineering CAD.
5. Manual dimension calibration is mandatory before Verified or Released status.
6. Original captures remain immutable; cleaned images, generated models, and revisions are separate derivatives.
7. Gallery assets are independent from scene instances and reusable across projects.
8. Static geometry/properties precede dynamic simulation, while schemas remain extension-ready.
9. HMI/SCADA and PLC features remain visible but disabled until their runtimes and security boundaries are implemented and verified.
10. GitHub is the source of truth for code, schemas, tests, configuration, and documentation.
11. Every deployable preview includes two or three ready-to-use demo objects.
12. Every downloadable deliverable must be accompanied by a direct file link in the same response.

## Branch and deployment discipline

- `Doc`: requirements, schemas, handoffs, QA reports, context, backlog.
- Feature branches: bounded implementation and preview candidates.
- `develop`: integration branch.
- `main`: production candidate only.

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

A GitHub commit is not a deployment. Production requires P'Boy approval. Do not auto-merge feature branches to `develop` or `main`, and do not publish production after every change.

## Current implementation state

### Phase 0 foundation

- Progress: 95%, pending final browser acceptance and integration discipline.
- Feature branch: `feature/PH0-foundation-scaffold`.
- Verified feature head: `1cef419590c5dd6d802041805952e13d375836cf`.
- Draft PR #1 targets `develop`.
- Merged to `develop`: No.
- Merged to `main`: No.
- Production deployed: No.

### Phase 1A–1C alpha vertical slice

- Current branch: `feature/phase1a-camera-gallery`.
- Base commit: `1cef419590c5dd6d802041805952e13d375836cf`.
- Current verified branch head: `71ddb67e0f0ceb6ea08277da96d28c931ad0783c`.
- Draft stacked PR: `#2` targeting `develop`.
- Merge dependency: PR #2 must not be merged before Phase 0 PR #1 is accepted and integrated.

Implemented on the feature branch:

#### Phase 1A

- Feature Capability Registry.
- Camera/Image/Video workspace.
- Image upload and representative video-frame extraction.
- Box selection and point-focus selection.
- Manual selected-region extraction fallback.
- Server-side AI segmentation and image-to-3D reconstruction adapters.
- AI queue polling and job-state display.
- Server-only AI secret handling and provider URL allowlisting.
- Calibratable visual 3D proxy.
- Lazy-loaded Three.js preview with orbit, pan/zoom, engineering-proportion proxy geometry, and generated GLB loading.
- GLB load failure/CORS fallback to calibrated proxy and rendered-image reference.
- Object name, category, tags, material, and physical dimensions.
- Gallery search, 3D inspector, duplication, deletion, Draft → Calibrated transition, and layout insertion.

#### Phase 1B

- Mechanical layout editor with X/Z world coordinates, elevation, rotation, and scale.
- Direct scene-object drag on the canvas.
- Snap grid toggle with 100, 250, 500, and 1000 mm increments.
- Scene-object duplication and deletion.
- Straight, curve, incline, decline, spiral, and buffer conveyor definitions.
- Conveyor sequence list with move-earlier, move-later, and delete actions.
- Entry/exit elevation and product-type compatibility checks between adjacent conveyors.
- Connected conveyor route rendering and automatic fit inside the engineering canvas.

#### Phase 1C

- Visual Runtime with Play, Pause, Reset, speed multiplier, and reverse direction.
- Individual-conveyor and continuous connected-line modes.
- Cookie pack, multipack, carton, and case transport definitions.
- Continuous product animation across multiple conveyor modules.
- Editable OEE inputs: planned minutes, downtime, ideal rate, total count, reject count.
- KPIs: Availability, Performance, Quality, OEE, Waste, and Good Count.
- Input clamping for impossible downtime/reject values.

Getting-started demo content:

- Cookie Single Pack — 95 × 55 × 15 mm.
- Gearmotor 0.75 kW — 420 × 260 × 280 mm.
- Landscape Tree Placeholder — 1800 × 1800 × 3500 mm.
- Demo Layout containing all three objects.
- Demo Straight, Curve, Spiral, and Buffer conveyors.
- Empty browser workspaces automatically receive the demo project.
- `Load demo project` restores the examples after modification or deletion.

AI prototype configuration:

- Provider boundary: fal.ai-compatible server functions.
- Segmentation adapter: `fal-ai/sam2/image`.
- Reconstruction adapter: `tripo3d/tripo/v2.5/image-to-3d`.
- Required server environment variable: `FAL_KEY`.
- When the server variable is absent, AI controls remain disabled while manual extraction and proxy creation remain available.
- Never place or commit the provider key in browser code, repository files, chat messages, or downloadable packages.

## Quality status

Local acceptance build:

- Dependency installation: Passed.
- TypeScript strict check: Passed.
- ESLint: Passed.
- Unit tests: 73/73 Passed across 11 test files.
- Production build: Passed.
- Build output: HTML 0.62 kB, CSS 17.37 kB, main JavaScript 236.58 kB, lazy Three.js preview chunk 588.90 kB before gzip.
- The large Three.js chunk is lazy-loaded; further renderer code splitting remains a performance backlog item.

Actual GitHub feature-branch verification:

- GitHub Actions Quality Gate run #71 on commit `71ddb67e0f0ceb6ea08277da96d28c931ad0783c`: Passed.
- Checkout: Passed.
- Locked dependency installation: Passed.
- TypeScript check: Passed.
- ESLint: Passed.
- Unit tests: Passed.
- Production build: Passed.

Verification limitations:

- P'Boy opened the earlier deployed static preview and confirmed the workspace shell rendered correctly.
- The latest demo, interactive Layout, connected Runtime, and OEE build still requires a new static upload and browser acceptance.
- AI segmentation and AI reconstruction are not yet verified against a real object because the isolated preview environment does not yet contain the required server variable.

## Netlify Phase 1 acceptance deployment

- Dedicated project: `engineering1-phase1-preview`.
- Site ID: `0f15372e-afba-4361-b170-800eb29ea5f5`.
- Dashboard: `https://app.netlify.com/projects/engineering1-phase1-preview`.
- URL: `https://engineering1-phase1-preview.netlify.app`.
- The preview project is isolated from production and from the Phase 0 acceptance site.
- Existing live deploy ID: `6a5ef317f8efcc78c652b2d0`, state `ready`.
- Existing live deploy predates the latest Layout/OEE increment.
- Latest static package: `Engineering1-Phase1-Layout-OEE-preview-dist.zip`.
- Latest static package SHA-256: `7c0e99283a9e1483a3e4eb6cc75510a74088deba6e24f6fcd43f5b181808c132`.
- Latest source/functions package: `Engineering1-Phase1-Layout-OEE-source.zip`.
- Latest source package SHA-256: `9e77111a03ccdbb12f6d5ef74d7accb4558d40cb3ba8970ab3742d63eac8c534`.
- Static drag-and-drop supports demo, Gallery, Layout, connected Runtime, and OEE acceptance.
- Live AI still requires a Functions-enabled source deployment and server-side environment configuration.

Current status vocabulary:

- Implemented: Yes, bounded Phase 1A–1C alpha including demo, interactive Layout, connected Runtime, and OEE/Waste.
- Tested locally: Yes.
- Tested on actual GitHub branch: Yes.
- Verified in an interactive browser: Partially; prior shell verified, latest workflow pending.
- AI provider verified with a real object: No.
- Merged to `develop`: No.
- Merged to `main`: No.
- Released: No.
- Deployed: Previous static acceptance build is live; latest build and Functions-enabled AI deployment are pending.

## Current gates and next work

### P0

1. Upload `Engineering1-Phase1-Layout-OEE-preview-dist.zip` to the dedicated Netlify project.
2. Verify the three demo Gallery objects and interactive Three.js review.
3. Verify Layout drag, snap, duplicate/delete, conveyor sequencing, and interface warnings.
4. Verify individual and connected-line Runtime modes.
5. Verify OEE/Waste calculations by changing downtime, total count, and rejects.
6. Connect the Netlify project to the feature branch for Functions-enabled builds.
7. Configure the AI provider key only in the isolated Netlify server environment.
8. Test AI segmentation, generated GLB loading, orbit review, scale calibration, and save-to-Gallery using a real object.
9. Verify provider-hosted GLB cross-origin loading; add a server proxy or object-storage adapter if required.

### P1

- Add robust multi-frame video selection and segmentation-mask correction.
- Replace browser-storage alpha with IndexedDB/Dexie and OPFS.
- Add revision management and Draft → Calibrated → Verified → Released workflow.
- Add object renaming, category management, folders, revision history, and Gallery import/export.
- Add scene-object grouping and assemblies.
- Add explicit conveyor connection handles and editable route topology.
- Add machine input/output ports, blocking, starving, accumulation, reject, and waste events.

### P2

- Add BOM, specifications, commercial/fabricated classification, documents, and procurement records.
- Add camera scale references and measurable calibration overlays.
- Add multi-view reconstruction and later mesh-to-parametric/BRep adapters.
- Add event-driven OEE history, downtime reasons, waste categories, Pareto analysis, and reporting.

## Progress reporting

Every meaningful report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes phase percentage, weighted overall percentage, branch, commit SHA, tests, issues, production status, and next owner/task.

`Total progress = Σ(phase weight × phase completion)`
