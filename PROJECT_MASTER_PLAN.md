# PROJECT MASTER PLAN — 3D Engineering Object & Simulation Platform

Last updated: 2026-07-20
Project owner: P'Boy
Project manager / system authority: ChatGPT
Implementation engineer: Claude Pro
Repository: `champban/Engineering1`
Documentation branch: `Doc`

## 1. Project objective

Build a professional browser-based 3D engineering platform that can:

- Create 3D objects from camera captures, imported models, and parametric standard shapes.
- Edit geometry using grid, snapping, numeric dimensions, 2D sketch, push/pull, grouping, joining, and surface tools.
- Apply materials, textures, decals, and images imported locally or from internet sources.
- Measure dimensions directly in the 3D viewer.
- Save reusable objects, modules, assemblies, and future animation-ready data.
- Track mandatory engineering properties including shape, dimensions, diameter where applicable, surface, material, and mass.
- Preserve product orientation as a first-class property.
- Later support dynamic engineering simulation, product transport, loading warnings, animation, OEE, waste, and performance analysis.

## 2. Team model

### P'Boy — Founder / Product Owner

P'Boy performs only work that AI cannot reliably perform:

- Decide business priorities when alternatives have material cost or scope impact.
- Supply real engineering values, sample files, photos, videos, machine dimensions, and acceptance examples.
- Perform final visual and usability checks on browser and iPhone.
- Approve phase completion and production deployment.
- Confirm whether real machine behavior matches the simulation.

P'Boy is not assigned routine coding, documentation, test writing, repository maintenance, or repetitive data preparation.

### ChatGPT — Project Manager / System Architect / QA Authority

ChatGPT owns:

- Requirements, scope, roadmap, priorities, architecture, and data schemas.
- Engineering calculation rules and validation requirements.
- Task decomposition and assignment to Claude.
- Acceptance criteria and test plans.
- Review of Claude output, cross-module integration, risk control, and release decisions.
- Progress calculation and status reports.
- Updating `PROJECT_CONTEXT.md`, task handoffs, decisions, risks, and backlog.
- Producing milestone download packages when required.

### Claude Pro — Implementation Engineer

Claude owns focused implementation tasks with controlled scope:

- Frontend components and responsive UI.
- Three.js viewport and 3D interaction implementation.
- Geometry, grid, snap, transform, material, measurement, object-library, and assembly features.
- Refactoring, unit tests, integration tests, bug fixing, and performance tuning.
- Implementing only from a written task handoff and current repository state.

Claude must not independently change architecture, schemas, coordinate conventions, units, mandatory fields, or deployment policy.

## 3. Working method

1. ChatGPT reads `PROJECT_CONTEXT.md` before project changes.
2. ChatGPT defines one bounded task with acceptance criteria.
3. Claude changes only the allowed files on a feature branch.
4. Claude runs tests and records results.
5. ChatGPT reviews the diff, tests integration, and records status.
6. Completed tasks are accumulated in `develop`.
7. Production is not deployed after every edit.
8. Production deployment occurs only after P'Boy approval or an explicitly approved hotfix.

### Source and storage discipline

- GitHub: source code, configuration, schemas, documentation, test fixtures, and version history.
- Netlify: deploy preview, integration branch preview, and approved production frontend deployment.
- Google Drive: large photos, videos, scans, textures, GLB/STL/STEP assets, and supplementary backups.
- Future Supabase: primary cloud data when multi-device or multi-user data is introduced.

## 4. Deployment discipline

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

- Feature branch: development and pull-request preview only.
- `develop`: phase integration testing.
- `main`: production candidate.
- Netlify production publish: only after P'Boy approval.
- GitHub commit does not mean production deployment.

## 5. Initial release scope and weights

The initial release excludes full machine animation and OEE simulation, but all schemas must be animation-ready.

| Phase | Scope | Weight |
|---|---|---:|
| 0 | Foundation, standards, schemas, repository discipline | 6% |
| 1 | Local-first project and file management | 10% |
| 2 | Core 3D workspace, axes, grid, snap, view controls | 14% |
| 3 | Parametric geometry, 2D sketch, push/pull, edit history | 15% |
| 4 | Import and capture preparation | 9% |
| 5 | Surface, material, texture, decal, lighting | 11% |
| 6 | Measurement and 2D/3D round-trip | 10% |
| 7 | Object library, grouping, modules, assemblies | 14% |
| 8 | Optimization and engineering export | 7% |
| 9 | Saved views, scenes, and camera-path preparation | 4% |
| **Total** | Initial release | **100%** |

Future programs, not included in the initial-release 100%:

- Dynamic kinematic simulation.
- Engineering physics and load analysis.
- Full 3D animation and timeline.
- Discrete-event simulation, OEE, waste, downtime, and line optimization.

## 6. Phase roadmap

### Phase 0 — Foundation

Deliverables:

- Repository and branch strategy.
- Application architecture and technology stack.
- Core object schema and assembly schema.
- Mandatory physical, surface, shape, mass, orientation, and motion-ready properties.
- Coordinate convention, units, file format versioning, and validation rules.
- Test strategy, coding rules, task handoff, progress reporting, and deployment discipline.

Owner: ChatGPT
Implementation support: Claude
P'Boy action: approve only material scope decisions.

### Phase 1 — Local-first project management

Deliverables:

- New/Open/Save/Save As.
- IndexedDB/OPFS persistence abstraction.
- Autosave, recovery, revision, recycle bin, and unique naming.
- Export/import native project package.
- Original capture preservation.

Owner: Claude implementation
Architecture/QA: ChatGPT
P'Boy action: open a supplied test package and confirm it survives browser restart/export/import.

