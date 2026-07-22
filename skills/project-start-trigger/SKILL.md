---
name: project-start-trigger
description: Canonical trigger behavior for starting or resuming application projects. Activates the global boot sequence when the user says project start, เริ่ม project, start project, create app, build app, or equivalent wording.
version: 1.0.0
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
3. Read/activate every mandatory Skill, Template, Starter, Asset Registry entry and target-repo `PROJECT_CONTEXT.md` relevant to the work.
4. Inspect for project-specific requirements, agreements, design standards, security rules, prior lessons and reusable modules.
5. Do not write or modify application code yet.
6. Present a concise **Proposed Activation Set** containing:
   - automatically activated assets;
   - recommended optional/project-specific assets;
   - repository, branch, stack, database/Auth and hosting assumptions;
   - scope, risk, quality gates, test strategy and rollback approach;
   - decisions requiring user confirmation.
7. Ask exactly one approval question: `ยืนยันให้เริ่มตาม Activation Set นี้หรือไม่? Yes / No`
8. Wait for the user's Yes/No before writing or modifying code, changing architecture, or performing a production-impacting action.

## Approval handling
- **Yes / Approved / Confirmed:** begin the approved workflow, start KPI timing and report progress by milestone.
- **No:** do not code. Ask what part of the Activation Set should change and provide a recommendation.
- **Partial approval:** apply only the approved scope and restate exclusions.

## Safety and speed rules
- Mandatory global files are read automatically; never ask whether to read them.
- Ask only about additional project-specific or optional assets after automatic discovery.
- Never wait for the user to remember a Skill or filename; proactively list relevant assets.
- Do not bypass confirmation for a new app, architecture change, destructive/data/security-sensitive change or production deployment.
- Do not claim work has started until the Activation Set is approved.
- If mandatory context is unavailable or contradictory, stop and explain the blocker. Do not guess.

## Canonical flow
`Project Start trigger → Auto-read global entry point → Activate mandatory assets → Inspect target repo/context → Propose Activation Set → User Yes/No → Requirement lock → KPI timing → Implementation → Tests → Preview → 6D audit → Production verification → Record prevention/KPI`
