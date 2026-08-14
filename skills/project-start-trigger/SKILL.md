---
name: project-start-trigger
description: Canonical trigger behavior for starting or resuming application projects. Activates the global boot sequence, Productivity AIs parallel/continuity policy, Activation Set and Owner approval flow.
version: 1.1.0
---

# Project Start Trigger Protocol

## Mandatory trigger phrases
Treat these and equivalent phrases as an instruction to start the project boot process:
- `เริ่ม project`
- `เริ่มโปรเจกต์`
- `project start`
- `start project`
- `create app` / `สร้าง app`
- `build application` / `สร้าง application`
- a request to resume, modify, troubleshoot, deploy or continue an existing application

Do not require the user to remember or repeat file paths.

## Required response behavior
When triggered:
1. Immediately read `champban/Engineering1` branch `Doc` → `project_context.md`.
2. Follow its Mandatory Project Boot and Activation Sequence completely.
3. Read `skills/productivity-ais-parallel-continuity/SKILL.md` and classify the requested work as `PARALLEL_SAFE`, `PARALLEL_WITH_CONTRACT`, or `SEQUENTIAL_ONLY`.
4. Read/activate every other mandatory Skill, Template, Starter, Asset Registry entry and target-repo `PROJECT_CONTEXT.md` relevant to the work.
5. Inspect for project-specific requirements, agreements, design standards, security rules, prior lessons and reusable modules.
6. Do not write or modify application code yet.
7. Present a concise **Proposed Activation Set** containing:
   - automatically activated assets;
   - Productivity AIs task classification;
   - proposed Codex/Claude lanes, common base SHA, branch/worktree and file ownership plan when parallel work is safe;
   - recommended optional/project-specific assets;
   - repository, branch, stack, database/Auth and hosting assumptions;
   - scope, risk, quality gates, test strategy and rollback approach;
   - decisions requiring user confirmation.
8. Ask exactly one approval question: `ยืนยันให้เริ่มตาม Activation Set นี้หรือไม่? Yes / No`
9. Wait for the user's Yes/No before writing or modifying code, changing architecture, or performing a Production-impacting action.

## Approval handling
- **Yes / Approved / Confirmed:** begin the approved workflow, start KPI timing, create isolated lanes when approved, and report progress by milestone.
- **No:** do not code. Ask what part of the Activation Set should change and provide a recommendation.
- **Partial approval:** apply only the approved scope and restate exclusions.

## Productivity AIs defaults
- P'Boy has final authority to pause, stop, resume, switch or reassign Codex and Claude.
- Default to parallel execution only when safely partitioned.
- Use separate branches/worktrees, locked contracts and explicit file ownership for parallel lanes.
- Require cross-review and full integrated verification.
- Do not use a fixed 80/20 workload split.
- Do not claim exact token/quota percentages without client/orchestrator telemetry.
- Capacity/session warnings trigger a safe checkpoint and handover under the global policy.
- A returning AI becomes AVAILABLE/STANDBY and cannot silently reclaim an active lane.

## Safety and speed rules
- Mandatory global files are read automatically; never ask whether to read them.
- Ask only about additional project-specific or optional assets after automatic discovery.
- Never wait for the user to remember a Skill or filename; proactively list relevant assets.
- Do not bypass confirmation for a new app, architecture change, destructive/data/security-sensitive change or Production deployment.
- Do not claim work has started until the Activation Set is approved.
- Parallel speed never bypasses single-writer, security, data, Production, migration, secret or destructive-change gates.
- If mandatory context is unavailable or contradictory, stop and explain the blocker. Do not guess.

## Canonical flow
`Project Start trigger → Auto-read global entry point → Activate mandatory assets and Productivity AIs policy → Inspect target repo/context → Classify parallel safety → Propose Activation Set and lane/contract ownership → User Yes/No → Requirement/contract lock → KPI timing → Parallel or sequential implementation → Cross-review → Integration → Full tests/build/security → Preview → 6D audit → Production verification → Record prevention/KPI`
