# PROJECT_CONTEXT.md

Last updated: 2026-07-20
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Project manager / architecture / QA authority: ChatGPT
Implementation engineer: Claude Pro

## 1. Overview

Build a professional browser-based, local-first 3D engineering application for creating, importing, measuring, editing, storing, assembling, and later simulating cookies, packaging equipment, conveyors, machines, cases, pallets, and complete production lines.

The initial release focuses on static 3D engineering creation and assembly but all native data must remain animation-ready and simulation-ready. Later programs add kinematic transport, engineering dynamics, load warnings, machine animation, discrete-event simulation, OEE, waste, quality, and line performance.

Product orientation is a first-class engineering property. It must affect projected dimensions, pitch, gap, lane occupancy, collision envelopes, transfer rules, machine acceptance, reject behavior, and downstream packing arrangement.

## 2. Architecture and technology stack

Approved Phase 0/Phase 1 architecture:

- React with TypeScript strict mode.
- Vite application shell.
- Direct Three.js engineering viewport; do not use React Three Fiber as the core scene abstraction.
- Native domain documents are authoritative; Three.js objects are render representations only.
- Zod runtime schema validation.
- IndexedDB/Dexie for searchable metadata and lightweight documents.
- OPFS for large binary assets and recovery snapshots.
- ZIP-compatible native packages for `.v3dproject`, `.v3do`, and `.v3da`.
- Vitest for unit/service tests; Playwright added when browser workflows are ready.
- Adapter boundaries for CAD/BRep, photogrammetry, import/export, cloud storage, and future simulation engines.

Coordinate and unit conventions:

- Right-handed coordinate system.
- X = primary length/left-right axis.
- Y = vertical axis.
- Z = depth/width axis.
- World floor = XZ plane at Y = 0.
- Internal length = millimetres.
- Internal mass = kilograms.
- Internal linear velocity = metres/second.
- Angles stored in degrees in domain documents and converted at rendering/calculation boundaries.

## 3. Key decisions

1. Mandatory object properties include shape, shape-dependent dimensions, applicable diameter, surface/material, mass, transform, origin, hierarchy, orientation, motion-ready metadata, and collision role.
2. `Unknown`, `Pending`, and `N/A` have distinct meanings. Zero must not represent an unknown engineering value.
3. Draft objects may contain unresolved mandatory values; Released objects may not.
4. Static objects still retain parent hierarchy, pivot, home transform, allowed axes, collision role, empty animation tracks, and empty event tracks.
5. Product orientation is tracked relative to world, conveyor flow, and receiving-machine interfaces.
6. Dynamic relationships are modeled explicitly, including `drives`, `transmitsPowerTo`, `rotates`, `carries`, `supports`, `follows`, `feeds`, `receives`, `pushes`, `blocks`, `detects`, `rejects`, and `accumulates`.
7. Engineering simulation will be deterministic and frame-rate independent. Visual animation is never the source of engineering truth.
8. Original scans/captures remain immutable. Working revisions and released revisions are separated.
9. Grouping must preserve child identity and transforms; destructive flatten/join is not the default.
10. GitHub is the source of truth for code, configuration, schemas, tests, and documentation. Google Drive is for large working assets and supplementary sharing.

## 4. Repository and branch discipline

- `Doc`: architecture, requirements, schemas, task handoffs, context, QA reports, backlog.
- Feature branches: bounded implementation work and deploy previews.
- `develop`: phase integration branch.
- `main`: production candidate only.

### Deployment discipline

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

- A GitHub commit is not a production deployment.
- Feature work must be tested before integration.
- Production deploy requires P'Boy approval or an explicitly approved hotfix.
- Do not auto-merge feature branches into `main`.
- Do not publish Netlify production after every change.

## 5. Current implementation state

Current phase: Phase 0 — Foundation

Completed documentation/design tasks:

- PH0-001 Master roadmap, roles, phase weights, and deployment discipline.
- PH0-002 Core object schema v1.
- PH0-003 Product orientation schema and validation rules.
- PH0-004 Animation-ready and dynamic relationship schema.
- PH0-005 Native project/object/assembly package specification.
- PH0-006 Approved architecture and technology stack.

Claude implementation branch:

- Branch: `feature/PH0-foundation-scaffold`
- Commit: `a26be523850d30dcc6dcec35e0d97b8d722302f3`
- PH0-007 application scaffold: implemented, pending final ChatGPT QA.
- PH0-008 schema validators and fixtures: implemented, pending final ChatGPT QA.

Preliminary local checks completed before GitHub push:

- Dependency installation: passed.
- TypeScript check: passed.
- ESLint: passed.
- Unit tests: 49/49 passed.
- Production build: passed.
- Dependency audit: 0 known vulnerabilities.
- Secret/API-key scan: no credentials found.

These checks do not replace PH0-009 architecture and implementation review.

Production deployed: No.
Merged to `main`: No.

## 6. Current active task

### PH0-009 — ChatGPT QA review

Review gates:

- Architecture conformity.
- No unapproved schema changes.
- Mandatory validation behavior.
- Product-orientation calculations and validation.
- Dynamic relationship reference validation.
- TypeScript strictness.
- Test coverage and invalid fixtures.
- Persistence/viewport interface boundaries.
- Security and dependency review.
- Build reproducibility.
- No production deployment.

After PH0-009 passes:

1. Create or confirm `develop` branch.
2. Open a pull request from `feature/PH0-foundation-scaffold` to `develop`.
3. Perform PH0-010 P'Boy acceptance with no more than five explicit checks.
4. Begin Phase 1 only after acceptance.

## 7. Open bugs, risks, and backlog

Priority order:

### P0 — Blocking

- Complete PH0-009 code and architecture review.
- Confirm all Work Order acceptance gates against repository source.

### P1 — High

- Create/confirm `develop` integration branch after QA.
- Add repository CI workflow if absent so typecheck, lint, tests, and build run automatically on PRs.
- Confirm Netlify is configured for deploy previews and production remains locked.
- Prepare PH0-010 acceptance package.

### P2 — Medium

- Add Playwright configuration when the first interactive browser workflow exists.
- Add Dexie, OPFS, Three.js, and package-library dependencies only when their corresponding Phase tasks begin or when required by the approved scaffold.
- Add CSP and package import hardening before external URL/file import features.

### P3 — Later programs

- Kinematic product transport.
- Motor/gearbox/pulley/belt engineering calculations.
- Load distribution, point load, slip, stability, and torque warnings.
- Machine animation timeline.
- Discrete-event simulation and OEE.

## 8. Progress reporting

Every meaningful task report must include:

- Current phase and phase completion percentage.
- Weighted overall project percentage.
- Implemented, tested, verified, merged, released, and deployed status separately.
- Tests/build/manual verification results.
- Branch and commit SHA.
- Known issues.
- Production deployment status.
- Next task and owner.

Project progress formula:

`Total progress = Σ(phase weight × phase completion)`

Phase 0 weight is 6% of the initial release.
