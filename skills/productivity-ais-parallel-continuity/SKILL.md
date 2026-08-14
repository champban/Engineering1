---
name: productivity-ais-parallel-continuity
description: Global parallel-first operating policy for Codex and Claude Code. Maximizes delivery speed and quality through isolated lanes, contract/file ownership, cross-review, token/session-aware checkpoints, graceful handover, and Owner P'Boy control.
version: 1.0.0
---

# Productivity AIs — Parallel-First & Continuity-Ready

## Purpose
Use Codex and Claude Code as coordinated Productivity AIs that work in parallel whenever the work can be safely partitioned, while preserving or improving quality through isolation, cross-review, durable status, and recovery-ready Git checkpoints.

This policy is the global default for every application repository owned by P'Boy unless the Owner explicitly overrides it or the PM classifies the work as unsafe for parallel execution.

## Owner authority
P'Boy is the final authority and may issue natural-language commands at any time, including:

- `pause Codex`
- `pause Claude`
- `stop both`
- `Claude take over Codex lane`
- `Codex take over Claude lane`
- `resume parallel work`
- `make Claude primary`
- `make Codex primary`
- `cancel this task`

Owner commands override workload allocation and lane ownership, but do not bypass Production, destructive-change, secret, migration, or security gates.

When told to stop or pause, an agent must stop starting new work, checkpoint safely, update status, release its writer role, and then stop.

## Default execution mode
The PM must classify each substantial task before implementation:

### `PARALLEL_SAFE`
Use when work can be divided into independent modules/files with no shared contract changes.

Default action: Codex and Claude work concurrently on separate branches/worktrees.

### `PARALLEL_WITH_CONTRACT`
Use when the lanes depend on shared data models, APIs, component props, or function signatures.

Default action: lock the contract first, then start both lanes concurrently.

### `SEQUENTIAL_ONLY`
Use when the work is tightly coupled or high risk, including:

- one database migration or schema change;
- one Auth/RLS/security policy set;
- Production configuration;
- secret/credential changes;
- destructive or irreversible operations;
- dependency/framework upgrades;
- a bug whose root cause is not yet known;
- a refactor requiring both agents to edit the same core files.

Default action: one agent implements and the other performs independent review.

Parallel-first means parallel when safe, not parallel at any cost.

## Capability-based allocation
Do not use a fixed Codex 80% / Claude 20% rule.

Default planning range:

- normal phase: Codex 55–65%, Claude 35–45%;
- UX-heavy phase: Codex 40–50%, Claude 50–60%;
- backend/integration-heavy phase: Codex 65–75%, Claude 25–35%.

Typical Codex ownership:

- domain/backend logic;
- data/provider contracts and adapters;
- automated tests;
- build/CI;
- repetitive remediation/refactor.

Typical Claude ownership:

- UX/UI implementation;
- interaction architecture;
- accessibility;
- security/privacy implementation and review;
- complex component architecture/refactor;
- product/design documentation.

The PM may change ownership based on current capability, cost, speed, risk, and agent availability.

## Required parallel topology
For parallel work, use:

```text
main
 └─ integration/<task>
     ├─ feature/<task>-codex
     └─ feature/<task>-claude
```

Required controls:

1. Both lanes start from the same verified base SHA.
2. Each lane uses a separate branch and separate worktree.
3. Only one active writer per worktree.
4. Shared contracts are locked before parallel implementation.
5. File ownership is recorded in `docs/AI_WORKBOARD.md` or an equivalent task record.
6. A shared file has exactly one owner at a time.
7. An agent must not edit the other lane's files without PM/Owner approval.
8. Contract changes during parallel work require a contract-change checkpoint before either lane continues.
9. Integration occurs on the integration branch, followed by full regression verification.

## Contract lock
For `PARALLEL_WITH_CONTRACT`, record before implementation:

- data structures and invariants;
- public function signatures;
- component inputs/outputs;
- error/result semantics;
- ownership of shared files;
- acceptance tests that both lanes must satisfy.

The contract is the boundary between agents. An agent must not change it unilaterally while the other lane is active.

## Cross-review rule
Quality requires independent review:

- Claude reviews Codex-owned implementation.
- Codex reviews Claude-owned implementation.
- An agent must not be the sole reviewer of code it authored.
- Review findings are severity-ranked and include exact file/line references where practical.
- Integration receives a final full test/build/security gate after both lane PRs are combined.

## Mandatory status checkpoints
Each agent updates its own durable status file at meaningful checkpoints:

- task/lane start;
- contract lock or ownership change;
- meaningful implementation milestone;
- confirmed bug/root cause;
- material test/build/security change;
- blocker or capacity warning;
- immediately before handover/takeover;
- completion.

