# Engineering1 — 3D Engineering Object & Simulation Platform

Browser-first, offline-capable 3D engineering platform. This branch
(`feature/PH0-foundation-scaffold`) contains the **Phase 0 foundation
scaffold** produced under work order `CLAUDE_WORK_ORDER_PH0_007_008.md`.

## Scope of this branch (PH0-007 + PH0-008)

- React + TypeScript (strict) + Vite application scaffold.
- Core Object Schema V1 as Zod runtime schemas with inferred TypeScript types.
- Product Orientation schema + projection/pitch/throughput/tolerance utilities.
- Motion-ready and Dynamic Relationship schemas with validators.
- Draft / Verified / Released validation engine with human-readable errors.
- Four valid fixtures (cookie, motor, belt, platform) and thirteen invalid
  fixtures.
- Interface-only viewport, renderer, storage, and package serializer boundaries.
- Vitest unit tests. ESLint. Production build.

Not in scope: 3D editor, geometry creation, photogrammetry, materials editor,
measurement tools, assembly tools, animation, simulation, persistence
implementation, Netlify production deployment.

## Commands

```bash
npm install       # install dependencies
npm run typecheck # tsc strict, no emit
npm run lint      # eslint
npm test          # vitest run
npm run build     # tsc -b && vite build
npm run dev       # local dev server
```

## Directory structure

```
src/
  app/            application shell glue
  core/
    schema/       primitives + composed CoreObjectSchema
    validation/   validation engine, unit normalization, issue types
    commands/     (reserved)
  domain/
    objects/      identity, geometry, dimensions, surface, physical, ...
    orientation/  product orientation schema + utilities
    motion/       motion-ready schema
    relationships/ dynamic engineering relationship schema
    packages/     native package manifest interfaces
  viewport/interfaces/  ViewportAdapter, RendererAdapter (interfaces only)
  storage/interfaces/   ProjectRepository, AssetRepository, PackageSerializer
  ui/pages/       Phase 0 shell page
  test/
    fixtures/valid, fixtures/invalid
    unit/         vitest suites
```

Production deployed: No.
