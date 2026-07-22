# Branch Strategy and Release Flow

Default for GitHub + Netlify projects.

## Branches

| Branch | Purpose | Netlify behavior | Direct commits |
|---|---|---|---|
| `main` | Production source of truth | Production deploy | Prohibited except approved emergency recovery |
| `develop` | Optional integration for parallel features | Branch deploy only | Prohibited; use PR |
| `feature/<scope>` | One feature/logical change | Deploy Preview through PR | Allowed while developing |
| `fix/<scope>` | One non-emergency defect | Deploy Preview through PR | Allowed while developing |
| `hotfix/<scope>` | Urgent production correction from `main` | Deploy Preview before merge when platform permits | Allowed while developing |
| `chore/<scope>` | Tooling/docs/dependency maintenance | Deploy Preview when app-affecting | Allowed while developing |

## Naming rules
- Lowercase kebab-case.
- Scope must describe one change: `feature/invite-members`, not `feature/calendar-updates-and-auth-and-ui`.
- Branch from latest intended base.
- Delete after merge.

## Standard feature flow

1. Confirm last known-good `main` SHA.
2. Create `feature/<scope>` from current base.
3. Define acceptance criteria and affected layers.
4. Implement one logical increment.
5. Run targeted tests and `npm run quality`.
6. Commit with Conventional Commit intent, e.g. `feat: add invite acceptance flow`.
7. Push and open Pull Request.
8. Require successful quality gate and Netlify Deploy Preview.
9. Verify Preview GitHub SHA = Netlify Deploy SHA.
10. Execute feature smoke test, Auth/RLS checks and deep-link refresh.
11. Review diff for unrelated changes and secrets.
12. Merge using squash when commits are noisy; preserve separate commits when each is independently reversible.
13. Verify Production deploy SHA and smoke test.
14. Update `PROJECT_CONTEXT.md` deployment mapping and status.

## Hotfix flow

1. Create `hotfix/<scope>` from production `main`.
2. Reproduce and collect evidence before patching.
3. Record current production deploy and rollback point.
4. Apply smallest proven root-cause correction.
5. Add regression test/check and prevention control.
6. Run full relevant gate.
7. Use Deploy Preview unless the outage makes that impossible; document any exception.
8. Merge to `main`; then back-merge/cherry-pick to `develop` if used.
9. Verify Production SHA, smoke test and monitoring.
10. Update Prevented Recurrence Register before closing.

## Pull Request minimum content

```md
## Scope

## Acceptance criteria
- [ ]

## Root cause (for fixes)

## Files/layers affected

## Tests executed
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run test:run
- [ ] npm run build
- [ ] Deploy Preview smoke test

## Security/data impact

## Rollback

## Prevention control
```

## Protection rules for `main`
- Require Pull Request.
- Require quality gate status.
- Require branch up to date before merge when practical.
- Block force push and deletion.
- Require review for security, Auth, RLS, migration and deployment configuration changes.
- Limit Production deploy to `main`.

## Release proof
A release is valid only when all are recorded:
- Repository and branch.
- Merge commit/release SHA.
- Netlify Production deploy SHA/ID.
- Latest applied Supabase migration.
- Smoke-test result.
- Last known-good rollback deploy.