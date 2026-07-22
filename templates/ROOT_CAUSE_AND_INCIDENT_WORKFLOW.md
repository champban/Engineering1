# Root Cause and Incident Workflow

Use this workflow for every bug, failed deploy, Auth/RLS issue, data inconsistency, or unexpected production behavior.

## 1. Stop conditions
Do not modify code or configuration when:
- The issue cannot be reproduced or clearly observed.
- Repository/branch/environment/deploy target is unknown.
- The active GitHub SHA and Netlify deploy SHA are not confirmed.
- The proposed fix spans multiple layers without evidence.
- A destructive data change has no backup and rollback/forward-fix plan.

## 2. Incident intake
Record:

```md
Incident ID:
Opened date/time:
Environment:
Repository/branch:
Expected commit SHA:
Observed deploy SHA:
Reporter/user role:
Business impact:
Exact reproduction steps:
Expected result:
Actual result:
Frequency:
Last known-good commit/deploy:
```

## 3. Classify before fixing
Choose one primary class:
- Source/branch/commit mismatch
- Dependency/install
- Build/type/lint
- Routing/SPA redirect
- Runtime/browser
- Environment/configuration
- OAuth/Auth/session
- Database schema/migration
- RLS/permission
- Realtime/state/cache
- Netlify deploy/cache/domain
- Data quality/integrity

Add secondary class only when evidence supports it.

## 4. Evidence order
1. Reproduce with exact steps.
2. Compare expected and actual.
3. Confirm repository, branch and source commit.
4. Confirm Netlify deploy commit/SHA and environment.
5. Inspect browser Console.
6. Inspect Network request method, path, status and sanitized response.
7. Inspect Netlify build/deploy log.
8. Inspect Supabase Auth/Database/RLS logs as relevant.
9. Confirm migration marker and environment variables by name/status only.
10. Compare with last known-good commit/deploy.

## 5. Root-cause hypothesis format

```md
Hypothesis:
Evidence supporting it:
Evidence contradicting it:
Smallest diagnostic action:
Expected diagnostic result if true:
Actual diagnostic result:
Conclusion: confirmed / rejected / unresolved
```

Do not start a broad patch while the root cause is unresolved.

## 6. Fix design
Before implementation, state:
- Exact root cause.
- Exact files/config/database objects to change.
- Why the change is minimal.
- Risk and side effects.
- Regression tests/checks to add.
- Prevention control.
- Rollback commit/deploy or forward-fix plan.

## 7. Validation sequence
1. Targeted local test.
2. Relevant unit/integration/RLS test.
3. Lint and typecheck.
4. Production build.
5. Deploy Preview.
6. Verify Preview SHA.
7. Re-run original reproduction steps.
8. Run adjacent critical flows to detect regression.
9. Production deploy after gates pass.
10. Verify Production SHA and smoke test.

## 8. Prevention control selection
Use at least one durable control:
- Automated regression test
- Typed environment validation
- CI quality gate
- branch protection
- deploy SHA verification
- SPA route/deep-link test
- Permission Matrix and RLS role test
- database constraint
- migration check/marker
- diagnostic/status page alert
- monitoring/logging rule
- backup/restore process
- checklist update
- reusable starter/template update

Prefer controls that fail before Production.

## 9. Closure record

```md
Root cause:
Evidence:
Fix:
Files/objects changed:
Tests executed and results:
Preview commit/deploy:
Production commit/deploy:
Prevention control:
Regression test/check:
Rollback point:
Documentation updated:
Residual risk:
Status: Closed / Monitoring / Open
```

## 10. Closure criteria
An incident is not `Closed` until:
- Root cause is confirmed with evidence.
- The original failure no longer reproduces in the relevant environment.
- Adjacent critical flows pass.
- A durable prevention control is active.
- A regression test/check exists, or the reason automation is impossible is documented.
- `PROJECT_CONTEXT.md` and the Prevented Recurrence Register are updated.
- Rollback/last known-good state is recorded.

## 11. Anti-patterns prohibited from prior project experience
- Repeatedly editing UI when the failure is RLS or environment configuration.
- Changing Auth, routing and database simultaneously to make a symptom disappear.
- deploying from an unverified branch.
- assuming Production updated because GitHub push succeeded.
- using browser refresh as the only test.
- declaring success when build passes but runtime flow was not tested.
- hiding an error with a fallback without preserving diagnostic evidence.
- fixing a repeated error without adding a prevention control.

## 12. Time-saving escalation rule
After two rejected hypotheses or two unsuccessful patches:
- Stop further patching.
- Restore/compare with the last known-good state.
- Re-open the incident evidence set.
- Reclassify the failure layer.
- Ask the user only when a business rule or intended behavior is ambiguous; do not ask them to diagnose technical details that the logs can establish.