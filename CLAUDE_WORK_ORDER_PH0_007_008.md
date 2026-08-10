# CLAUDE WORK ORDER — PH0-007 / PH0-008

Status: READY FOR CLAUDE
Owner: Claude Pro
Reviewer: ChatGPT
Product owner: P'Boy
Repository: `champban/Engineering1`
Documentation branch: `Doc`
Production deployment: NOT ALLOWED

## 1. Objective

Create the initial browser application scaffold and implement the approved Core Object Schema V1 as strongly typed TypeScript models with runtime validation and automated tests.

This work order does not implement the 3D editor, animation, simulation, file persistence, Netlify production deployment, or business features beyond the scaffold and schema test harness.

## 2. Required reading before editing

Claude must read these files in full before changing code:

1. `ENGINEERING1_PLATFORM_CONTEXT.md`
2. `PROJECT_MASTER_PLAN.md`
3. `AI_TASK_BOARD.md`
4. `CORE_OBJECT_SCHEMA_V1.md`
5. `PRODUCT_ORIENTATION_SCHEMA_V1.md`
6. `DYNAMIC_ENGINEERING_RELATIONSHIP_SCHEMA_V1.md`
7. `NATIVE_PACKAGE_SPEC_V1.md`
8. `ARCHITECTURE_DECISION_V1.md`

If any file cannot be read, stop and report the exact missing file. Do not infer or replace the approved requirements.

## 3. Branch and source discipline

Create or use a dedicated feature branch:

`feature/PH0-foundation-scaffold`

Do not edit documentation requirements to fit implementation convenience.
Do not merge to `main`.
Do not deploy production.
Do not connect Netlify production.

## 4. Approved technical direction

Use:

- React
- TypeScript strict mode
- Vite
- Direct Three.js integration boundary, but no substantial 3D feature yet
- Runtime schema validation
- Vitest for unit testing
- ESLint
- A modular directory structure

Do not use React Three Fiber as the core scene abstraction.
Do not introduce server-side rendering.
Do not add cloud authentication or Supabase.
Do not add a heavy UI framework unless explicitly approved.

## 5. Deliverables

### PH0-007 — Application scaffold

Create a clean scaffold with at least:

```text
src/
  app/
  core/
    schema/
    validation/
    commands/
  domain/
    objects/
    orientation/
    motion/
    relationships/
    packages/
  viewport/
    interfaces/
  storage/
    interfaces/
  ui/
    components/
    pages/
  test/
```

Required outputs:

- React application opens successfully.
- TypeScript strict mode enabled.
- ESLint configured.
- Vitest configured.
- `npm run build` works.
- `npm test` or equivalent test command works.
- A minimal professional shell page shows:
  - Application name
  - Phase 0 Foundation status
  - Schema version
  - Validation fixture summary
- No automatic production deployment.

### PH0-008 — Core schema implementation

Implement strong TypeScript types and runtime validation for:

- Identity
- Lifecycle and revision
- Geometry
- Shape-dependent dimensions
- Surface/material
- Physical properties and mandatory mass
- Transform and coordinate system
- Hierarchy
- Product orientation
- Motion-ready properties
- Collision/support capability
- Engineering relationships
- Measurements
- Extended properties
- Audit metadata

Use a runtime schema library appropriate for TypeScript. Keep the runtime schema and inferred TypeScript types aligned.

## 6. Mandatory fixtures

Create valid fixtures for:

1. Cookie product
2. Electric motor
3. Conveyor belt
4. Support platform

Create invalid fixtures that test at least:

- Missing mandatory shape field
- Missing diameter for a cylinder
- Outer diameter less than or equal to inner diameter
- Negative known dimension
- Unknown represented incorrectly as zero
- Missing mandatory surface field
- Missing mass structure
- Released object with unknown mass
- Product with zero forward vector
- Product forward and up vectors not approximately orthogonal
- Invalid motion capability/type combination
- Invalid relationship source/target reference
- Negative support load limit

## 7. Product orientation requirements

The Cookie fixture must include:

- `forwardVectorLocal`
- `upVectorLocal`
- `faceUp`
- `leadingEdge`
- `rotationRelativeToFlowDeg`
- `skewAngleDeg`
- `tiltAngleDeg`
- `laneId`
- `lateralOffsetMm`
- `pathBehavior`
- `status`

