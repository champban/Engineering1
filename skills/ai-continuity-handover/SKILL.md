---
name: ai-continuity-handover
description: Manual continuity protocol for Codex and Claude Code sharing one Codespace or working tree. Enables user-controlled handover/takeover without copy-paste handover messages while preventing concurrent writers.
version: 1.0.0
---

# AI Continuity: Manual Handover / Takeover

## Purpose
Allow Codex and Claude Code to continue the same task in the same Codespace with minimal context loss.

This protocol intentionally uses **manual user-controlled handover/takeover**. It does not monitor token usage and does not perform automatic failover.

## Core model

1. `PROJECT_CONTEXT.md` + repository files + Git history are the durable source of truth.
2. `.ai/state.json` is a local, ephemeral coordination checkpoint for the current working tree.
3. Only **one active writer** may modify a working tree for a task at a time.
4. The standby agent may inspect/read/review, but must not edit until the user explicitly requests takeover.
5. Never rely on another model's chat/session memory as project state.
6. Never store secrets, credentials, access tokens, customer data, or sensitive production payloads in `.ai/state.json`.
7. `.ai/state.json` should be ignored by Git; it is runtime coordination state, not a permanent project document.

## User commands
Treat natural-language equivalents the same way.

### Handover
- `handover to Claude`
- `handover Claude`
- `handover to Codex`
- `handover Codex`

### Takeover
- `take over`
- `takeover`
- `take over Codex task`
- `take over Claude task`

The user command is the authority for changing the active writer.

## State file
Use `.ai/state.json` with this minimum structure:

```json
{
  "schema_version": 1,
  "updated_at": "2026-08-11T10:35:00+07:00",
  "repository": "owner/repo",
  "branch": "feature/example",
  "head_sha": "abcdef1",
  "active_agent": "codex",
  "status": "ACTIVE",
  "handover_to": null,
  "task": "Short task name",
  "objective": "What must be achieved",
  "acceptance_criteria": [],
  "completed": [],
  "next_actions": [],
  "changed_files": [],
  "verification": {
    "lint": "NOT_RUN",
    "typecheck": "NOT_RUN",
    "tests": "NOT_RUN",
    "build": "NOT_RUN"
  },
  "blockers": [],
  "notes": []
}
```

Allowed status values:
- `ACTIVE`
- `READY_FOR_TAKEOVER`
- `BLOCKED`
- `DONE`

`active_agent` is `codex`, `claude`, or `null`.

## When to update state
Update `.ai/state.json` at meaningful checkpoints, not continuously:
- after task/scope is confirmed;
- after root cause is confirmed for a bug;
- after a meaningful implementation milestone;
- after verification/test results materially change;
- immediately before a requested handover;
- after a successful takeover;
- when work becomes blocked.

This checkpoint cadence limits token overhead while allowing recovery if an AI session stops unexpectedly.

## Handover protocol
When the active agent receives a handover command:

1. Stop starting new implementation work.
2. Read the current project instructions and ensure the handover does not bypass any approval/deployment gate.
3. Inspect actual repository state:
   - current branch;
   - `HEAD` SHA;
   - `git status --short`;
   - relevant `git diff`/changed files;
   - latest available verification results.
4. Update `.ai/state.json` with:
   - current task/objective;
   - acceptance criteria;
   - completed work;
   - exact remaining actions;
   - changed files;
   - verification status;
   - blockers/risks;
   - actual branch and HEAD SHA.
5. Set:
   - `active_agent` = `null`;
   - `status` = `READY_FOR_TAKEOVER`;
   - `handover_to` = target agent.
6. Do not create a separate prose handover document unless the user specifically requests one or the task needs a durable release/runbook record.
7. Do not merge, deploy, migrate, or perform another production-impacting action merely because handover was requested.
8. Tell the user the workspace is ready for the target agent to `take over`.

## Takeover protocol
When the standby agent receives an explicit takeover command:

1. Run the project's mandatory startup/context sequence first.
2. Read `.ai/state.json` if present.
3. Independently inspect:
   - current branch;
   - `HEAD` SHA;
   - `git status --short`;
   - `git diff` and changed files;
   - relevant test/build evidence.
4. Compare actual repository state with `.ai/state.json`.
5. If state is stale or inconsistent, trust the repository evidence, report the discrepancy, and repair the state file before editing.
6. If the previous AI stopped because of a token/session limit and state still says that AI is active, the user's explicit takeover command authorizes takeover after repository verification.
7. Set:
   - `active_agent` = this agent;
   - `status` = `ACTIVE`;
   - `handover_to` = `null`.
8. Continue from the verified `next_actions`; do not redo completed work unless verification shows it is necessary.

## Single-writer guard
Before editing, if `.ai/state.json` says another agent is `ACTIVE`:
- remain read-only;
- do not modify files;
- tell the user another agent is the active writer.

Exception: an explicit user takeover command authorizes the standby agent to verify the repository and assume the writer role.

If there is evidence both agents are editing simultaneously or the working tree/branch changed unexpectedly, stop editing and report the conflict before proceeding.

## Review-only mode
The standby AI may perform an independent review without takeover when the user asks for review.

In review-only mode:
- do not edit project files;
- inspect diff/tests/security/regressions;
- report findings;
- leave `active_agent` unchanged.

This is preferred when one AI implements and the other acts as reviewer.

## Unexpected session/token exhaustion
No automatic token detection is required.

If the active AI becomes unavailable unexpectedly:
1. User tells the standby AI to `take over`.
2. Standby reads the last checkpoint.
3. Standby verifies Git state and reconstructs anything newer from the actual diff/history.
4. If critical intent cannot be reconstructed safely, ask only for the missing decision; do not guess.

The design goal is continuity without manual copy/paste, not perfect preservation of private model reasoning.

## Durable vs ephemeral information
Write to `PROJECT_CONTEXT.md` when information must survive Codespace deletion or is architecturally important, including:
- architecture decisions;
- production/deployment mapping;
- significant incidents/root causes;
- known issues and prevention controls;
- important release state.

Use `.ai/state.json` only for the current task checkpoint and handover state.

## Git rules
- Add `.ai/state.json` to `.gitignore`.
- Do not commit runtime handover state merely to transfer between AIs in the same Codespace.
- Continue using normal feature commits/PRs for real project changes.
- Before handover/takeover, never discard or reset uncommitted changes unless the user explicitly approved that action.

## Recommended operating pattern
Preferred default:

`Codex ACTIVE → handover to Claude → Claude TAKEOVER → continue`

or

`Claude ACTIVE → handover to Codex → Codex TAKEOVER → continue`

For quality:

`Implementer ACTIVE → Standby REVIEW-ONLY → Implementer fixes findings`

For parallel development, use separate branches/worktrees. Never use two active writers in the same working tree.

## Definition of continuity-ready
A project is continuity-ready when:
- `AGENTS.md` tells Codex to follow this protocol;
- `CLAUDE.md` tells Claude Code to follow this protocol;
- `.gitignore` excludes `.ai/state.json`;
- both agents use the same Codespace/working tree for manual hot-swap, or use separate worktrees for parallel tasks;
- project context and Git remain the durable source of truth.
