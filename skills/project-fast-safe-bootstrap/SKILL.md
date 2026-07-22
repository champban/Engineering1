---
name: project-fast-safe-bootstrap
description: Mandatory bootstrap and execution workflow for every new or existing web application. Optimized for React/Vite/TypeScript + Supabase + Netlify + GitHub and reusable by ChatGPT and Claude.
version: 1.0.0
---

# Project Fast & Safe Bootstrap Skill

## Mandatory trigger
Use this skill before planning, coding, modifying, testing, troubleshooting, deploying, or handing over any application project.

## Non-negotiable boot sequence
1. Read `champban/Engineering1` branch `Doc` → `project_context.md`.
2. Read `skills/github-netlify-supabase-prevention/SKILL.md`.
3. Read this skill.
4. Read the target repo root `PROJECT_CONTEXT.md`.
5. Confirm exact repository, working branch, production branch, environment, Supabase project, Netlify site, and expected deployment target.
6. If any required context cannot be retrieved or conflicts, stop and inform the user. Do not guess.
7. Before code or production-affecting changes, summarize understanding, proposed scope, risks, tests, rollback, and recommendation. Obtain user confirmation when the request is ambiguous, high-risk, destructive, or has multiple valid implementations.

## Proven baseline stack
Use this starter only when the project uses or accepts:
- React + Vite + TypeScript
- Supabase Database/Auth/RLS
- Netlify hosting and Deploy Previews
- GitHub source control

For another stack, reuse the workflow and controls but adapt implementation details explicitly in `PROJECT_CONTEXT.md`.

## Required reusable assets
Before implementation, verify these files exist in the target repo. Create them from the global templates if missing:
- `PROJECT_CONTEXT.md`
- `CLAUDE.md`
- `AGENTS.md`
- `.env.example`
- `.gitignore`
- `netlify.toml`
- `public/_redirects`
- `.github/workflows/quality-gate.yml`
- `src/lib/env.ts`
- `src/lib/app-meta.ts`
- `src/pages/StatusPage.tsx`
- `src/pages/AdminDiagnosticsPage.tsx`
- tests for environment validation, deep-link routing, Auth/RLS critical flows, and diagnostic redaction

Starter reference:
- `starter/react-vite-supabase-netlify/`

Operational references:
- `templates/PROJECT_STARTER_MANIFEST.md`
- `templates/BRANCH_STRATEGY_AND_RELEASE_FLOW.md`
- `templates/DEPLOYMENT_GATE_AUTOMATION.md`
- `templates/DIAGNOSTIC_STATUS_PAGE_SPEC.md`
- `templates/ROOT_CAUSE_AND_INCIDENT_WORKFLOW.md`

## Faster project setup workflow
Execute in this exact order:

### Stage 0 — Context and reuse decision
- Read all mandatory context.
- Identify which requirements match an existing reusable module: Auth, Profiles, Invitation, Membership, Roles, Comments, Realtime, Audit, Status, Diagnostics.
- Record reused modules and required deviations in `PROJECT_CONTEXT.md`.
- Do not rebuild a proven module without documenting why reuse is unsafe or insufficient.

### Stage 1 — Requirement lock
Create and confirm:
1. Product objective and non-goals.
2. User roles.
3. Permission Matrix.
4. Main user flows and error flows.
5. Data model.
6. Acceptance criteria.
7. Environment Matrix.
8. Backup and rollback approach.

Do not start production UI implementation before items 1–8 are coherent.

### Stage 2 — Bootstrap
- Copy the proven starter files.
- Set branch strategy and Netlify branch mapping.
- Create `.env.example`; never copy secret values.
- Configure local/preview/production OAuth redirect URLs.
- Enable quality gate workflow.
- Add `/status` and protected `/admin/diagnostics` routes at project start, not after failures.
- Confirm a clean production build before feature development.

### Stage 3 — Thin vertical slice
Implement one end-to-end critical flow first:
`Sign in → authorization/RLS → create/read one resource → production-like build → Deploy Preview → verification`

Do not build all screens before proving Auth, Database, RLS, routing, environment variables, and deployment work together.

### Stage 4 — Feature increments
For each increment:
1. Define acceptance criteria.
2. Identify exact files and layers affected.
3. Add/update test first where practical.
4. Implement one logical change.
5. Run targeted test, typecheck, lint, and production build.
6. Commit once with a clear intent.
7. Deploy Preview and verify commit SHA.
8. Record prevention when a new failure mode is discovered.

