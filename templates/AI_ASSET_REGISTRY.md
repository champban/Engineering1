# AI Asset Registry and Activation Rules

This registry is the source of truth for reusable AI instructions, skills, templates and starter assets available for application projects.

## Mandatory use
Before creating a new application or making a major architectural change:

1. Read the mandatory global files automatically.
2. Read this registry.
3. Identify assets relevant to the requested project, stack and risk.
4. Present a proposed **Activation Set** to the user.
5. Ask whether the user wants any additional agreement, skill, starter, template, design standard, data model or prior-project learning activated.
6. Wait for confirmation before coding when the application is new, the architecture is changing, or the choice materially affects implementation.

Do not require the user to remember file names. Proactively recommend the relevant assets and explain their purpose briefly.

## Mandatory global assets
These are always activated automatically for application work:

| Asset | Location | Purpose |
|---|---|---|
| Global project context | `project_context.md` | Global source of truth, backup policy and boot sequence |
| GitHub/Netlify/Supabase prevention skill | `skills/github-netlify-supabase-prevention/SKILL.md` | Evidence-first troubleshooting, deploy gates and recurrence prevention |
| Fast and safe bootstrap skill | `skills/project-fast-safe-bootstrap/SKILL.md` | Reuse-first project setup and standardized execution workflow |
| Progress and manual assist skill | `skills/progress-and-manual-assist/SKILL.md` | Percentage progress updates and exact user-side acceleration steps |
| Project performance KPI skill | `skills/project-performance-kpi/SKILL.md` | Comparable milestone timing and verified efficiency measurement |
| AI asset registry | `templates/AI_ASSET_REGISTRY.md` | Inventory and activation rules |
| Target project context | Target repo root `PROJECT_CONTEXT.md` | Project-specific architecture, decisions, status, incidents and deploy mapping |

If any mandatory asset cannot be retrieved, stop and inform the user. Do not guess.

## Mandatory pre-deploy asset
This asset must be read and executed before approving a Preview for Production promotion and before Production deployment:

| Asset | Location | Purpose |
|---|---|---|
| Web App Security 6D Audit | `skills/webapp-security-6d-audit/SKILL.md` | Audits Identity/access, Secrets/data, Input safety, Browser/network, Supply chain/deployment, and Operations/recovery; produces a deployment decision |

A missing or `BLOCKED` 6D audit is a Production stop condition.

## Available operational assets

| Asset | Location | Activate when | What it improves |
|---|---|---|---|
| Project Context Template | `templates/PROJECT_CONTEXT_TEMPLATE.md` | Every new project | Continuity, decisions, deployment mapping, 6D audit and incident knowledge |
| Project Performance KPI Template | `templates/PROJECT_PERFORMANCE_KPI_TEMPLATE.md` | Every new project and major release | Measures elapsed time, failures, rework and comparable improvement |
| Pre-Deploy Prevention Checklist | `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md` | Any deployable app | Reduces failed deploys and skipped security checks |
| Project Starter Manifest | `templates/PROJECT_STARTER_MANIFEST.md` | New React/Vite/Supabase/Netlify app | Faster setup and consistent required files |
| Branch Strategy and Release Flow | `templates/BRANCH_STRATEGY_AND_RELEASE_FLOW.md` | Any GitHub-deployed app | Prevents wrong branch/commit and unsafe direct production changes |
| Deployment Gate Automation | `templates/DEPLOYMENT_GATE_AUTOMATION.md` | Any CI/CD app | Automates lint, typecheck, test, build and release verification |
| Diagnostic and Status Page Spec | `templates/DIAGNOSTIC_STATUS_PAGE_SPEC.md` | Any deployed app | Faster stale deploy, environment, Auth and Supabase diagnosis |
| Root Cause and Incident Workflow | `templates/ROOT_CAUSE_AND_INCIDENT_WORKFLOW.md` | Bug, failed deploy or production incident | Prevents random patching and repeated errors |
| Claude Operating Template | `templates/CLAUDE.md` | Project will be edited by Claude | Enforces boot sequence and stop conditions in Claude |
| ChatGPT/Codex Operating Template | `templates/AGENTS.md` | Project will be edited by ChatGPT/Codex | Enforces boot sequence and stop conditions in ChatGPT/Codex |
| React/Vite/Supabase/Netlify Starter Overlay | `starter/react-vite-supabase-netlify/` | Accepted stack matches | Provides proven config, CI, env validation, status/diagnostics and health check |

