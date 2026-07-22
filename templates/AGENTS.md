# AGENTS.md

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
9. Confirm repository, working branch, production branch, environment, Supabase project and Netlify deploy target.
10. Propose the Activation Set and ask whether additional project-specific agreements/assets should be activated.
11. If required context cannot be retrieved or conflicts, stop and inform the user. Do not guess.

## Before code or production-affecting changes
- Summarize the understood requirement and acceptance criteria.
- Identify exact files/layers affected.
- State security, data and deployment impact.
- State test plan, prevention control and rollback.
- Start/update `docs/PROJECT_PERFORMANCE_KPI.md` for a new project, major feature or release.
- Ask for confirmation when requirements are ambiguous, destructive, security-sensitive, production-affecting or have materially different implementation paths.

## Execution rules
- Prefer the approved starter and reusable modules.
- One logical change per commit.
- Reproduce and prove root cause before patching.
- Do not work directly on `main` for normal changes.
- Require local quality checks, Deploy Preview, SHA verification, 6D audit and Production smoke test.
- Enforce permissions through Supabase RLS/database policies, not UI alone.
- Never commit secrets or expose service-role/secret credentials to browser code.
- Update `PROJECT_CONTEXT.md` after important decisions, deployments, KPI updates and incidents.

## Mandatory pre-deploy 6D audit
Before approving a Preview for Production promotion or deploying Production:
1. Read `champban/Engineering1` branch `Doc` → `skills/webapp-security-6d-audit/SKILL.md`.
2. Create/update `docs/SECURITY_6D_AUDIT.md` against the exact candidate commit SHA and environment.
3. Audit all six dimensions: Identity/access, Secrets/data, Input/content safety, Browser/network, Supply chain/deployment, Operations/recovery.
4. Record the audit summary and report link in `PROJECT_CONTEXT.md`.
5. Stop Production if the decision is missing/`BLOCKED`, Critical findings are open, or High findings are neither fixed nor explicitly accepted under policy.

## Required incident closure
A bug is not closed until all are recorded:
- Symptom and reproduction
- Evidence-confirmed root cause
- Minimal fix
- Durable prevention control
- Regression test/check
- Commit and deploy identity
- Rollback point

## Required references
- `templates/PROJECT_STARTER_MANIFEST.md`
- `templates/BRANCH_STRATEGY_AND_RELEASE_FLOW.md`
- `templates/DEPLOYMENT_GATE_AUTOMATION.md`
- `templates/DIAGNOSTIC_STATUS_PAGE_SPEC.md`
- `templates/ROOT_CAUSE_AND_INCIDENT_WORKFLOW.md`
- `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md`
- `templates/PROJECT_PERFORMANCE_KPI_TEMPLATE.md`

## Stop conditions
Stop and inform the user when:
- Context, branch or deployment target cannot be confirmed.
- A multi-layer patch is proposed without proven root cause.
- Production build or Deploy Preview fails.
- GitHub commit SHA does not equal Netlify deploy SHA.
- Auth/RLS/security checks fail.
- A destructive data change lacks backup and restore/forward-fix plan.
- The mandatory 6D audit is missing, blocked or invalid for the candidate commit.
