# AGENTS.md

## Mandatory startup
Before planning, coding, modifying, testing, troubleshooting or deploying this project:

1. Read `champban/Engineering1` branch `Doc` → `project_context.md`.
2. Read `champban/Engineering1` branch `Doc` → `skills/github-netlify-supabase-prevention/SKILL.md`.
3. Read `champban/Engineering1` branch `Doc` → `skills/project-fast-safe-bootstrap/SKILL.md`.
4. Read this repo root `PROJECT_CONTEXT.md`.
5. Confirm repository, working branch, production branch, environment, Supabase project and Netlify deploy target.
6. If required context cannot be retrieved or conflicts, stop and inform the user. Do not guess.

## Before code or production-affecting changes
- Summarize the understood requirement and acceptance criteria.
- Identify exact files/layers affected.
- State security, data and deployment impact.
- State test plan, prevention control and rollback.
- Ask for confirmation when requirements are ambiguous, destructive, security-sensitive, production-affecting or have materially different implementation paths.

## Execution rules
- Prefer the approved starter and reusable modules.
- One logical change per commit.
- Reproduce and prove root cause before patching.
- Do not work directly on `main` for normal changes.
- Require local quality checks, Deploy Preview, SHA verification and Production smoke test.
- Enforce permissions through Supabase RLS/database policies, not UI alone.
- Never commit secrets or expose service-role credentials to browser code.
- Update `PROJECT_CONTEXT.md` after important decisions, deployments and incidents.

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

## Stop conditions
Stop and inform the user when:
- Context, branch or deployment target cannot be confirmed.
- A multi-layer patch is proposed without proven root cause.
- Production build or Deploy Preview fails.
- GitHub commit SHA does not equal Netlify deploy SHA.
- Auth/RLS/security checks fail.
- A destructive data change lacks backup and restore/forward-fix plan.