Required fields:

```text
STATUS
PROGRESS
AGENT
TASK / LANE
BRANCH
HEAD SHA
BASE SHA
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

Allowed operating states:

- `ACTIVE`
- `PREPARE_HANDOVER`
- `READY_FOR_TAKEOVER`
- `BLOCKED`
- `BLOCKED_CAPACITY`
- `DONE`
- `AVAILABLE`
- `STANDBY`

Git evidence is authoritative when status is stale.

## Token/session-aware continuity
Agents must not claim an exact remaining-token, context, or account-quota percentage unless the client or an approved orchestrator provides that metric.

When reliable context-pressure telemetry exists, use these default thresholds:

- 70%: create/update a durable checkpoint;
- 80%: stop starting large new subtasks and push safe progress;
- 85%: run targeted verification and prepare handover;
- 90%: mark `READY_FOR_TAKEOVER`, release writer ownership, and transfer the lane;
- 95% or a hard warning: emergency checkpoint only; do not begin long tests/refactors.

Prefer a real handover around 85–88% because status, tests, commit, and push also consume context.

When exact telemetry is unavailable, prepare handover on any strong capacity signal:

- client token/context warning;
- quota/rate-limit warning;
- repeated context compression or loss of earlier task details;
- session instability or process timeout;
- repeated tool failures caused by runtime limits;
- inability to complete the next planned subtask safely.

## Graceful handover protocol
When an agent knows it cannot continue safely:

1. Stop starting new work.
2. Verify actual branch, HEAD, working-tree status, diff, and latest tests.
3. Commit and push safe partial work when possible.
4. Update the durable status file and `.ai/state.json` without secrets.
5. Record exact completed and pending work, changed files, verification, risks, and first next action.
6. Set `status = READY_FOR_TAKEOVER` and `active_agent = null`.
7. Release writer ownership.
8. Name the next agent and provide an exact minimal takeover prompt when manual panel activation is required.

Do not discard uncommitted work merely to simplify handover.

## Unexpected failure and recovery
Unexpected failure includes session crash, sudden token/quota exhaustion, network loss, stale heartbeat, or process termination before graceful handover.

The standby agent must:

1. Read mandatory global/project context.
2. Fetch and inspect the latest remote branch/HEAD/status.
3. Trust Git evidence over stale status.
4. Avoid writing to a branch that the original agent may resume.
5. Continue from a recovery branch when writer state is ambiguous:

```text
feature/<task>-codex
recovery/<task>-claude
```

6. Reconstruct intent from acceptance criteria, commits, diff, tests, and status.
7. Ask P'Boy only for a decision that cannot be recovered safely; do not redo completed work by default.

Uncommitted and unpushed work may be unrecoverable. Frequent milestone checkpoints are therefore mandatory.

## Return-to-duty rule
An agent that becomes available after a limit reset returns as `AVAILABLE` or `STANDBY`.

It must not automatically reclaim the lane from the current active agent.

P'Boy or the PM may assign it to:

- cross-review the takeover work;
- take a new lane;
- resume primary ownership after a clean handover;
- remain paused.

## Current panel mode vs orchestrated mode
In normal browser/Codespace panels, one agent may be unable to wake the other panel automatically. This is semi-automatic continuity:

- Git/status provide the durable checkpoint;
- PM detects the handover gap;
- P'Boy receives one exact takeover prompt;
- the next agent continues from verified Git state.

Full automatic heartbeat, token/quota monitoring, invocation, writer leases, and failover require an approved external Productivity AIs Orchestrator using supported CLI/SDK/API controls.

Automatic failover must not be simulated by two agents writing the same branch/worktree.

## Production and security gates
Parallel speed never bypasses:

- Owner approval for Production deployment/promotion;
- LINE Official Production configuration;
- Supabase Production migrations/data changes;
- secret/token/credential changes;
- destructive/irreversible changes;
- unresolved Critical/High security findings;
- required human merge gates.

Never place secrets, credentials, LINE user IDs, private location data, user content, or sensitive Production data in status or coordination files.

## Definition of parallel-ready
A project is parallel-ready when:

- this skill is activated;
- `AGENTS.md` and `CLAUDE.md` reference it;
- the task classification is recorded;
- the common base SHA is verified;
- lane branches/worktrees exist;
- contracts and file ownership are recorded;
- status files and `.ai/state.json` are configured;
- integration and cross-review gates are defined.

## Definition of continuity-ready
A lane is continuity-ready when:

- safe work is committed/pushed at meaningful milestones;
- exact HEAD and pending work are recorded;
- writer ownership is explicit;
- takeover/recovery rules are known;
- returning agents cannot silently reclaim active work;
- P'Boy retains explicit stop/resume/reassign control.
