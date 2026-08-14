---
name: ai-continuity-handover
description: Same-working-tree continuity protocol for Codex and Claude Code. Provides single-writer protection, verified handover/takeover, capacity-aware checkpoints, recovery after token/session failure, and Owner P'Boy control.
version: 2.0.0
---

# AI Continuity: Handover / Takeover

## Purpose
Allow Codex and Claude Code to continue the same task in one Codespace or working tree with minimal context loss and no overlapping writers.

For parallel development across separate branches/worktrees, follow `skills/productivity-ais-parallel-continuity/SKILL.md`. This skill controls writer transfer and recovery inside one working tree or one lane.

Normal browser/Codespace panels use manual or PM-assisted activation. An approved external orchestrator may automate heartbeat, leases and invocation, but it must preserve every safety rule in this skill.

## Owner authority
P'Boy may pause, stop, resume, switch or reassign either AI at any time.

Examples:

- `pause Codex`
- `pause Claude`
- `handover to Claude`
- `handover to Codex`
- `Claude take over`
- `Codex take over`
- `stop both`

The Owner command authorizes a role transition after repository verification. It does not bypass Production, migration, secret, destructive-change or security gates.

## Core model

1. `PROJECT_CONTEXT.md`, repository files and Git history are the durable source of truth.
2. `.ai/state.json` is a local, ephemeral coordination checkpoint for the current working tree.
3. Only one active writer may modify one working tree at a time.
4. A standby agent may inspect/review but must not edit until takeover is authorized.
5. Never rely on another model's chat/session memory as project state.
6. Never store secrets, credentials, access tokens, customer/user data, private location data or sensitive Production payloads in `.ai/state.json`.
7. `.ai/state.json` must be ignored by Git.
8. Git evidence is authoritative when status/state is stale.
9. A returning agent must not silently reclaim a lane from the current writer.

## State file
Use `.ai/state.json` with this minimum structure:

```json
{
  "schema_version": 2,
  "updated_at": "2026-08-14T10:35:00+07:00",
  "repository": "owner/repo",
  "branch": "feature/example",
  "base_sha": "1234567",
  "head_sha": "abcdef1",
  "active_agent": "codex",
  "status": "ACTIVE",
  "handover_to": null,
  "task": "Short task name",
  "lane": "core",
  "objective": "What must be achieved",
  "acceptance_criteria": [],
  "completed": [],
  "pending": [],
  "next_actions": [],
  "changed_files": [],
  "verification": {
    "lint": "NOT_RUN",
    "typecheck": "NOT_RUN",
    "tests": "NOT_RUN",
    "build": "NOT_RUN",
    "security": "NOT_RUN"
  },
  "blockers": [],
  "capacity_signal": null,
  "notes": []
}
```

Allowed status values:

- `ACTIVE`
- `PREPARE_HANDOVER`
- `READY_FOR_TAKEOVER`
- `BLOCKED`
- `BLOCKED_CAPACITY`
- `DONE`
- `AVAILABLE`
- `STANDBY`

`active_agent` is `codex`, `claude`, or `null`.

## Mandatory checkpoint timing
Update `.ai/state.json` and the agent's durable status file at meaningful checkpoints:

- after task/scope/lane is confirmed;
- after contract or file ownership changes;
- after a meaningful implementation milestone;
- after root cause is confirmed;
- after verification materially changes;
- when blocked;
- when a capacity/session warning appears;
- immediately before handover;
- after takeover;
- when work is done.

Do not update continuously. Milestone checkpoints should be frequent enough that sudden session failure loses little unpushed work.

## Required durable status fields
Each agent's status file must record:

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

## Graceful handover protocol
When the active agent receives a handover/pause/stop command or knows it cannot continue safely:

1. Stop starting new implementation work.
2. Read current project instructions and confirm the transfer does not bypass an approval/deployment gate.
3. Inspect actual repository state:
   - current branch;
   - base and `HEAD` SHA;
   - `git status --short`;
   - relevant diff/changed files;
   - latest verification.
4. Complete only the smallest safe checkpoint actions.
5. Commit and push safe partial work when possible.
6. Update `.ai/state.json` and the agent's durable status file with:
   - objective and acceptance criteria;
   - completed and pending work;
   - exact first next action;
   - changed files;
   - verification;
   - blockers/risks;
   - actual branch/base/HEAD.
7. Set:
   - `active_agent = null`;
   - `status = READY_FOR_TAKEOVER`;
   - `handover_to = target agent`.
8. Release writer ownership and stop editing.
9. When another live panel must be opened manually, provide one exact minimal takeover prompt immediately.
10. Do not merge, deploy, migrate, change secrets or perform another Production-impacting action merely because handover was requested.

Do not discard or reset uncommitted work without explicit Owner approval.

## Takeover protocol
When the standby agent receives explicit takeover authority from P'Boy/PM or an approved orchestrator:

1. Run the mandatory startup/context sequence.
2. Read `skills/productivity-ais-parallel-continuity/SKILL.md` and this skill.
3. Read `.ai/state.json` when present.
4. Independently inspect:
   - repository and worktree;
   - current branch/base/HEAD;
   - `git status --short`;
   - diff and changed files;
   - relevant tests/build/security evidence;
   - agent durable status files.
