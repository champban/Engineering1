# AI TASK BOARD — 3D Engineering Object & Simulation Platform

Last updated: 2026-07-20
Status: Phase 0 active
Overall implementation progress: 0%
Phase 0 documentation progress: 35%
Production deployed: No

## Status meanings

- `BACKLOG` — defined but not ready.
- `READY` — inputs and acceptance criteria complete.
- `IN PROGRESS` — assigned owner is working.
- `REVIEW` — implementation complete; awaiting ChatGPT QA.
- `BLOCKED` — cannot proceed without a missing dependency.
- `DONE` — implemented, tested, and verified.

## Current assignments

| Task ID | Task | Owner | Status | P'Boy effort | Depends on |
|---|---|---|---|---:|---|
| PH0-001 | Create master roadmap, roles, phase weights, and deployment discipline | ChatGPT | DONE | None | None |
| PH0-002 | Define core object schema v1 | ChatGPT | IN PROGRESS | None | PH0-001 |
| PH0-003 | Define product orientation schema and validation rules | ChatGPT | READY | None | PH0-002 |
| PH0-004 | Define animation-ready and dynamic relationship schema | ChatGPT | READY | None | PH0-002 |
| PH0-005 | Define native project/object/assembly package structures | ChatGPT | READY | None | PH0-002 |
| PH0-006 | Define architecture and approved technology stack | ChatGPT | READY | One approval | PH0-002, PH0-005 |
| PH0-007 | Scaffold application and automated test framework | Claude Pro | BACKLOG | None | PH0-006 |
| PH0-008 | Implement schema validators and sample fixtures | Claude Pro | BACKLOG | None | PH0-002 to PH0-006 |
| PH0-009 | Review scaffold, validators, tests, and build output | ChatGPT | BACKLOG | None | PH0-007, PH0-008 |
| PH0-010 | Perform Phase 0 acceptance and approve Phase 1 | P'Boy | BACKLOG | 10–15 min | PH0-009 |

## Task details

### PH0-001 — Master project plan

Owner: ChatGPT
Status: DONE

Deliverables:

- `PROJECT_MASTER_PLAN.md`
- Role division among P'Boy, ChatGPT, and Claude Pro.
- Phase weights and progress calculation.
- GitHub/Netlify deployment discipline.
- P'Boy workload limit.

Evidence:

- Commit: `b9821b8afb5ecfad833cb93086925b12fd227100`

### PH0-002 — Core object schema v1

Owner: ChatGPT
Status: IN PROGRESS

Purpose:

Define a stable, extensible object data contract before application coding begins.

Mandatory object groups:

1. Identity and revision.
2. Shape and shape-dependent dimensions.
3. Surface and material.
4. Mass and physical properties.
5. Position, rotation, scale, origin, and coordinate system.
6. Parent/child hierarchy and grouping.
7. Static/movable classification.
8. Product orientation.
9. Animation-ready pivots, axes, states, and empty tracks.
10. Data quality, source, verification, `N/A`, `Unknown`, and `Pending` states.

Acceptance criteria:

- Shape, applicable diameter, dimensions, surface/material, and mass cannot be absent from the schema.
- Draft objects may contain `Unknown`; released objects may not contain unresolved mandatory values.
- `0` is never used to represent unknown mass or dimensions.
- Static objects remain animation-ready.
- Schema can be extended without breaking previous object versions.
- A JSON example exists for cookie, motor, conveyor belt, and support platform.

### PH0-003 — Product orientation schema

Owner: ChatGPT
Status: READY

Mandatory properties:

- Forward vector.
- Up vector.
- Face-up identity.
- Leading edge.
- Rotation relative to flow.
- Skew angle.
- Tilt angle.
- Lane ID.
- Lateral offset.
- Orientation mode and status.
- Machine-interface requirement and tolerance.

Acceptance criteria:

- Orientation changes projected product length and width.
- Pitch and lane occupancy use projected dimensions.
- Collision envelope rotates with the product.
- Transfer rules preserve or intentionally change orientation.

### PH0-004 — Animation-ready and dynamic relationship schema

Owner: ChatGPT
Status: READY

Relationships to support:

- drives
- transmitsPowerTo
- rotates
- carries
- supports
- follows
- feeds
- receives
- pushes
- blocks
- detects
- rejects
- accumulates

