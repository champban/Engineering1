# PROJECT_CONTEXT.md

Last updated: 2026-07-21
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Implementation / architecture / QA owner: ChatGPT

## Product vision

Engineering1 is an AI-native universal 2D/3D engineering, documentation, simulation, virtual-commissioning, and digital-twin platform. It must support arbitrary physical objects, not only factory equipment.

Current programs:

1. Phase 0 — Foundation and architecture.
2. Phase 1A — Camera/Image/Video to reusable 3D Object Gallery.
3. Phase 1B — Mechanical Layout Assembly.
4. Phase 1C — Connected Transport Runtime and OEE/Waste alpha.
5. Phase 2A — Equipment Engineering Data, BOM, utilities, procurement, cost, and controlled documents.

## Architecture and key rules

- React, TypeScript strict mode, Vite, and direct Three.js viewport.
- Right-handed coordinates: X length/left-right, Y vertical, Z depth/width; floor is XZ at Y = 0.
- Internal length mm, mass kg, velocity m/s, angles degrees.
- Reusable Gallery assets are separate from scene instances.
- Local-first alpha storage; IndexedDB/Dexie and OPFS remain the production target.
- Feature registry controls Available, Experimental, Planned, and Disabled states.
- AI-generated geometry starts as Draft visual geometry, not verified CAD.
- Manual dimensional calibration is mandatory before Verified or Released status.
- Engineering-data completeness never implies formal safety, food-contact, electrical, technical, or release approval.
- GitHub is the source of truth.
- Every preview includes two or three demo objects.
- Every downloadable deliverable must include a direct file link.

## Branch and deployment discipline

- `Doc`: context, decisions, QA, handoffs, and backlog.
- Feature branches: bounded implementation and acceptance candidates.
- `develop`: integration only after acceptance.
- `main`: production candidate only.

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

Do not merge to `develop` or `main`, release, or deploy production without P'Boy's explicit approval.

## Current implementation

### Phase 0

- Branch: `feature/PH0-foundation-scaffold`.
- Verified head: `1cef419590c5dd6d802041805952e13d375836cf`.
- Draft PR #1 targets `develop`.
- Progress: approximately 95%.
- Merged / released / production deployed: No.

### Phase 1A–1C

- Branch: `feature/phase1a-camera-gallery`.
- Verified head: `71ddb67e0f0ceb6ea08277da96d28c931ad0783c`.
- Draft PR #2 targets `develop` and depends on PR #1.

Implemented:

- Image/video upload, frame extraction, box/point selection, and manual extraction.
- Server-side AI segmentation and image-to-3D adapters with secret isolation.
- Calibrated proxy and Three.js/GLB review.
- Gallery lifecycle, search, duplicate, delete, calibrate, and layout insertion.
- Layout drag, X/Z/elevation/rotation/scale, snap grids, duplicate/delete.
- Straight, curve, incline, decline, spiral, and buffer conveyors.
- Conveyor sequencing and elevation/product-type compatibility checks.
- Individual and connected-line product animation.
- OEE inputs and Availability, Performance, Quality, OEE, Waste, Good Count.

Demo objects:

- Cookie Single Pack — 95 × 55 × 15 mm.
- Gearmotor 0.75 kW — 420 × 260 × 280 mm.
- Landscape Tree Placeholder — 1800 × 1800 × 3500 mm.

Quality:

- Local TypeScript, ESLint, 73/73 tests, and build: Passed before Phase 2 branch creation.
- GitHub Actions Quality Gate #71: Passed.
- Interactive verification: partial; latest Layout/OEE build still requires acceptance.
- AI real-object verification: pending server-side preview configuration.

### Phase 2A — Equipment Engineering Data

- Branch: `feature/phase2-equipment-engineering`.
- Base: Phase 1 verified head `71ddb67e0f0ceb6ea08277da96d28c931ad0783c`.
- Verified head: `516a627c51886e4cd2f20a5c12d94018175af235`.
- Draft PR #3 targets `develop`.
- PR #3 must not merge before PR #1 and PR #2 are accepted and integrated.

Implemented:

- Versioned engineering-record schema for equipment, product formats, infrastructure, and generic objects.
- Tag, manufacturer, model, serial number, supplier, and procurement state.
- Design rate, installed power, voltage, phases, frequency, and air demand.
- Purchase cost, currency, and lead time.
- Utility hook-up register.
- BOM with part number, quantity, manufacturer, supplier, criticality, spare flag, unit cost, and currency.
- Multi-currency BOM summary.
- Controlled document register with type, revision, status, and reference URL.
- Completeness/readiness calculation without claiming formal approval.
- Browser persistence and JSON export.
- Phase 2A application shell accessible from Phase 1.
- Three demo records linked to the Cookie, Gearmotor, and Tree assets.

Quality:

- Local TypeScript strict check: Passed.
- Local ESLint: Passed.
- Local tests: 76/76 Passed across 11 files.
- Local production build: Passed.
- Build: HTML 0.62 kB, CSS 21.67 kB, main JS 276.06 kB, lazy Three.js chunk 588.90 kB before gzip.
- GitHub Actions Quality Gate #78: Passed.
- Checkout, locked install, typecheck, lint, tests, and build: Passed.
- Interactive browser verification: Pending.
- Merged / released / deployed: No.

## Netlify acceptance environment

- Project: `engineering1-phase1-preview`.
- Site ID: `0f15372e-afba-4361-b170-800eb29ea5f5`.
- URL: `https://engineering1-phase1-preview.netlify.app`.
- Existing deploy ID: `6a5ef317f8efcc78c652b2d0`, state ready.
- Existing live build predates the latest Layout/OEE and Phase 2A increments.
- Live AI still requires a source/functions deployment and a server-only provider variable.

## Current gates

1. Package and upload the Phase 2A static acceptance build.
2. Verify demo engineering records and Overview, Utilities, BOM & Cost, Documents, persistence, completeness, and JSON export.
3. Verify latest Phase 1 Gallery, Layout, connected Runtime, and OEE in the same build.
4. Connect the isolated Netlify project to source for Functions-enabled builds.
5. Configure the AI provider only in the Netlify server environment.
6. Test real-object segmentation, reconstruction, GLB review, calibration, and Gallery save.

## Next backlog

- Phase 2B machine behavior: input/output ports, nominal/constrained rates, states, blocking, starving, accumulation, reject, and waste events.
- Revision history and Draft → Calibrated → Verified → Released workflow.
- IndexedDB/Dexie and OPFS.
- OEE event history, downtime reasons, waste categories, Pareto, and reports.
- Maintenance, recommended spares, PM strategy, and lifecycle cost.
- Process, thermal, electrical, HMI/SCADA, PLC simulation, and virtual commissioning under verified safety/security boundaries.

## Reporting

Every report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes branch, commit, tests, issues, production status, and next task.
