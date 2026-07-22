# Deployment Gate Automation

Applies to React/Vite/TypeScript + Supabase + Netlify projects.

## Required local gate

Run from a clean checkout:

```bash
npm ci
npm run verify:env
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run verify:release
```

Stop immediately on failure. Do not bypass a failed command by removing the check or weakening TypeScript/ESLint without documented approval.

## Required GitHub Actions gate

Trigger:
- Pull Requests to `main` and `develop`
- Pushes to `main`

Minimum workflow:

```yaml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run verify:env
        env:
          VITE_APP_NAME: CI
          VITE_APP_ENV: test
          VITE_APP_VERSION: 0.0.0-ci
          VITE_GIT_COMMIT_SHA: ${{ github.sha }}
          VITE_BUILD_TIMESTAMP: CI
          VITE_SUPABASE_URL: https://example.supabase.co
          VITE_SUPABASE_ANON_KEY: ci-placeholder
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run build
      - run: npm run verify:release
```

Use project-safe CI test values only. Never put production keys in workflow files.

## Environment verification requirements

`scripts/verify-env.mjs` must:
- Check every required variable name.
- Validate URL variables syntactically.
- Reject service-role or secret-named variables prefixed with `VITE_`.
- Print variable names/status only, never values.
- Exit non-zero on failure.

Minimum forbidden public names:
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_DATABASE_PASSWORD`
- `VITE_PRIVATE_KEY`
- `VITE_ACCESS_TOKEN`

## Release verification requirements

`scripts/verify-release.mjs` must:
- Verify build output directory exists.
- Verify SPA redirect source exists when router is used.
- Verify app version, environment and commit SHA variables exist.
- Verify no `.env` files or obvious secret files exist in build output.
- Verify diagnostic/status routes are included in route configuration or route test.
- Exit non-zero on failure.

## Netlify Preview gate

Before merge:
- Build status successful.
- Deploy source branch and commit SHA match the Pull Request.
- `/` opens.
- `/status` opens and refreshes without 404.
- One authenticated deep link opens and refreshes.
- Login/logout/OAuth callback works with Preview callback configuration.
- Critical CRUD and RLS role tests pass.
- Admin diagnostics is inaccessible to non-admin.
- No new critical browser console/network errors.

## Production gate

Production deploy is blocked unless:
- Pull Request and quality gate passed.
- Preview smoke test passed.
- Migration and backup decision recorded.
- Production branch is `main`.
- GitHub SHA equals Netlify Production Deploy SHA.
- Production `/status` reports expected release metadata.
- Post-deploy Auth/RLS/CRUD smoke test passed.
- Last known-good deploy and rollback procedure are recorded.

## Exception handling

An exception requires all of:
- Reason and incident impact.
- Gate being bypassed.
- Specific risk introduced.
- Approval from the user/owner.
- Compensating check.
- Deadline to restore the gate.
- Entry in Prevented Recurrence Register.

Do not silently bypass a gate.