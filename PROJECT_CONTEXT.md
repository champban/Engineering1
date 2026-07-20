# PROJECT_CONTEXT.md

Last updated: 2026-07-20
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Project owner: P'Boy
Project manager / architecture / QA authority: ChatGPT
Implementation engineer: Claude Pro

## Overview

Build a professional browser-based, local-first 3D engineering application for creating, importing, measuring, editing, storing, assembling, and later simulating cookies, packaging equipment, conveyors, machines, cases, pallets, and complete production lines.

The initial release focuses on static 3D engineering creation and assembly, but all native data remains animation-ready and simulation-ready. Product orientation is a first-class engineering property affecting projected dimensions, pitch, gap, lane occupancy, collision envelopes, transfers, machine acceptance, reject behavior, and downstream packing.

## Architecture

- React with TypeScript strict mode and Vite.
- Direct Three.js engineering viewport; no React Three Fiber core abstraction.
- Native domain documents are authoritative; Three.js objects are render representations.
- Zod runtime validation.
- IndexedDB/Dexie for metadata and lightweight documents.
- OPFS for large assets and recovery snapshots.
- ZIP-compatible `.v3dproject`, `.v3do`, and `.v3da` packages.
- Vitest now; Playwright when interactive browser workflows are ready.
- Adapters for CAD/BRep, photogrammetry, import/export, cloud storage, and simulation.

Coordinate and units:

- Right-handed coordinate system.
- X = primary length/left-right, Y = vertical, Z = depth/width.
- World floor = XZ plane at Y = 0.
- Internal length = mm; mass = kg; velocity = m/s.
- Domain angles stored in degrees.

## Key decisions

1. Mandatory fields include shape, shape-dependent dimensions, applicable diameter, surface/material, mass, transform, origin, hierarchy, orientation, motion-ready metadata, and collision role.
2. `Unknown`, `Pending`, and `N/A` are distinct. Zero never represents unknown engineering data.
3. Draft objects may be incomplete; Released objects may not contain unresolved mandatory values.
4. Static objects retain hierarchy, pivot, home transform, allowed axes, collision role, and empty animation/event tracks.
5. Product orientation is tracked relative to world, transport, and receiving-machine interfaces.
6. Engineering relationships are explicit, including drive, transport, support, sensing, rejection, and accumulation relations.
7. Simulation is deterministic and frame-rate independent; animation is not engineering truth.
8. Original captures remain immutable and revisions are separated.
9. Grouping preserves child identity and transforms.
10. GitHub is the source of truth for code, schemas, tests, configuration, and documentation.

## Branch and deployment discipline

- `Doc`: requirements, schemas, handoffs, QA reports, context, backlog.
- Feature branches: bounded implementation and preview candidates.
- `develop`: integration branch.
- `main`: production candidate only.

`Edit → Test → Verify → Commit → Report → Accumulate → Approve → Deploy`

A GitHub commit is not a deployment. Production requires P'Boy approval. Do not auto-merge feature branches to `main` and do not publish production after every change.

## Current implementation state

Current phase: Phase 0 — Foundation
Phase progress: 95%
Weighted overall project progress: 5.7%

Completed:

- PH0-001 through PH0-006: roadmap, schemas, package specification, and architecture.
- PH0-007: application scaffold.
- PH0-008: runtime validators, fixtures, calculations, and tests.
- PH0-009: ChatGPT architecture/code/validation/security QA and hardening.

Git state:

- Feature branch: `feature/PH0-foundation-scaffold`
- Claude implementation commit: `a26be523850d30dcc6dcec35e0d97b8d722302f3`
- QA hardening commit: `5f38d76cc5f444300661773e5d235b6413eb1415`
- CI workflow commit / current feature head: `1cef419590c5dd6d802041805952e13d375836cf`
- Integration branch: `develop`
- Draft PR: `#1` from feature branch to `develop`
- Merged to `develop`: No
- Merged to `main`: No
- Production deployed: No

Quality result:

- Local TypeScript: Passed.
- Local ESLint: Passed.
- Local unit tests: 58/58 Passed.
- Local production build: Passed.
- Local application startup smoke test: Passed.
- Secret/API-key scan: No credentials found.
- GitHub Actions Quality Gate run #1: Passed.

Audit note:

A final npm vulnerability recheck was blocked by a temporary registry/network error. A preliminary earlier check reported zero known vulnerabilities, but final independent reconfirmation remains pending.

Detailed report: `PH0_009_QA_REPORT.md`

## Current gate — PH0-010

P'Boy acceptance is READY. Required effort is no more than five browser checks followed by one Approve/Reject decision.

Netlify preview state:

- Dedicated preview project created: `engineering1-ph0-preview`.
- This project is for Phase 0 acceptance only and is not the production application site.
- Site ID: `e2b78e11-93c5-4301-ab69-718015e74c55`.
- Automatic upload from the ChatGPT runtime failed because the runtime could not resolve the Netlify MCP upload host.
- A verified manual-deploy package was generated: `Engineering1-PH0-preview-dist.zip`.
- Manual preview upload by P'Boy remains pending.
- Production remains untouched.

After PH0-010 approval:

1. Mark PR #1 ready.
2. Merge PR #1 into `develop` only.
3. Begin Phase 1 local-first file/project management.
4. Keep `main` and production unchanged.

## Open work and risks

### P0

- Upload the verified Phase 0 build to the dedicated Netlify preview project.
- Complete PH0-010 acceptance.

### P1

- Merge PR #1 into `develop` only after acceptance.
- Prepare the bounded Phase 1 work order.
- Configure Git-connected deploy previews and production lock before later feature phases.

### P2

- Re-run dependency audit when npm registry access is stable.
- Add Playwright with the first interactive workflow.
- Add Dexie, OPFS, Three.js, packaging, CSP, and import hardening in their approved tasks.

### Later

- Kinematic product transport.
- Motor/gearbox/pulley/belt calculations.
- Load, slip, stability, and torque warnings.
- Animation timeline.
- Discrete-event simulation and OEE.

## Progress reporting

Every meaningful report separates Implemented, Tested, Verified, Merged, Released, and Deployed, and includes phase percentage, weighted overall percentage, branch, commit SHA, tests, issues, production status, and next owner/task.

`Total progress = Σ(phase weight × phase completion)`

Phase 0 weight is 6% of the initial release.