Mandatory motion-ready properties:

- Motion capability and type.
- Parent object.
- Initial and home transform.
- Pivot and coordinate space.
- Allowed axes.
- Limits or explicit unlimited status.
- Initial state.
- Collision role.
- Empty animation/event tracks.

Dynamic properties are defined now but not implemented in early phases.

### PH0-005 — Native package structures

Owner: ChatGPT
Status: READY

Expected packages:

- Native project package.
- `.v3do` reusable object package.
- `.v3da` assembly package.

Acceptance criteria:

- Original captures remain immutable.
- Working and released revisions are separated.
- Geometry, materials, metadata, connectors, orientation, measurements, and motion-ready data are retained.
- Large assets may be external during work and embedded for portable export.

### PH0-006 — Architecture and technology stack

Owner: ChatGPT
Status: READY

Expected decision package:

- Browser-first frontend architecture.
- 3D renderer and interaction layer.
- Local file persistence.
- Geometry/CAD boundary.
- Processing-worker boundary for photogrammetry.
- Test framework.
- Netlify and GitHub branch behavior.

P'Boy task:

Approve one recommended architecture package. P'Boy will not be asked to research frameworks.

### PH0-007 — Application scaffold

Owner: Claude Pro
Status: BACKLOG

Claude inputs:

- Current repository commit.
- `PROJECT_CONTEXT.md`.
- `PROJECT_MASTER_PLAN.md`.
- Approved architecture document.
- Core schemas.
- Written task handoff.

Claude deliverables:

- Web application scaffold.
- Base layout and routing.
- TypeScript strict mode.
- Linting.
- Unit-test framework.
- Production build command.
- No business features beyond the approved scaffold.

### PH0-008 — Schema validators and fixtures

Owner: Claude Pro
Status: BACKLOG

Deliverables:

- Runtime validation for native schemas.
- Valid examples.
- Invalid examples and error messages.
- Migration/version placeholder.
- Unit tests.

### PH0-009 — QA review

Owner: ChatGPT
Status: BACKLOG

Quality gates:

- Architecture conformity.
- No unapproved schema changes.
- Build passes.
- Tests pass.
- Mandatory validation behaves correctly.
- No production deployment.

### PH0-010 — P'Boy Phase 0 acceptance

Owner: P'Boy
Status: BACKLOG
Estimated effort: 10–15 minutes

P'Boy will receive:

- One summary page.
- One browser test URL or downloadable package.
- Five explicit checks.
- A single approve/reject decision.

## Near-term execution sequence

1. ChatGPT completes PH0-002.
2. ChatGPT completes PH0-003 and PH0-004.
3. ChatGPT completes PH0-005 and PH0-006.
4. ChatGPT prepares a bounded Claude work order for PH0-007 and PH0-008.
5. Claude implements and tests.
6. ChatGPT reviews and integrates.
7. P'Boy performs the minimal Phase 0 acceptance.
8. Phase 1 begins only after acceptance.

## Progress reporting template

```text
Project: 3D Engineering Object & Simulation Platform
Current phase: Phase X — Name
Phase progress: XX%
Total project progress: XX%

Completed:
- ...

In progress:
- ...

Tests:
- Unit: pass/fail/not started
- Integration: pass/fail/not started
- Build: pass/fail/not started
- Manual verification: pass/fail/not started

Git:
- Branch:
- Commit SHA:

Production deployed: No
Known issues:
- ...

Next task:
- Task ID / Owner / Expected deliverable
P'Boy action required:
- None or one short explicit action
```

## Current report

Project: 3D Engineering Object & Simulation Platform
Current phase: Phase 0 — Foundation
Phase progress: 35% of documentation and management setup
Total implementation progress: 0%

Completed:

- Master roadmap.
- Role assignment.
- Phase weights.
- Deployment discipline.
- Initial AI task board.

In progress:

- Core object schema v1.

Tests:

- Unit: not started.
- Integration: not started.
- Build: not started.
- Manual verification: not started.

Git:

- Branch: `Doc`
- Latest planning commit before this file: `b9821b8afb5ecfad833cb93086925b12fd227100`

Production deployed: No
P'Boy action required: None at this stage.
