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
7. Read `champban/Engineering1` branch `Doc` → `skills/productivity-ais-parallel-continuity/SKILL.md`.
8. Read `champban/Engineering1` branch `Doc` → `templates/AI_ASSET_REGISTRY.md`.
9. When Codex and Claude Code may share one working tree, or the user asks for handover/takeover, read `champban/Engineering1` branch `Doc` → `skills/ai-continuity-handover/SKILL.md`.
10. Read this repo root `PROJECT_CONTEXT.md`.
11. Confirm repository, working branch, production branch, environment, Supabase project and Netlify deploy target.
12. Propose the Activation Set and ask whether additional project-specific agreements/assets should be activated.
13. If required context cannot be retrieved or conflicts, stop and inform the user. Do not guess.

## Before code or production-affecting changes
- Summarize the understood requirement and acceptance criteria.
- Identify exact files/layers affected.
- State security, data and deployment impact.
- State test plan, prevention control and rollback.
- Start/update `docs/PROJECT_PERFORMANCE_KPI.md` for a new project, major feature or release.
- Ask for confirmation when requirements are ambiguous, destructive, security-sensitive, production-affecting or have materially different implementation paths.

## Productivity AIs global default
Follow `skills/productivity-ais-parallel-continuity/SKILL.md`.

- P'Boy is the final authority to pause, stop, resume, switch or reassign Codex/Claude.
- Default to `PARALLEL_FIRST` only when work is classified `PARALLEL_SAFE` or `PARALLEL_WITH_CONTRACT`.
- Use `SEQUENTIAL_ONLY` for tightly coupled/high-risk work such as one migration, Auth/RLS policies, Production config, secrets, dependency upgrades, destructive changes or unknown-root-cause bugs.
- For parallel work, both lanes start from the same base SHA and use separate branches/worktrees.
- Lock shared contracts and record file ownership before concurrent implementation.
- Only one agent owns a file/lane/worktree at a time.
- Do not edit the other lane's owned files without PM/Owner approval.
- Codex and Claude cross-review each other's owned implementation; an author is not the sole reviewer.
- Integrate on an integration branch and run full regression verification after both lanes combine.
- Do not use a fixed 80/20 split; allocate work by capability, risk, speed and current availability.

## AI continuity: Codex + Claude Code
When same-working-tree continuity is active, follow `skills/ai-continuity-handover/SKILL.md`.

- `.ai/state.json` is local ephemeral coordination state; durable decisions remain in `PROJECT_CONTEXT.md` and Git.
- Ensure `.ai/state.json` is ignored by Git and contains no secrets or sensitive Production/user data.
- Only one active writer may modify one working tree at a time.
- If `.ai/state.json` says Claude is `ACTIVE`, Codex stays read-only unless P'Boy/PM explicitly authorizes takeover.
- On `handover to Claude`, checkpoint actual branch/base/HEAD/diff/test status, commit/push safe work, set `READY_FOR_TAKEOVER`, release writer ownership and stop editing.
- On explicit Codex `take over`, independently verify branch, base, HEAD, `git status`, diff and tests before setting Codex `ACTIVE` and continuing.
- If the previous AI stopped because of token/session limits, explicit authorized takeover plus repository verification is sufficient; no duplicate rework is required.
- If writer state is ambiguous after an unexpected failure, use a recovery branch instead of writing to the possibly active branch.
- A returning AI becomes `AVAILABLE`/`STANDBY`; it must not reclaim an active lane automatically.
- Codex may perform review-only inspection while Claude is active when independent review is requested.

## Token/session-aware handover
- Never claim an exact remaining-token/context/account-quota percentage unless the client or approved orchestrator supplies it.
- When telemetry exists, checkpoint at 70%, stop large new work at 80%, prepare handover at 85%, release writer at 90%, and perform emergency checkpoint only at 95%/hard warning.
- When telemetry is unavailable, treat context/quota warnings, repeated context loss, session instability, capacity timeouts or inability to complete the next subtask safely as handover signals.
- On a signal: stop new work → verify Git → commit/push safe progress → update status/state → mark `READY_FOR_TAKEOVER` or `BLOCKED_CAPACITY` → release writer → name the next owner and exact first action.
- Browser/Codespace panels may require P'Boy to open the next panel using one exact prompt; approved external orchestration may automate heartbeat/leases/failover but may never create overlapping writers or bypass Owner gates.

## Mandatory status and handover reporting
At meaningful checkpoints update Codex's durable status with:

```text
STATUS
PROGRESS
AGENT
TASK / LANE
BRANCH
BASE SHA
HEAD SHA
COMPLETED
PENDING
CHANGED FILES
VERIFICATION
BLOCKERS / RISKS
ACTIVE WRITER
NEXT OWNER
NEXT TASK
HANDOVER
OWNER ACTION
```

Git evidence overrides stale status.

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
- `skills/productivity-ais-parallel-continuity/SKILL.md`
- `skills/ai-continuity-handover/SKILL.md`
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
- Another AI is the active writer in the same working tree and takeover has not been explicitly authorized.
- Parallel lane ownership or contract boundaries are ambiguous.
- Capacity/session failure prevents a safe checkpoint; mark `BLOCKED_CAPACITY` and notify P'Boy instead of guessing.
