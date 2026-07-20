# PH0-009 QA REVIEW REPORT

Date: 2026-07-20
Reviewer: ChatGPT
Repository: `champban/Engineering1`
Implementation branch: `feature/PH0-foundation-scaffold`
Claude implementation commit: `a26be523850d30dcc6dcec35e0d97b8d722302f3`
QA hardening commit: `5f38d76cc5f444300661773e5d235b6413eb1415`
CI workflow commit: `1cef419590c5dd6d802041805952e13d375836cf`
Draft PR: `#1` — feature branch into `develop`
Production deployed: No
Merged to `main`: No

## 1. Review scope

PH0-009 reviewed PH0-007 and PH0-008 against:

- `PROJECT_CONTEXT.md`
- `PROJECT_MASTER_PLAN.md`
- `CORE_OBJECT_SCHEMA_V1.md`
- `PRODUCT_ORIENTATION_SCHEMA_V1.md`
- `DYNAMIC_RELATIONSHIP_SCHEMA_V1.md`
- `NATIVE_PACKAGE_SPEC_V1.md`
- `ARCHITECTURE_DECISION_V1.md`
- `CLAUDE_WORK_ORDER_PH0_007_008.md`

Quality gates included architecture conformity, mandatory engineering validation, orientation behavior, dynamic relationship integrity, TypeScript strictness, tests, build reproducibility, security review, and deployment discipline.

## 2. Initial Claude result

The original Claude implementation successfully provided:

- React + TypeScript strict + Vite application scaffold.
- ESLint and Vitest configuration.
- Modular domain, validation, UI, viewport-interface, storage-interface, and test structure.
- Strong TypeScript/Zod schema foundation.
- Cookie, motor, belt, and support-platform fixtures.
- Unit normalization and orientation projection utilities.
- Native package manifest interfaces.
- Human-readable validation errors.

Initial checks on the unmodified Claude commit:

- Dependency installation: Passed.
- TypeScript: Passed.
- ESLint: Passed.
- Unit tests: 49/49 Passed.
- Production build: Passed.
- Application startup smoke test: Passed.
- Secret/API-key scan: No credentials found.

## 3. Adversarial review findings

The original 49 tests did not cover eight blocking edge cases. Temporary adversarial tests confirmed all eight gaps before changes were made.

### Finding 1 — Unresolved values could contain numbers

A dimension could use `status: unknown` while still containing a numeric value. This conflicts with the approved rule that unresolved values must use `null`.

Resolution:

- Enforce status/value consistency for all dimension entries and mass.
- Resolved values require a numeric value and non-unknown source.
- Unknown, pending, and not-applicable values require `null`.

### Finding 2 — Optional negative dimensions were accepted

Only shape-required dimensions were fully checked. A supplied optional dimension could contain a negative value.

Resolution:

- Validate every supplied engineering dimension.
- Known dimensions must be positive.
- Known bounding-box dimensions must be positive.

### Finding 3 — Release lifecycle verification was incomplete

An object could pass Released validation without verified lifecycle metadata.

Resolution:

Released validation now requires:

- `verificationStatus: verified`
- a real `verifiedBy` value
- `verifiedAt`
- a non-empty revision

### Finding 4 — Product orientation depended on narrow category names

Orientation release checks were tied too narrowly to exact `product` or `cookie` category values. Primary packs, multipacks, cases, cartons, and pallets could escape product-orientation rules.

Resolution:

- Expanded product classification across category, subcategory, and tags.
- Product tokens include cookie, biscuit, payload, pack, multipack, case, carton, and pallet.
- Orientation structure is validated for every object because orientation fields exist in every native object.

### Finding 5 — Orientation basis validation was incomplete

The right vector could be zero or inconsistent with forward/up vectors.

Resolution:

- Forward, up, and right vectors must be non-zero and approximately unit length.
- All three pairs must be approximately orthogonal.
- Right vector must agree with the right-handed `forward × up` basis.

### Finding 6 — Angular tolerance failed across 0°/360°

