# CLAUDE.md

## Project start trigger
When the user says `เริ่ม project`, `เริ่มโปรเจกต์`, `project start`, `start project`, asks to create/build an app, or gives equivalent wording:
1. Read `champban/Engineering1` branch `Doc` → `skills/project-start-trigger/SKILL.md`.
2. Auto-run the Mandatory startup sequence below; do not ask whether mandatory files should be read.
3. Present the Proposed Activation Set.
4. Ask: `ยืนยันให้เริ่มตาม Activation Set นี้หรือไม่? Yes / No`
5. Wait for approval before writing/modifying code or changing architecture.

## Mandatory startup
Before planning, coding, modifying, testing, troubleshooting or deploying this project:

1. Read `champban/Engineering1` branch `Doc` → `project_context.md`.
2. Read `champban/Engineering1` branch `Doc` → `skills/project-start-trigger/SKILL.md`.
3. Read `champban/Engineering1` branch `Doc` → `skills/github-netlify-supabase-prevention/SKILL.md`.
4. Read `champban/Engineering1` branch `Doc` → `skills/project-fast-safe-bootstrap/SKILL.md`.
5. Read `champban/Engineering1` branch `Doc` → `skills/progress-and-manual-assist/SKILL.md`.
6. Read `champban/Engineering1` branch `Doc` → `skills/project-performance-kpi/SKILL.md`.
7. Read `champban/Engineering1` branch `Doc` → `templates/AI_ASSET_REGISTRY.md`.
8. Read this repo root `PROJECT_CONTEXT.md`.
9. Confirm repository, branch, environment, Supabase project and Netlify target.
10. Propose the Activation Set and ask whether additional project-specific agreements/assets should be activated.
11. If any context cannot be retrieved or conflicts, stop and tell the user. Do not guess.

## Before implementation
- Restate the understood requirement and acceptance criteria.
- Identify exact files/layers affected.
- State security/data/deployment impact.
- State tests and rollback.
- Start/update `docs/PROJECT_PERFORMANCE_KPI.md` for a new project, major feature or release.
- Ask for confirmation when the requirement is ambiguous, destructive, security-sensitive, production-affecting or has materially different implementation options.

## Execution rules
- Reuse the approved starter and proven modules before creating alternatives.
- One logical change per commit.
- Root cause before patch.
- No direct feature work on `main`.
- Production requires quality gate, Deploy Preview, SHA verification, 6D audit and smoke test.
- RLS/database policies enforce permissions; UI hiding is not security.
- Never commit secrets or expose service-role/secret keys to client code.
- Update `PROJECT_CONTEXT.md` for decisions, deploy mapping, known issues, KPI and prevention.

## Mandatory pre-deploy 6D audit
Before approving a Preview for Production promotion or deploying Production:
1. Read `champban/Engineering1` branch `Doc` → `skills/webapp-security-6d-audit/SKILL.md`.
2. Create/update `docs/SECURITY_6D_AUDIT.md` against the exact candidate commit SHA and environment.
3. Audit all six dimensions: Identity/access, Secrets/data, Input/content safety, Browser/network, Supply chain/deployment, Operations/recovery.
4. Record the audit summary and report link in `PROJECT_CONTEXT.md`.
5. Stop Production if the decision is missing/`BLOCKED`, Critical findings are open, or High findings are neither fixed nor explicitly accepted under policy.

## Incident rule
A bug is not closed with only a fix. Record:
- Symptom
- Evidence-confirmed root cause
- Fix
- Prevention control
- Regression test/check
- Commit/deploy
- Rollback

## Required references
- `templates/PROJECT_STARTER_MANIFEST.md`
- `templates/BRANCH_STRATEGY_AND_RELEASE_FLOW.md`
- `templates/DEPLOYMENT_GATE_AUTOMATION.md`
- `templates/DIAGNOSTIC_STATUS_PAGE_SPEC.md`
- `templates/ROOT_CAUSE_AND_INCIDENT_WORKFLOW.md`
- `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md`
- `templates/PROJECT_PERFORMANCE_KPI_TEMPLATE.md`

## Stop conditions
Stop and inform the user if:
- Context or target cannot be confirmed.
- Root cause is unknown and a multi-layer patch is proposed.
- Production build or Preview fails.
- Commit SHA and deploy SHA differ.
- RLS/security checks fail.
- A destructive data change lacks backup/restore or forward-fix plan.
- The mandatory 6D audit is missing, blocked or invalid for the candidate commit.
