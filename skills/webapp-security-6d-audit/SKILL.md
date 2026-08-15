---
name: webapp-security-6d-audit
description: Mandatory six-dimension functional quality, cybersecurity and operational resilience audit for browser-based web applications before Production approval.
version: 1.2.0
source: Proven and reused from champban/dashboard .codex/skills/webapp-security-6d-audit/SKILL.md
---

# Web App Quality, Security and Resilience 6D Audit

## Mandatory trigger
Use this skill:
- before approving a Netlify Deploy Preview for Production;
- before every first Production deployment;
- before Production deployment after material UI, business logic, Auth, RLS, data, file upload, integration, dependency, CSP, environment or architecture changes;
- after a significant functional defect, cybersecurity event or Production incident.

A Production deployment is prohibited until this audit has a documented decision.

## Purpose
Audit a browser-based application for functional bugs, regressions, exploitable cybersecurity vulnerabilities, unsafe deployment configuration and inadequate recovery controls. Close preventable risks and document residual risk, ownership and rollback readiness.

## Six dimensions
1. **Identity and access** — login flows, OAuth configuration/scopes, sessions, invitations, role behavior, privilege escalation, IDOR/BOLA, Admin override, RLS and server authorization.
2. **Secrets and data** — secret leakage, browser storage/bundle, tokens and keys, data integrity, PII/privacy, retention, exports, attachments, backup access and restore protection.
3. **Input and content safety** — malformed input, validation errors, XSS, injection, unsafe URLs/redirects, imported payloads, prototype pollution, dynamic evaluation and malicious files.
4. **Browser and network controls** — navigation and deep-link defects, CSP, framing, referrer policy, HTTPS/HSTS, CORS, external links, mixed content, endpoint exposure and cross-browser behavior.
5. **Supply chain and deployment** — lint/typecheck/tests/build, pinned dependencies, advisories, lockfile, third-party code, repository exposure, secret scanning, CI integrity, branch/SHA, environment separation and migration drift.
6. **Operations and recovery** — runtime failure handling, safe logging, monitoring, diagnostics, abuse/rate controls, backups, restore drill, rollback, incident response, deployment verification and residual-risk ownership.

## Required audit layers
The 6D audit must contain all four layers. None may be omitted:
1. **Functional bug audit** — verify critical user flows, boundaries, error states and data integrity.
2. **Regression audit** — rerun cases affected by recent code/config/schema changes and every significant defect fix.
3. **Cybersecurity vulnerability audit** — test authorization bypass, injection, XSS, session/OAuth weaknesses, secret exposure, unsafe uploads, browser/network weaknesses and dependency vulnerabilities.
4. **Operational resilience audit** — verify monitoring, backup, restore, rollback, incident handling and exact release identity.

## Workflow
1. Confirm exact repository, branch, commit SHA, environment, Supabase project and Netlify target.
2. Inventory user flows, entry points, integrations, stored data, file flows and trust boundaries.
3. Define critical functional and regression test cases from requirements, Permission Matrix, recent changes and Known Issues.
4. Search source, configuration, dependencies and repository history for secrets, dangerous patterns and known vulnerabilities.
5. Review OAuth, sessions, invitations, role boundaries, object-level authorization and RLS using required identities.
6. Test malformed/untrusted text, JSON, HTML, URLs, redirects and attachments where applicable.
7. Validate CSP/security headers, CORS, HTTPS and browser behavior against actual Deploy Preview traffic.
8. Verify CI, dependency advisories, lockfile, environment configuration, migration version, GitHub SHA, Netlify Deploy SHA and rollback point.
9. Verify backup location and perform or review restore/forward-fix evidence for risky data changes.
10. Classify each finding by severity and status: `fixed`, `accepted`, `blocked`, or `follow-up`.
11. Retest fixed findings and record regression/prevention controls.
12. Produce the required report and deployment decision.

## Mandatory functional and regression checks
- Critical user flows work on required desktop/mobile viewports.
- Expected success, boundary, empty, loading, permission-denied and network-failure states are tested.
- Data create/read/update/delete, locking, soft delete, restore and audit behavior match requirements.
- Date/time, timezone, range, recurrence and boundary conditions are tested where applicable.
- Realtime/state/cache behavior does not lose, duplicate or expose data.
- Every fixed Critical/High/Medium bug has a regression test/check or documented automation limitation.
- Lint, typecheck, automated tests and production build pass.

