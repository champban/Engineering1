---
name: project-performance-kpi
description: Mandatory project timing and delivery-performance measurement for application projects. Use to establish baselines, track phase elapsed time, compare equivalent milestones, and verify whether reusable workflows actually improve speed and quality.
version: 1.0.0
---

# Project Performance KPI Skill

## Mandatory trigger
Use this skill for every new application, major feature, architectural change, production incident, and production release.

## Purpose
Measure whether ChatGPT/Claude delivery is genuinely faster and more reliable across projects. Do not claim improvement from opinion or estimated effort alone.

## Required project file
Every application repository must contain:

- `docs/PROJECT_PERFORMANCE_KPI.md`

Create it from:

- `champban/Engineering1` branch `Doc` → `templates/PROJECT_PERFORMANCE_KPI_TEMPLATE.md`

If the file is missing, create it before implementation begins and reference it from `PROJECT_CONTEXT.md`.

## Timing rules
Record two different measures:

1. **Wall-clock elapsed time** — time between a defined start and milestone completion, including waiting and manual actions.
2. **Active engineering time** — time actively spent analyzing, coding, testing, troubleshooting and deploying. Use only when tracked; otherwise label it `estimated` and never mix it with measured wall-clock time.

Use Asia/Bangkok timestamps in ISO 8601 format. Record start and finish immediately at each milestone. Do not reconstruct exact times later unless clearly labelled approximate.

## Standard milestone definitions
Use the same definitions across projects:

- `M0 Activation confirmed`: mandatory context read, Activation Set confirmed, scope accepted.
- `M1 Requirement locked`: objectives, non-goals, roles, Permission Matrix, user flows, data model, acceptance criteria, environment matrix and rollback approach agreed.
- `M2 Bootstrap verified`: starter/configuration installed; clean production build and quality gate pass before feature expansion.
- `M3 Thin vertical slice verified`: one critical end-to-end flow works through Auth/RLS/database/routing/build/Deploy Preview.
- `M4 Release Candidate / Quality Gate`: agreed RC scope complete; lint, typecheck, tests and production build pass.
- `M5 Deploy Preview verified`: Preview deployed from expected commit SHA and critical smoke tests pass.
- `M6 Production Verified`: GitHub SHA equals Netlify Deploy SHA, migrations verified, Auth/RLS critical flows pass, smoke tests pass, status/diagnostics show correct release, and rollback is ready.

Never compare different milestones as if they were equivalent.

## Mandatory KPIs
Track at minimum:

| KPI | Definition |
|---|---|
| Wall-clock hours to M4 | M0 start to verified Release Candidate / Quality Gate |
| Wall-clock hours to M6 | M0 start to Production Verified |
| Failed deploy count | Deploy attempts that fail build, publish or verification |
| CI retry count | Re-runs caused by configuration, dependency or code failure |
| Rework cycles | Completed work reopened because requirement, design or implementation was wrong |
| Root-cause diagnosis time | First reproducible evidence to confirmed root cause |
| Known-error recurrence count | Errors already documented in the Prevented Recurrence Register that happen again |
| Production escape count | Defects discovered after Production verification |
| Manual intervention count | User actions required because AI/tools could not complete them |
| Prevention closure rate | Significant incidents with root cause, prevention control and regression check divided by all significant incidents |

## Shared Calendar Community measured baseline
Use this as the first comparable baseline for similar collaboration applications:

- Project: `champban/shared-calendar-community`
- Date: 22 July 2026
- Comparable milestone: `M4 Release Candidate / Quality Gate`
- Approximate wall-clock elapsed time: **10.6 hours**
- Confidence: **medium** because automatic phase timing was not enabled at project start
- Active engineering time: **8–10 hours estimated**, not a measured KPI
- Production Verified baseline: **not measured**
- Planning reference for equivalent Production Verified scope: **14–18 hours estimated**, not a baseline

## Targets for the next similar project
For an application with a comparable stack and scope:

- M4 Release Candidate / Quality Gate: **≤ 7 hours**
- M6 Production Verified: **≤ 12 hours**
- Failed deploys: **≤ 1**
- Known-error recurrence reduction: **≥ 80%**
- Known-pattern root-cause diagnosis: **≤ 1 hour**
- Prevention closure rate: **100% for significant incidents**

These are targets, not proven improvements, until actual results are recorded.

## Comparison formulas

- `Time improvement % = ((baseline hours - actual hours) / baseline hours) × 100`
- `Failure reduction % = ((baseline failures - actual failures) / baseline failures) × 100`
- `Prevention closure rate % = (incidents closed with prevention / significant incidents) × 100`

If the baseline value is zero or unavailable, report `N/A`; do not invent a percentage.

## Comparability gate
Before reporting improvement, confirm:

- Same milestone definition.
- Same or comparable stack.
- Similar Auth/RLS/integration/realtime complexity.
- Scope differences documented.
- Delays outside engineering control identified separately.

Classify the comparison:

- `Directly comparable`: same stack and broadly equivalent scope.
- `Partially comparable`: material scope difference; report caveat.
- `Not comparable`: different milestone or architecture; do not publish a speed-improvement percentage.

## Required workflow

### At project start
1. Create/open `docs/PROJECT_PERFORMANCE_KPI.md`.
2. Record project classification and comparison baseline.
3. Record M0 start timestamp.
4. Set target hours and quality KPIs.
5. Identify which metrics are measured versus estimated.

### During work
1. Record milestone finish timestamps as soon as verified.
2. Record failed deploys, CI retries, rework and manual interventions when they occur.
3. Link incidents to the Prevented Recurrence Register.
4. Separate waiting time from active engineering time where possible.

### At release or handover
1. Confirm the highest completed milestone.
2. Calculate actual elapsed time.
3. Compare only with an equivalent baseline.
4. Record achieved improvement percentage and confidence.
5. Record causes of variance and preventive actions.
6. Update the global baseline only after a project is verified and directly comparable.

## Prohibited reporting
- Do not call an estimate a measured baseline.
- Do not compare RC time against Production Verified time.
- Do not remove failed attempts from the metric.
- Do not claim speed improvement without timestamps and scope classification.
- Do not optimize speed by bypassing security, testing, backup, Preview or Production verification gates.