## Project-specific assets to discover proactively
Before coding, inspect the target repo and ask whether to activate relevant documents such as:
- Product requirements or Business Requirement Document
- Permission Matrix
- Data model or schema standard
- UI/UX design system or Figma file
- Security and privacy rules
- Engineering calculations or domain standards
- API contract
- Deployment/environment rules
- Previous project postmortem or lessons learned
- Testing and acceptance criteria
- Backup/restore requirements
- Coding conventions
- Existing reusable modules

## Activation Set format
Present this before implementation:

```md
## Proposed Activation Set

### Automatically activated
- Global project context
- Prevention skill
- Fast-safe bootstrap skill
- Progress and manual assist skill
- Project performance KPI skill
- AI asset registry
- Target PROJECT_CONTEXT.md (when repo exists)

### Mandatory before Production
- Web App Security 6D Audit

### Recommended for this project
- [asset]: [one-line reason]

### Project-specific documents found
- [document]: [what it controls]

### Decisions requiring confirmation
- Stack/starter choice:
- Branch strategy:
- Database/Auth:
- Hosting:
- Additional standards to activate:
```

## Default Activation Sets

### New React/Vite/Supabase/Netlify application
Activate:
- Mandatory global assets
- Project Context Template
- Project Performance KPI Template
- Project Starter Manifest
- React/Vite/Supabase/Netlify Starter Overlay
- Branch Strategy and Release Flow
- Deployment Gate Automation
- Diagnostic and Status Page Spec
- Pre-Deploy Prevention Checklist
- Web App Security 6D Audit before production approval
- Claude.md and AGENTS.md when both AIs may work on the project

### Existing app bug or failed deploy
Activate:
- Mandatory global assets
- Root Cause and Incident Workflow
- Pre-Deploy Prevention Checklist
- Diagnostic and Status Page Spec
- Project Prevented Recurrence Register
- Targeted 6D re-audit when the incident affects any audited dimension

### Supabase Auth/RLS/data change
Activate:
- Mandatory global assets
- Permission Matrix in target project context
- Root Cause workflow for defects
- Backup/restore plan
- Current Supabase skill/docs and security checklist
- Web App Security 6D Audit dimensions 1, 2, 5 and 6 at minimum before production

### UI-only change with no data/security/deployment impact
Activate:
- Mandatory global assets
- Project design system/UI specification
- Relevant acceptance criteria
- Still use Preview and production build when deployable code changes
- Targeted 6D re-audit for input safety, browser/network or supply-chain impacts

## Progress and user-action protocol
For long or multi-step work:
- Report progress after meaningful milestones as an integer percentage.
- State completed work, remaining work, user action and blockers.
- Identify any step the user can perform faster or that requires user-controlled access.
- Provide exact numbered manual steps, expected result and minimum non-secret evidence to return.
- Do not delegate work that AI can safely complete through available tools.
- Add repeated manual actions to automation backlog or a reusable checklist.

## Activation confirmation rule
Ask before coding a new application:

> I have loaded the mandatory project rules. The recommended Activation Set for this project is: [list]. Do you want to add any specific agreement, skill, starter, design standard, prior project learning or document before I finalize the implementation plan?

If the user is unsure, recommend the safest minimal set. Do not ask them to diagnose technical details.

## Registry maintenance
Whenever a reusable skill, template, starter, checklist or standard is created, renamed or deprecated:
- Update this registry in the same logical change.
- Update links in the boot sequence.
- Record the decision in global/project context.
- State whether the asset is mandatory, recommended or optional.