5. Compare actual Git state with the checkpoint.
6. Trust Git evidence and report/repair stale state before editing.
7. Confirm the previous writer is released or takeover is explicitly authorized because it is unavailable.
8. Set:
   - `active_agent = this agent`;
   - `status = ACTIVE`;
   - `handover_to = null`.
9. Continue from verified `next_actions`; do not redo completed work unless evidence requires it.

## Single-writer guard
Before editing, if `.ai/state.json` says another agent is `ACTIVE`:

- remain read-only;
- do not modify files;
- report that another agent owns the writer lease.

Exceptions:

- P'Boy explicitly orders takeover; or
- an approved orchestrator determines the writer lease is stale/unavailable and authorizes recovery after Git verification.

If both agents appear to be writing or the branch/worktree changes unexpectedly, stop editing and report the conflict.

## Review-only mode
A standby AI may perform independent review without takeover.

In review-only mode:

- do not edit project files;
- inspect diff/tests/security/regressions;
- report severity-ranked findings;
- leave writer ownership unchanged.

An agent must not be the sole reviewer of code it authored.

## Token/session-aware checkpointing
Agents must not claim an exact remaining-token/context/account-quota percentage unless the client or an approved orchestrator supplies that metric.

When reliable context-pressure telemetry exists, use the thresholds from `skills/productivity-ais-parallel-continuity/SKILL.md`:

- 70% checkpoint;
- 80% stop large new work;
- 85% prepare handover;
- 90% release writer and hand over;
- 95% emergency checkpoint only.

When telemetry is unavailable, use strong capacity signals:

- token/context/quota warning;
- repeated loss/compression of earlier context;
- process/session instability;
- runtime/tool timeout caused by capacity;
- repeated capacity/rate-limit errors;
- inability to complete the next subtask safely.

On a capacity signal:

1. set `status = PREPARE_HANDOVER`;
2. push a safe checkpoint;
3. record `capacity_signal` without exposing account details or secrets;
4. complete graceful handover before the session fails when possible.

## Unexpected session/token exhaustion
If the active AI becomes unavailable before handover:

1. The standby agent/PM checks GitHub for the latest pushed SHA and durable status.
2. The standby verifies local/remote state before editing.
3. If writer state is ambiguous, do not continue on the potentially active branch.
4. Create/use a recovery branch, for example:

```text
feature/task-codex
recovery/task-claude
```

5. Reconstruct intent from acceptance criteria, commits, diff, tests and status.
6. Ask P'Boy only for an unrecoverable decision; do not ask for routine Git work.
7. Never reset/discard unknown work.

Uncommitted and unpushed work may be unrecoverable. This is why milestone commit/push checkpoints are mandatory.

## Return-to-duty rule
After a token/quota reset or recovered session, the returning AI sets itself to `AVAILABLE` or `STANDBY`.

It must not reclaim the active lane automatically.

P'Boy/PM decides whether it will:

- cross-review the takeover work;
- receive a new lane;
- resume ownership after a clean handover;
- remain paused.

## Current panel mode and automated orchestration
### Browser/Codespace panels
The current default is semi-automatic:

- agents checkpoint and push;
- PM detects handover gaps;
- P'Boy receives one exact prompt when a panel must be opened;
- the next agent continues from verified Git state.

One panel may not be able to wake the other automatically.

### Approved Productivity AIs Orchestrator
An external orchestrator may automate:

- heartbeat monitoring;
- context/capacity telemetry when available;
- task queue and agent invocation;
- writer leases;
- stale-session detection;
- recovery branch creation;
- status notifications.

It must not:

- invent an exact quota percentage;
- create two writers in one worktree/owned file;
- bypass Owner/Production gates;
- allow a recovered agent to silently reclaim a lane.

## Durable vs ephemeral information
Write to `PROJECT_CONTEXT.md` when information must survive Codespace deletion or is architecturally important:

- architecture and contract decisions;
- Production/deployment mapping;
- significant incidents/root causes;
- known issues/prevention controls;
- important release/handover state.

Use `.ai/state.json` only for current runtime coordination.

## Git rules

- Add `.ai/state.json` to `.gitignore`.
- Do not commit runtime handover state solely to transfer between agents.
- Use normal branches/commits/PRs for real project changes.
- Push safe work at meaningful milestones.
- Never discard or reset uncommitted changes without explicit approval.
- Use separate branches/worktrees for parallel lanes.

## Recommended operating patterns
Parallel work:

```text
Contract/file ownership lock
  → Codex lane ACTIVE + Claude lane ACTIVE in separate worktrees
  → cross-review
  → integration branch
  → full verification
```

Same-tree transfer:

```text
Codex ACTIVE → READY_FOR_TAKEOVER → Claude TAKEOVER → ACTIVE
```

or

```text
Claude ACTIVE → READY_FOR_TAKEOVER → Codex TAKEOVER → ACTIVE
```

Quality review:

```text
Implementer ACTIVE → Standby REVIEW-ONLY → Implementer/assigned owner remediates
```

## Definition of continuity-ready
A project/lane is continuity-ready when:

- `AGENTS.md` and `CLAUDE.md` reference the Productivity AIs and continuity skills;
- `.gitignore` excludes `.ai/state.json`;
- writer ownership is explicit;
- branch/base/HEAD and pending work are recorded;
- safe work is committed/pushed at milestones;
- takeover verifies Git independently;
- recovery branches are used when writer state is ambiguous;
- returning agents cannot reclaim work silently;
- P'Boy retains pause/stop/resume/reassign authority.
