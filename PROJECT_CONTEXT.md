# PROJECT_CONTEXT.md

Last updated: 2026-07-21
Repository: `champban/Engineering1`
Project owner: P'Boy
Implementation / architecture / QA owner: ChatGPT

## Overview

Engineering1 is a browser-first, local-first engineering platform for camera-to-3D object capture, reusable engineering objects, mechanical layouts, transport simulation, OEE, equipment data, and professional 2D/3D object authoring.

Current bounded program: **Phase 2B — Object Studio 2.0 usability and interaction correction**.

## Architecture / tech stack

- React, TypeScript strict mode, Vite
- Direct Three.js viewport with OrbitControls and TransformControls
- Millimetres internally; X/Y/Z right-handed coordinates; XZ floor plane
- Gallery assets separated from scene instances
- Browser local persistence for alpha; IndexedDB/OPFS remain production backlog
- Netlify static acceptance packages and later Functions-enabled AI deployment

## Key decisions

1. Camera/view navigation and object editing are separate interaction modes.
2. Left click in Edit mode selects objects; it must not orbit the camera.
3. Middle-mouse drag or explicit Orbit View controls the camera; right-mouse drag or Pan View pans.
4. Object Rotate means model transformation only, never camera rotation.
5. Selection must work from both viewport and Outliner and remain visibly highlighted.
6. Camera Fit All uses actual world bounds and object positions; Fit Selected isolates the selected object.
7. Surface editing supports object-level and face-level material overrides where geometry allows.
8. Draft visual geometry is not verified engineering CAD.
9. Full SketchUp topology parity is not claimed until vertices, edges, faces, topology-aware Push/Pull, Offset, section planes, groups/components, and boolean solids are verified.
10. Every preview must include demo objects and every downloadable deliverable must include a direct link.

## Implemented in Object Studio 2.0

- Clearly separated Object Tools, 2D Sketch Tools, and View Navigation
- Reliable click selection with drag threshold, Outliner selection, selection outline, and double-click focus
- Move, Rotate, Scale transform gizmos
- Basic Push/Pull height editing
- Line, Rectangle, and Circle sketch creation on the ground plane
- Orbit View, Pan View, return-to-edit, Fit All, Fit Selected, standard views, and projection switching
- Searchable Outliner, visibility, lock, duplicate, and delete
- Collapsible side panels and viewport maximise mode
- Material presets, texture/skin upload, UV repeat/rotation/wrap, opacity, metalness, roughness
- Per-face material overrides for supported box-like geometry
- Tape measurement, stored measurements, scene lighting, grid snapping, undo/redo, local persistence, and JSON export

## Verification status

- Dependency audit: Passed, 0 vulnerabilities
- TypeScript strict: Passed locally
- ESLint: Passed locally
- Unit tests: 92/92 Passed locally across 13 files
- Production build: Passed locally
- Browser acceptance: Pending; local automated Chromium navigation was blocked by organization policy
- Merged to `develop`: No
- Merged to `main`: No
- Production deployed: No

## Open bugs / backlog

### P0

1. Deploy the Object Studio 2.0 static preview to the isolated Netlify acceptance project.
2. Verify viewport click selection, Outliner selection, camera navigation, object transforms, Fit All/Fit Selected, and panel maximise in a real browser.
3. Verify material and per-face skin editing with demo objects.
4. Synchronize the complete Object Studio 2.0 source increment to the feature branch and pass GitHub Actions.

### P1

- True face/edge/vertex topology model
- Topology-aware Push/Pull and Offset
- Groups, reusable components, nested assemblies, and isolation editing
- Boolean Union/Subtract/Intersect
- Section planes, construction guides, inference locking, and dimensions/annotations
- GLB mesh selection and editing beyond proxy geometry
- Code splitting for the current large editor JavaScript chunk

## Deploy discipline

`Edit → Test → Verify → Accumulate changes into a coherent batch → Commit → Review → Approve → Deploy`

Do not merge to `develop` or `main`, release, or deploy production without P'Boy's explicit approval. A GitHub commit is not a deployment. Static acceptance deploys must remain isolated from production.
