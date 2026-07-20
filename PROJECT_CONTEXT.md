# PROJECT_CONTEXT.md

Last updated: 2026-07-20
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Project manager / architecture / QA authority: ChatGPT
Implementation engineer: Claude Pro

## 1. Overview

Build a professional browser-based, local-first 3D engineering application for creating, importing, measuring, editing, storing, assembling, and later simulating cookies, packaging equipment, conveyors, machines, cases, pallets, and complete production lines.

The initial release focuses on static 3D engineering creation and assembly, but all native data must remain animation-ready and simulation-ready. Later programs add kinematic transport, engineering dynamics, load warnings, machine animation, discrete-event simulation, OEE, waste, quality, and line performance.

Product orientation is a first-class engineering property. It must affect projected dimensions, pitch, gap, lane occupancy, collision envelopes, transfer rules, machine acceptance, reject behavior, and downstream packing arrangement.

## 2. Architecture and technology stack

Approved architecture:

- React with TypeScript strict mode.
- Vite application shell.
- Direct Three.js engineering viewport; React Three Fiber is not the core scene abstraction.
- Native domain documents are authoritative; Three.js objects are render representations only.
- Zod runtime validation.
- IndexedDB/Dexie for searchable metadata and lightweight documents.
- OPFS for large binary assets and recovery snapshots.
- ZIP-compatible native packages for `.v3dproject`, `.v3do`, and `.v3da`.
- Vitest for unit/service tests and Playwright when browser workflows are ready.
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
- Angles are stored in degrees in domain documents.

## 3. Key decisions

1. Mandatory properties include shape, shape-dependent dimensions, applicable diameter, surface/material, mass, transform, origin, hierarchy, orientation, motion-ready metadata, and collision role.
2. `Unknown`, `Pending`, and `N/A` have distinct meanings. Zero must not represent an unknown engineering value.
3. Draft objects may contain unresolved mandatory values; Released objects may not.
4. Static objects still retain hierarchy, pivot, home transform, allowed axes, collision role, empty animation tracks, and empty event tracks.
5. Product orientation is tracked relative to world, conveyor flow, and receiving-machine interfaces.
6. Engineering relationships are explicit: `drives`, `transmitsPowerTo`, `rotates`, `carries`, `supports`, `follows`, `feeds`, `receives`, `pushes`, `blocks`, `detects`, `rejects`, and `accumulates`.
7. Engineering simulation will be deterministic and independent of render frame rate. Visual animation is not engineering truth.
8. Original scans/captures remain immutable. Working and released revisions are separated.
9. Grouping preserves child identity and transforms; destructive flatten/join is not the default.
10. GitHub is the source of truth for code, schemas, tests, configuration, and documentation. Google Drive is for large working assets and supplementary sharing.

## 4. Branch and deployment discipline

- `Doc`: architecture, requirements, schemas, handoffs, QA reports, context, backlog.
- Feature branches: bounded implementation and deploy-preview candidates.
- `develop`: integration branch.
- `main`: production candidate only.

Deployment discipline:

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

- A GitHub commit is not a production deployment.
- Feature work must be tested before integration.
- Production requires P'Boy approval or an explicitly approved hotfix.
- Do not auto-merge feature branches into `main`.
- Do not publish Netlify production after every change.

## 5. Current implementation state

Current phase: Phase 0 — Foundation
Phase completion: 95%
Weighted overall project completion: 5.7%

Completed:

- PH0-001 Master roadmap and deployment discipline.
- PH0-002 Core object schema v1.
- PH0-003 Product orientation schema.
- PH0-004 Dynamic relationship schema.
- PH0-005 Native package specification.
- PH0-006 Architecture decision.
- PH0-007 Application scaffold.
- PH0-008 Runtime validators, fixtures, utilities, and tests.
- PH0-009 ChatGPT QA review and hardening.

Git state:

- Feature branch: `feature/PH0-foundation-scaffold`
- Claude implementation commit: `a26be523850d30dcc6dcec35e0d97b8d722302f3`
- QA hardening commit: `5f38d76cc5f444300661773e5d235b6413eb1415`
- CI workflow commit: `1cef419590c5dd6d802041805952e13d375836cf`
- Integration branch: `develop`
- Draft pull request: `#1`, feature branch into `develop`
- Merged to `develop`: No
- Merged to `main`: No
- Production deployed: No

Final local QA result:

- TypeScript strict check: Passed.
- ESLint: Passed.
- Unit tests: 58/58 Passed.
- Production build: Passed.
- Application startup smoke test: Passed.
- Secret/API-key scan: No credentials found.
- GitHub Actions quality workflow: Added and running on PR #1.

Audit note:

A fresh npm vulnerability audit recheck was blocked by a temporary registry/network error. A preliminary earlier check reported zero known vulnerabilities, but final independent reconfirmation remains pending.

Detailed review: `PH0_009_QA_REPORT.md`

## 6. Current active gate

### PH0-010 — P'Boy acceptance

P'Boy should perform no more than five explicit checks:

1. Open the Phase 0 application in a browser test environment.
2. Confirm the shell opens and shows the four fixture categories.
3. Confirm the validation summary is understandable.
4. Confirm practical desktop usability and basic mobile readability.
5. Approve or reject Phase 0.

After approval:

1. Mark PR #1 ready.
2. Merge PR #1 into `develop` only.
3. Begin Phase 1 — Local-first project/file management.
4. Keep `main` and production unchanged.

## 7. Open bugs, risks, and backlog

### P0 — Blocking

- Complete PH0-010 P'Boy browser acceptance.
- Confirm GitHub Actions PR quality gate passes.

### P1 — High

- Provide a safe browser test URL or downloadable acceptance package.
- Confirm Netlify deploy previews are configured without enabling production auto-publish.
- Merge PR #1 into `develop` only after acceptance.
- Prepare Phase 1 bounded work order.

### P2 — Medium

- Re-run dependency vulnerability audit when npm registry access is stable.
- Add Playwright when the first interactive browser workflow exists.
- Add Dexie, OPFS, Three.js, and package libraries when their approved implementation tasks begin.
- Add CSP and package-import hardening before external URL/file import.

### P3 — Later programs

- Kinematic product transport.
- Motor/gearbox/pulley/belt engineering calculations.
- Load distribution, point load, slip, stability, and torque warnings.
- Machine animation timeline.
- Discrete-event simulation and OEE.

## 8. Progress reporting

Every meaningful task report must separate:

- Implemented
- Tested
- Verified
- Merged
- Released
- Deployed

It must also include phase percentage, weighted overall percentage, branch, commit SHA, tests, known issues, production status, and next owner/task.

Project formula:

`Total progress = Σ(phase weight × phase completion)`

Phase 0 weight is 6% of the initial release.