### Stage 5 — Production release
- Pass every Deployment Gate.
- Merge reviewed commit into production branch.
- Verify GitHub SHA equals Netlify Deploy SHA.
- Verify migration version.
- Run post-deploy smoke tests.
- Confirm `/status` and `/admin/diagnostics` report the expected version/environment without secrets.
- Record last known-good deploy and rollback path.

## Branch strategy
Mandatory default:
- `main`: production only; protected; deploys to Netlify Production.
- `develop`: optional integration branch for multi-feature work; never production.
- `feature/<short-name>`: one feature or logical change.
- `fix/<short-name>`: non-production bug fix.
- `hotfix/<short-name>`: urgent production correction based on `main`.

Rules:
- No direct feature commits to `main`.
- Pull Request + Deploy Preview before merge.
- One logical concern per PR when possible.
- Delete merged short-lived branches.
- A hotfix must add a regression test/check and update the Prevented Recurrence Register.

## Deployment gate commands
The target project must provide these scripts or equivalent:
- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- `npm run verify:env`
- `npm run verify:release`

No production deploy if a required command fails.

## Root-cause-only correction rule
Before modifying code for a bug:
1. Reproduce exactly.
2. Record expected vs actual.
3. Classify the failure layer.
4. Collect evidence.
5. State a falsifiable root-cause hypothesis.
6. Prove or reject it with the smallest diagnostic action.
7. Change only the proven root cause.
8. Add a regression test/check.
9. Add a prevention control.
10. Update the incident register.

Prohibited:
- Random multi-file patching without evidence.
- Simultaneous UI/Auth/RLS/config changes unless the root cause demonstrably spans them.
- Declaring success based only on build success or visual inspection.

## Proven recurring failure modes and mandatory controls
These controls come directly from errors experienced in prior GitHub + Netlify + Supabase projects:

| Proven failure | Mandatory prevention |
|---|---|
| Netlify deployed a different branch/commit | Show commit SHA in diagnostics; compare GitHub SHA with Netlify Deploy SHA before claim of success |
| Local worked but Production failed | Run production build and Deploy Preview before Production |
| SPA route refresh returned 404 | Commit `netlify.toml` and `public/_redirects`; test deep-link refresh |
| Environment variable missing or misnamed | Typed startup validation using `src/lib/env.ts`; maintain `.env.example` and Environment Matrix |
| OAuth callback mismatch | Store approved local/preview/production callback patterns and test login/logout/callback |
| RLS denied valid user or exposed data | Permission Matrix plus role-based RLS tests for Admin/Owner/Member/Unauthorized |
| Migration drift | Keep migrations in Git; record latest applied migration by environment |
| Old app version appeared after deploy | Display app version, environment and commit SHA; verify deploy cache and SHA |
| Fix introduced regression | Small commit, regression test and documented rollback point |
| Debug loop consumed excessive time | Evidence-first incident workflow and Prevented Recurrence Register |
| Secret exposed in source/log | Environment secret store, `.gitignore`, redaction tests and secret scan |
| Supabase data at risk during migration | Timestamped backup/export and restore/forward-fix plan before destructive change |

## Diagnostic and status requirement
Every app must expose:
- Public `/status`: application availability, release version, build timestamp, non-sensitive dependency status.
- Protected Admin `/admin/diagnostics`: environment, commit SHA, Netlify context/deploy ID if safely injected, Supabase connectivity, auth session state, migration marker, feature flags, recent client errors with redaction.

Never display API keys, tokens, full environment variables, database credentials, service-role keys, user PII, raw error payloads containing secrets, or private URLs.

## Definition of done
A feature is done only when:
- Acceptance criteria pass.
- Required tests and production build pass.
- Deploy Preview passes.
- Commit/deploy SHA verified.
- Security/RLS behavior verified where relevant.
- Documentation and `PROJECT_CONTEXT.md` updated.
- New failure modes have prevention controls.

A bug is closed only when:
- Root cause is evidence-confirmed.
- Fix is verified in the relevant environment.
- Regression test/check exists or inability to automate is documented.
- Prevention control exists.
- Rollback and incident records are updated.

## Performance targets
For projects similar to the proven stack:
- Setup/deployment lead time reduction: at least 50%.
- Failed deploy reduction: 50–70%.
- Root-cause analysis time reduction: 40–60%.
- Rework reduction: at least 50%.
- Recurrence reduction for known failures: at least 80%.

Measure actual elapsed time and failures by phase in `PROJECT_CONTEXT.md`; do not claim improvement without data.