Implement pure utility functions with tests for:

- Projected product length along the conveyor flow direction
- Projected product width across the flow direction
- Effective pitch from projected length plus requested gap
- Orientation tolerance pass/fail

Use 2D footprint calculations for Phase 0. Keep interfaces extensible for later full 3D orientation and collision envelopes.

## 8. Motion-ready requirements

All fixtures must contain a `motion` section.

Examples:

- Cookie: `path_following`, disabled in Phase 0
- Motor: `rotatable`, rotation axis and pivot
- Belt: path/conveyor motion-ready metadata
- Platform: `static`

Animation tracks and events must exist as empty arrays.
No animation timeline or visual machine movement is required.

## 9. Dynamic relationship requirements

Create relationship types and validators for:

- `drives`
- `transmitsPowerTo`
- `rotates`
- `carries`
- `supports`
- `follows`
- `feeds`
- `receives`
- `pushes`
- `blocks`
- `detects`
- `rejects`
- `accumulates`

Create one valid sample chain:

`Motor → Gearbox/Drive → Pulley → Belt → Cookie`

The implementation may represent the gearbox/drive with a generic transmission object in Phase 0.

## 10. Validation policy

Implement three validation levels:

### Draft validation

- Mandatory field structures must exist.
- `unknown` and `pending` values are allowed.
- Invalid units, invalid vectors, and negative known engineering values are blocked.

### Verified validation

- Mandatory dimensions resolved.
- Applicable diameter resolved.
- Surface resolved.
- Mass resolved.
- Product orientation resolved.

### Released validation

- All Verified requirements pass.
- Revision exists.
- No mandatory `unknown` or `pending` values remain.

Validation errors must be human-readable and identify the object path, for example:

`physical.mass.value: Mass is required before release.`

## 11. Unit and normalization policy

- Internal length: millimetres
- Internal mass: kilograms
- Internal angle: degrees in document data, with conversion utilities allowed for renderer use
- UI may later display g/kg/t and other units
- Unknown numeric values use `null`, never `0`

Implement and test basic unit normalization utilities for:

- g to kg
- kg to kg
- t to kg
- cm to mm
- m to mm

## 12. Package interface preparation

Create TypeScript interfaces/types for:

- Project manifest
- Object package manifest (`.v3do`)
- Assembly package manifest (`.v3da`)
- Asset manifest entry
- Revision manifest

Do not implement ZIP import/export yet.

## 13. Viewport and storage boundaries

Create interfaces only, not implementations:

- `ViewportAdapter`
- `RendererAdapter`
- `ProjectRepository`
- `AssetRepository`
- `PackageSerializer`

These interfaces shall prevent React components, Three.js objects, IndexedDB, and OPFS from becoming the domain model.

## 14. Automated tests

Minimum required test coverage:

- Every blocking validation rule listed in this work order
- Four valid fixtures
- Release-state validation
- Orientation projected dimension utilities
- Pitch calculation
- Unit normalization
- Relationship validation

All tests must be deterministic and must not require network access.

## 15. Acceptance criteria

The task is ready for ChatGPT review only when:

- Dependencies install successfully.
- Application starts.
- TypeScript strict check passes.
- Lint passes.
- Unit tests pass.
- Production build passes.
- Four valid fixtures are shown in the Phase 0 shell.
- Invalid fixtures produce expected errors.
- No production deployment occurred.
- No unapproved schema field was removed or renamed.

## 16. Required final report from Claude

Claude must return:

```text
Task IDs: PH0-007, PH0-008
Branch:
Base commit:
Final commit SHA:

Files created:
Files modified:

Commands run:
- install:
- typecheck:
- lint:
- test:
- build:

Results:
- Typecheck:
- Lint:
- Unit tests:
- Build:

Acceptance criteria:
- Passed:
- Failed:

Known limitations:
Schema deviations requested:
Production deployed: No
```

## 17. Prohibited changes

Claude must not:

- Deploy to Netlify production.
- Merge to `main`.
- Add authentication.
- Add Supabase.
- Implement photogrammetry.
- Implement animation or OEE.
- Replace direct Three.js architecture with React Three Fiber.
- Change world-axis conventions or internal units.
- Weaken mandatory shape, surface, mass, diameter, or orientation validation.
- Flatten object hierarchy.
