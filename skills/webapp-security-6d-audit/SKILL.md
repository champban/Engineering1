---
name: webapp-security-6d-audit
description: Mandatory six-dimension security and operational audit for browser-based web applications before Deploy Preview approval and Production deployment.
version: 1.1.0
source: Proven and reused from champban/dashboard .codex/skills/webapp-security-6d-audit/SKILL.md
---

# Web App Security 6D Audit

## Mandatory trigger
Use this skill:
- before approving a Netlify Deploy Preview for production;
- before every first Production deployment;
- before Production deployment after material Auth, RLS, data, file upload, integration, dependency, CSP, environment or architecture changes;
- after a significant security or production incident.

A Production deployment is prohibited until this audit has a documented decision.

## Purpose
Audit a browser-based web application before deployment, close preventable risks and document residual risk, ownership and rollback readiness.

## Six dimensions
1. **Identity and access** — OAuth configuration, scopes, consent, session handling, invitation controls, role boundaries, admin override, RLS and authorization tests.
2. **Secrets and data** — API keys, tokens, publishable versus secret keys, browser storage, exported JSON, attachments, PII/privacy classification, retention and backup handling.
3. **Input and content safety** — XSS, HTML sanitization, URL validation, file type/size limits, imported JSON validation, injection, prototype pollution and unsafe dynamic evaluation.
4. **Browser and network controls** — CSP, framing, referrer policy, HTTPS, CORS/allowed endpoints, external links, security headers, deep-link routing and mixed-content checks.
5. **Supply chain and deployment** — pinned dependencies, lockfile, third-party scripts, repository exposure, secret scanning, CI integrity, branch/SHA verification, environment separation and migration drift.
6. **Operations and recovery** — safe logging, status/diagnostics, monitoring, backups, restore test, rollback, incident response, deployment verification, ownership and open residual risks.

## Workflow
1. Confirm exact repository, branch, commit SHA, environment, Supabase project and Netlify target.
2. Inventory entry points, integrations, stored data, file flows and trust boundaries.
3. Search source, configuration and repository history for secrets and dangerous patterns.
4. Review OAuth scopes, session behavior, role boundaries and RLS tests using required identities.
5. Test untrusted text, imported JSON, HTML, URLs and attachments where applicable.
6. Validate CSP/security headers and recalculate hashes/nonces after inline-script changes.
7. Verify production configuration, HTTPS, repository visibility, dependency lockfile, migration version, Deploy SHA and rollback path.
8. Verify backup location and restore/forward-fix procedure for risky data changes.
9. Classify each finding by severity and status: `fixed`, `accepted`, `blocked`, or `follow-up`.
10. Produce the required report and deployment decision.

## Mandatory checks
- No client secret, access token, refresh token, service-role/secret key or private API key in source, logs, browser bundle or diagnostic output.
- Public clients use only publishable/browser-safe keys.
- Least-privilege OAuth scopes and approved redirect URLs for local/preview/production.
- RLS/authorization tests pass for Admin, Owner, Member/Non-owner, Invited-not-accepted and Unauthorized identities where applicable.
- HTML, URL and imported data are validated/sanitized.
- File size/type limits and malware-scanning gate exist before upload is enabled.
- No unsafe dynamic evaluation or uncontrolled script injection.
- External links use safe rel attributes where relevant.
- CSP and security headers match actual application behavior.
- Dependencies are pinned sufficiently, lockfile is committed and critical advisories are reviewed.
- GitHub repository contains no sensitive production data or secrets.
- GitHub commit SHA equals the Netlify Deploy SHA being approved.
- Supabase migration version matches the intended environment.
- Public `/status` and protected diagnostics reveal no secrets or PII.
- Backup, restore/forward-fix and rollback procedures exist and are usable.

## Severity and deployment policy
- `Critical`: Production deployment blocked until fixed.
- `High`: Production deployment blocked unless the user explicitly accepts a documented exceptional risk with owner and expiry; security bypass is not permitted.
- `Medium`: Fix before deployment where practical; otherwise document owner, due date and compensating control.
- `Low`: May be follow-up with owner and due date.

## Required output
Create or update:
- `docs/SECURITY_6D_AUDIT.md`

The report must include:
- Executive summary.
- Scope, repository, branch, commit SHA and environment.
- Six-dimension findings table.
- Severity, evidence, remediation status, owner and due date.
- Tests/checks performed.
- Residual risks.
- Backup and rollback readiness.
- Deployment decision: `PASS`, `CONDITIONAL PASS`, or `BLOCKED`.
- Auditor AI/tool and audit timestamp in Asia/Bangkok.

## Deployment gate rule
- Deploy Preview may be created for testing before the final audit is closed, but it must not be approved for Production promotion while the audit decision is `BLOCKED` or missing.
- Production deployment requires `PASS`, or `CONDITIONAL PASS` with no Critical/High unmitigated finding and explicit user approval.
- Any code/config/migration change affecting an audited finding invalidates that finding's previous evidence and requires targeted re-audit.

## Project Context integration
Every project `PROJECT_CONTEXT.md` must record:

| Audit date | Commit SHA | Environment | Identity & access | Secrets & data | Input safety | Browser/network | Supply chain/deploy | Operations/recovery | Decision | Report |
|---|---|---|---|---|---|---|---|---|---|---|

Use `Not started`, `In progress`, `Pass`, `Conditional`, or `Blocked` for each dimension.
