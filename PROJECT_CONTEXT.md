# PROJECT_CONTEXT.md

Last updated: 2026-07-21
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Implementation / architecture / QA owner: ChatGPT

## Product vision

Engineering1 is an AI-native universal 2D/3D engineering, documentation, simulation, virtual-commissioning, and digital-twin platform for arbitrary physical objects and production systems.

Current programs:

1. Phase 0 — Foundation and architecture.
2. Phase 1A — Camera/Image/Video to reusable 3D Object Gallery.
3. Phase 1B — Mechanical Layout Assembly.
4. Phase 1C — Connected Transport Runtime and OEE/Waste alpha.
5. Phase 2A — Equipment Engineering Data, BOM, utilities, procurement, cost, and controlled documents.
6. Phase 2B — Professional Object Studio.

## Architecture and permanent rules

- React, TypeScript strict mode, Vite, and direct Three.js viewport.
- Right-handed coordinates: X length, Y vertical, Z width/depth; floor is XZ at Y = 0.
- Internal length mm, mass kg, velocity m/s, angles degrees.
- Gallery assets, scene instances, and Studio documents are separate records.
- Local-first alpha storage; IndexedDB/Dexie and OPFS remain the production target.
- Available functions use active colour; incomplete functions remain grey and disabled.
- AI-generated geometry begins as Draft visual geometry, not verified CAD.
- GitHub is the source of truth.
- Every preview includes ready-to-use demo objects.
- Every downloadable deliverable is accompanied by a direct file link.
- Do not claim SketchUp parity until face topology, editable edges/vertices, Push/Pull, Offset, UV seam editing, section planes, and boolean solids are implemented and verified.

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
- Progress approximately 95%; unmerged and unreleased.

### Phase 1A–1C

- Branch: `feature/phase1a-camera-gallery`.
- Verified head: `71ddb67e0f0ceb6ea08277da96d28c931ad0783c`.
- Draft PR #2 targets `develop` and depends on PR #1.
- Image/video capture, selection, manual extraction, AI adapters, calibrated proxy, GLB review, reusable Gallery, interactive Layout, connected conveyors, product animation, and OEE/Waste alpha are implemented.
- Demo objects: Cookie Single Pack, Gearmotor 0.75 kW, and Landscape Tree Placeholder.
- Quality Gate #71 passed; latest browser workflow acceptance is still pending.

### Phase 2A–2B

- Branch: `feature/phase2-equipment-engineering`.
- Current verified head: `6094d6e69f3b0278b5397980bb91b082a06a1dfc`.
- Draft PR #3 targets `develop` and must wait for PR #1 and PR #2.

Phase 2A includes structured identification, capacity, utility, procurement, cost, BOM, spare classification, controlled documents, completeness checks, browser persistence, JSON export, and three demo engineering records.

Phase 2B Object Studio includes:

- Full-screen Three.js engineering viewport.
- Object Outliner, selection, visibility, and lock state.
- Move, rotate, and scale transform gizmos.
- Orbit and pan navigation.
- Box, cylinder, sphere, and plane creation.
- Millimetre dimensions, position, rotation, scale, and snap grids from 10 to 1000 mm.
- Perspective and orthographic projection with isometric, front, right, and top views.
- Engineering and packaging material presets.
- Colour, metalness, roughness, opacity, texture upload, repeat U/V, rotation, and wrapping.
- Studio, Sunlight, Warehouse, and Inspection lighting presets.
- Two-point measuring with stored measurements.
- Undo/Redo, local persistence, JSON export, and Gallery dimension/material synchronization.
- Three Gallery demo objects populate the initial Studio document.

Limitations:

- Current alpha edits whole objects and whole-object materials.
- Face/edge/vertex editing, Push/Pull, Offset, UV seams, section planes, and boolean solids are planned and disabled.
- Browser acceptance is pending.

Quality:

- GitHub Actions Quality Gate #116: Passed.
- Locked installation, TypeScript, ESLint, unit tests, production build, preview packaging, and source packaging passed.
- Preview SHA-256: `b042288b8b43a8b5e16b0cc181a54fc16f01ab6bf30a90c68fbe50520fe6da7a`.
- Source SHA-256: `4bebb63155c6c5e1d34bf9bb8e22fe3444f210450916c4b879bab5457a51c7db`.
- Merged, released, deployed: No.

## Netlify acceptance environment

- Project: `engineering1-phase1-preview`.
- Site ID: `0f15372e-afba-4361-b170-800eb29ea5f5`.
- URL: `https://engineering1-phase1-preview.netlify.app`.
- Existing live deployment predates Object Studio.
- Latest static package: `Engineering1-Object-Studio-preview-dist.zip`.
- Latest source package: `Engineering1-Object-Studio-source.zip`.

## Current gates

1. Upload the Object Studio preview to the dedicated Netlify project.
2. Verify large viewport rendering and the three demo objects.
3. Verify transforms, primitives, dimensions, snapping, materials, textures, lighting, measuring, camera modes, persistence, export, and Gallery synchronization.
4. Complete the later topology milestone before claiming SketchUp-level modelling parity.

## Next backlog

- Face/edge/vertex selection, Push/Pull, Offset, section planes, boolean solids, UV seam editor, face-specific materials, grouping, and components.
- Machine behavior: input/output ports, rates, blocking, starving, accumulation, reject, and waste events.
- Revision history and Draft → Calibrated → Verified → Released workflow.
- IndexedDB/Dexie and OPFS.
- OEE event history, downtime reasons, waste categories, Pareto, and reports.

## Reporting

Every report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes branch, commit, tests, issues, production status, and next task.