## Mandatory cybersecurity checks
- No client secret, access token, refresh token, service-role/secret key or private API key in source, history, logs, browser bundle or diagnostics.
- Public clients use only publishable/browser-safe keys.
- Least-privilege OAuth scopes and approved redirect URLs for local/Preview/Production.
- RLS and server authorization pass for Admin, Owner, Member/Non-owner, invited-not-accepted and Unauthorized identities where applicable.
- Horizontal/vertical authorization bypass and IDOR/BOLA-style identifier manipulation are tested.
- HTML, URL, redirects, imported data and dynamic content are validated/sanitized.
- Stored, reflected and DOM XSS risks are tested at untrusted-content boundaries.
- Injection-like payloads and malformed objects cannot alter queries, policies or execution.
- File size/type/content limits and malware-scanning gate exist before upload is enabled.
- No unsafe dynamic evaluation or uncontrolled script injection.
- CSRF-relevant state changes, cookie/session attributes and replay behavior are reviewed where applicable.
- External links use safe rel attributes; open redirects and unsafe URL schemes are prevented.
- CSP, CORS, framing, referrer policy, HTTPS/HSTS and mixed-content controls match actual behavior.
- Dependencies are pinned sufficiently, lockfile is committed and Critical/High advisories are reviewed and dispositioned.
- Third-party scripts and integrations are controlled and minimally privileged.
- GitHub contains no sensitive Production data or secrets.
- GitHub commit SHA equals the Netlify Deploy SHA being approved.
- Supabase migration version matches the intended environment.
- Public `/status` and protected diagnostics reveal no secrets, PII, internal stack traces or private URLs.
- Rate limiting or compensating abuse controls are reviewed for Auth, invitation, messaging, uploads and sensitive operations.
- Backup, restore/forward-fix and rollback procedures exist and are usable.

## Evidence standard
Each completed test/check must record:
- timestamp in Asia/Bangkok;
- tester or tool;
- exact GitHub and Deploy SHA;
- environment and test identity;
- expected versus actual result;
- sanitized evidence;
- finding ID on failure;
- retest evidence after remediation.

## Severity and deployment policy
- `Critical`: Production blocked until fixed and retested.
- `High`: Production blocked unless the user explicitly accepts a documented exceptional risk with owner, expiry and compensating controls; security bypass, secret exposure or uncontrolled cross-user access is not acceptable normal operation.
- `Medium`: Fix before deployment where practical; otherwise document owner, due date, compensating control and regression check.
- `Low`: May be follow-up with owner and due date.

## Required output
Create or update:
- `docs/SECURITY_6D_AUDIT.md`

The report must include:
- Executive summary and audit objectives.
- Scope, repository, branch, commit SHA, Deploy SHA and environment.
- Six-dimension findings table.
- Functional bug and regression test results.
- Cybersecurity vulnerability test results.
- Severity, evidence, remediation status, prevention control, owner and due date.
- Residual risks.
- Backup, restore and rollback readiness.
- Deployment decision: `PASS`, `CONDITIONAL PASS`, or `BLOCKED`.
- Auditor AI/tool, human verifier and audit timestamp in Asia/Bangkok.

## Deployment gate rule
- Deploy Preview may be created for testing before final audit closure, but it must not be approved for Production promotion while the audit decision is `BLOCKED` or missing.
- Production requires `PASS`, or `CONDITIONAL PASS` with no unmitigated Critical/High finding and explicit user approval.
- Any code/config/migration change affecting an audited finding invalidates that evidence and requires targeted re-audit.
- Build success alone, visual inspection alone or hidden UI controls alone never prove functional correctness or security.

## Project Context integration
Every project `PROJECT_CONTEXT.md` must record:

| Audit date | Commit SHA | Environment | Identity & access | Secrets & data | Input safety | Browser/network | Supply chain/deploy | Operations/recovery | Functional regression | Vulnerability result | Decision | Report |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Use `Not started`, `In progress`, `Pass`, `Conditional`, or `Blocked` for each audited area.
