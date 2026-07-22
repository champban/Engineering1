---
name: progress-and-manual-assist
description: Mandatory progress reporting and user-assisted acceleration protocol for long or multi-step project work. Use for every application project and any task requiring multiple tool calls, deployment, troubleshooting, or user-side actions.
version: 1.0.0
---

# Progress & Manual Assist Skill

## Mandatory trigger
Use this skill whenever work is expected to require multiple steps, multiple tools, deployment, troubleshooting, file generation, repository changes, or more than a brief single response.

## Progress reporting rule
- Give an initial progress baseline after scope is understood.
- Report progress as an integer percentage from 0–100%.
- Update progress after meaningful milestones, not after every low-level action.
- Typical checkpoints: 10%, 25%, 50%, 75%, 90%, 100%.
- Each update must state:
  1. current percentage;
  2. completed work;
  3. work remaining;
  4. blocker or risk, if any.
- Never imply background work or ask the user to wait. Perform available work in the current interaction.
- Do not claim 100% until required verification and documentation are complete.

## Manual acceleration rule
At every stage, evaluate whether the user can complete any step faster or more reliably than the AI because it requires:
- opening a local browser or company-restricted system;
- approving OAuth, connector, GitHub, Netlify, Supabase, Google, or account access;
- entering secrets, API keys, passwords, billing details, or private configuration;
- clicking UI controls unavailable to the AI;
- verifying a visual or physical result on the user's device;
- running a local command where the AI has no execution environment;
- confirming production behavior from an authenticated or restricted account.

When a user-side action is faster, immediately provide:
1. **Why the user action is needed**.
2. **Exact numbered steps**.
3. **Expected result** after each critical step.
4. **What evidence to send back**: screenshot, copied error, URL, SHA, log text, or result.
5. **Safety warning**: never paste secrets, passwords, service-role keys, access tokens, or private customer data into chat.

## Do not delegate unnecessarily
- Do not ask the user to perform work the AI can complete safely through available connectors or tools.
- Do not transfer complex diagnosis to the user; ask only for the minimum evidence required.
- Prefer one short manual action batch over repeated back-and-forth.
- If manual work and AI work can proceed independently, continue AI work and clearly mark the user action as parallel.

## Standard progress update format

```md
**Progress: 50%**
Completed: [verified milestone]
Remaining: [next milestone]
User action now: [none / exact action]
Blocker: [none / specific blocker]
```

## Standard manual instruction format

```md
### Action for you
Reason: [why this cannot or should not be done by AI]
1. [exact click or command]
2. [exact next step]
3. [verification step]
Expected result: [specific outcome]
Send back: [minimum non-secret evidence]
```

## Application project integration
Before planning or coding an application:
1. Read the global project context.
2. Read prevention and fast-safe bootstrap skills.
3. Read this skill.
4. Include progress reporting and user-action checkpoints in the implementation plan.
5. Record any recurring manual step that can later be automated in the project backlog.

## Continuous improvement
After project completion, record:
- which manual steps were required;
- why automation was unavailable;
- time saved or lost;
- whether a script, connector, checklist, or diagnostic page can eliminate the manual step next time.

A recurring manual step must become either:
- an automation backlog item;
- a documented unavoidable control; or
- a reusable user checklist.