The original comparison interpreted 359° versus 1° as a 358° error rather than a 2° error.

Resolution:

- Implemented shortest circular angular difference in the range 0–180°.

### Finding 7 — Motion axis and limit validation was incomplete

Rotatable or linear objects could contain zero axes, empty allowed-axis sets, inverted limits, or unavailable initial/home states.

Resolution:

- Rotation and translation require non-zero axis vectors.
- Corresponding allowed-axis lists must not be empty.
- Minimum limits must not exceed maximum limits.
- Initial and home states must exist in `availableStates`.

### Finding 8 — Relationship target integrity could be bypassed

Relationship validation could silently treat target references as known without receiving the complete project graph.

Resolution:

- Separated local structural validation from full graph validation.
- Outbound relationship source must match the owning object.
- Self-relations are blocked.
- Missing source/target and connector references are checked only against an explicitly supplied complete graph.
- Rotational relationship axes must be non-zero.

## 4. Additional hardening

- Added a versioned schema-migration interface as required by the architecture.
- `parseCoreObject` now returns `object: null` after parse failure instead of an unsafe cast.
- Hollow-shape diameter comparisons normalize units before validation.
- Wall thickness must be less than half the outer diameter.
- Revolved profiles require a profile reference and non-zero revolution axis.
- Custom shapes require a custom-parameter reference.
- Negative pitch input and non-positive belt speed return zero calculated rate.
- Added nine permanent adversarial regression tests.

## 5. Final local quality result

After QA hardening:

- TypeScript strict check: Passed.
- ESLint: Passed.
- Unit tests: 58/58 Passed across 6 test files.
- Production build: Passed.
- Vite startup smoke test: Passed.
- `git diff --check`: Passed.
- Secret/API-key scan: No credentials found.

Dependency audit note:

- A fresh audit recheck could not be completed because the npm registry returned a temporary network/DNS error.
- The earlier preliminary audit reported zero known vulnerabilities, but this was not independently revalidated during the final QA session.
- The GitHub CI quality gate does not currently block on network-dependent audit results.

## 6. Architecture review

Passed:

- Native domain document remains the engineering source of truth.
- No React Three Fiber introduction.
- No server-side rendering.
- No Supabase/authentication.
- No animation, photogrammetry, OEE, or production deployment.
- Viewport and storage are represented through interfaces rather than becoming domain models.
- Mandatory shape, diameter, surface, mass, orientation, motion-ready, and relationship structures remain intact.

Deferred by approved phase boundary:

- Three.js runtime viewport implementation.
- Dexie/IndexedDB implementation.
- OPFS implementation.
- Package ZIP serialization.
- Playwright workflows.

These remain planned for later tasks and are not PH0-009 failures.

## 7. Process deviations found

1. `PROJECT_CONTEXT.md` was missing when the Claude work order was executed, although the work order instructed Claude to stop if it could not be read. ChatGPT reconstructed and committed the authoritative context on `Doc` before continuing QA.
2. The work order referred to `DYNAMIC_ENGINEERING_RELATIONSHIP_SCHEMA_V1.md`, while the committed approved filename is `DYNAMIC_RELATIONSHIP_SCHEMA_V1.md`. Future handoffs must use the actual repository filename.

Neither deviation changed the approved schema content, but both are recorded to prevent recurrence.

## 8. CI and pull request

- `develop` was created from `main` as the integration branch.
- Draft PR #1 was opened from `feature/PH0-foundation-scaffold` to `develop`.
- A GitHub Actions quality workflow was added to run:
  - dependency installation
  - TypeScript
  - ESLint
  - unit tests
  - production build

The PR must remain unmerged until PH0-010 acceptance.

## 9. PH0-009 disposition

Status: **Passed with QA hardening applied**

Implementation status: Implemented
Test status: Passed locally
Verification status: Passed by ChatGPT
Merged status: No
Released status: No
Production deployed: No

## 10. Next gate

PH0-010 — P'Boy acceptance

P'Boy effort should be limited to a short browser check with no more than five explicit acceptance checks, followed by one Approve/Reject decision.