### Phase 2 — Core 3D workspace

Deliverables:

- X/Y/Z world and local axes.
- Configurable major/minor 3D grid.
- Snap-to-grid enable/disable.
- Geometry snap modes.
- Move/rotate/scale gizmo.
- Numeric transforms.
- Scene tree, selection, view cube, orthographic/perspective, fit selected/all.

Owner: Claude implementation
Specification/QA: ChatGPT
P'Boy action: perform a short usability check with mouse and iPhone touch.

### Phase 3 — Parametric geometry and editing

Deliverables:

- Standard 3D primitives.
- 2D sketch on working planes.
- Rectangle/circle/polygon profiles.
- Push/pull and numeric extrusion.
- New body/add/cut/intersect.
- Direct face stretching.
- Basic feature history and undo/redo.
- Shape-dependent mandatory dimensions, including diameter where applicable.

Owner: Claude implementation
Engineering validation: ChatGPT
P'Boy action: compare a few created dimensions against intended values.

### Phase 4 — Import and capture preparation

Deliverables:

- Photo/video import UI.
- Frame selection and quality checks.
- Capture-session metadata and scale reference.
- GLB/OBJ/STL import.
- Processing-adapter interface for future local worker or cloud GPU reconstruction.

Owner: Claude implementation
Workflow/quality rules: ChatGPT
P'Boy action: provide one cookie capture set and one machine-part capture set.

### Phase 5 — Surface and material studio

Deliverables:

- Mandatory surface/material definition.
- Solid colors and PBR material presets.
- Local image and internet-image import with local copy.
- Fit/fill/tile/wrap/triplanar mapping.
- Decals, logos, labels, and material copy/paste.
- Texture source/license metadata.
- Lighting presets and viewer auto-rotation.

Owner: Claude implementation
Schema/licensing/QA: ChatGPT
P'Boy action: choose representative cookie, stainless, belt, and carton appearance references.

### Phase 6 — Measurement and 2D/3D round-trip

Deliverables:

- Point-to-point and X/Y/Z measurement.
- Diameter, radius, angle, bounding dimensions, and annotations.
- Measurement source and verification status.
- Orthographic views.
- Extract face to 2D.
- Basic flatten/unfold and SVG/DXF/PDF export.

Owner: Claude implementation
Engineering accuracy: ChatGPT
P'Boy action: compare selected measurements against known real dimensions.

### Phase 7 — Object library and assembly

Deliverables:

- Reusable native object package.
- Object library and thumbnails.
- Group/ungroup and nested group.
- Join copy and module creation.
- Assembly hierarchy.
- Connector points and basic connector snapping.
- Product orientation retained through hierarchy and transfers.

Owner: Claude implementation
Architecture/QA: ChatGPT
P'Boy action: assemble one small conveyor module and confirm expected workflow.

### Phase 8 — Optimization and export

Deliverables:

- Polygon reduction presets.
- Original/optimized comparison.
- Deviation and size reporting.
- GLB/STL export.
- STEP/BRep adapter preparation.
- eDrawings-oriented export validation plan.

Owner: Claude implementation
Export strategy/QA: ChatGPT
P'Boy action: open exported files in available engineering viewers and report compatibility.

### Phase 9 — Saved views and animation-ready presentation

Deliverables:

- Saved views and scenes.
- Camera waypoints and static path definitions.
- Empty animation tracks, events, pivots, motion axes, and joint metadata retained in native files.
- No machine animation timeline in the initial release.

Owner: Claude implementation
Schema/QA: ChatGPT
P'Boy action: approve saved-view usability only.

## 7. Future dynamic program

### Dynamic Phase 1 — Kinematic transport

- Motor RPM, gearbox ratio, pulley diameter, belt speed.
- Product position over time.
- Product path, lane, pitch, gap, travel time, and throughput.
- Product orientation relative to world, conveyor, and machine interface.
- Basic no-slip movement and accumulation.

### Dynamic Phase 2 — Engineering rules and warnings

- Torque requirement and drive capacity.
- Friction and slip risk.
- Maximum total, distributed, line, and point load.
- Support-area detection and overload warnings.
- Center of mass and stability warnings.

### Dynamic Phase 3 — Animation and timeline

- Keyframes, joints, motion clips, sequence events, and camera animation.
- Visual animation driven by engineering-calculated states rather than decorative motion.

### Dynamic Phase 4 — Discrete-event simulation and OEE

- Running, stopped, starved, blocked, faulted, changeover, cleaning.
- Buffers, reject, waste, downtime, throughput, availability, performance, quality, and OEE.

## 8. Mandatory progress report

Every completed task or meaningful work session must report:

- Current phase.
- Phase completion percentage.
- Total project completion percentage.
- Implemented items.
- Tests executed and results.
- Verification status.
- Commit SHA and branch.
- Known issues and risks.
- Production deployed: Yes/No.
- Next assigned task and owner.

Project completion formula:

`Total progress = Σ(phase weight × phase completion)`

A task is called complete only when it is implemented, tested, and verified.

## 9. P'Boy workload limit

P'Boy tasks should normally be limited to one of these forms:

- Provide a real-world sample or missing measured value.
- Choose between no more than two materially different business options.
- Perform a short acceptance test with explicit steps.
- Approve or reject a phase/deployment.

All preparation, documentation, test cases, calculations, file comparison, code review, and progress reporting belong to ChatGPT or Claude.

## 10. Current status

- Planning and requirements discovery: active.
- Initial release implementation: not started.
- Production deployment: not started.
- Current overall implementation progress: 0%.
- Phase 0 documentation progress: started.
