# React + Vite + TypeScript + Supabase + Netlify Starter

This is the approved starter overlay for similar future applications.

## 1. Create the base project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install @supabase/supabase-js react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Then copy the contents of this starter directory into the project root, preserving paths.

## 2. Copy mandatory operating files

Copy from the global templates:
- `templates/PROJECT_CONTEXT_TEMPLATE.md` → `PROJECT_CONTEXT.md`
- `templates/CLAUDE.md` → `CLAUDE.md`
- `templates/AGENTS.md` → `AGENTS.md`
- `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md` → `docs/PRE_DEPLOY_PREVENTION_CHECKLIST.md`

Complete `PROJECT_CONTEXT.md` before feature coding.

## 3. Merge required package scripts

Add these scripts to the generated `package.json`:

```json
{
  "scripts": {
    "verify:env": "node scripts/verify-env.mjs",
    "verify:release": "node scripts/verify-release.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "quality": "npm run verify:env && npm run lint && npm run typecheck && npm run test:run && npm run build"
  }
}
```

Commit `package-lock.json` after installation. Do not rely on floating dependencies after bootstrap.

## 4. Configure environment

```bash
cp .env.example .env.local
```

Fill local values in `.env.local`. Never commit it.

Configure the same variable names separately in Netlify Deploy Preview and Production.

## 5. Configure routes

Register:
- Public `/status` using `StatusPage`
- Protected `/admin/diagnostics` using `AdminDiagnosticsPage`

The diagnostic page component does not replace authorization. Wrap it with the project's Admin route guard and enforce Admin authorization in the database/API layer.

## 6. Configure build metadata

In Netlify, inject:
- `VITE_APP_ENV`
- `VITE_APP_VERSION`
- `VITE_GIT_COMMIT_SHA`
- `VITE_BUILD_TIMESTAMP`
- `VITE_NETLIFY_CONTEXT`
- `VITE_NETLIFY_DEPLOY_ID`

Production is not verified until the displayed commit SHA matches the Netlify deploy commit.

## 7. Run first gate

```bash
npm ci
npm run quality
```

Then create a Pull Request and verify Netlify Deploy Preview:
- `/`
- direct refresh of `/status`
- login/logout/callback
- one RLS-protected CRUD flow
- Admin diagnostics access control
- commit SHA match

## 8. First vertical slice exit criteria

Do not build the full application until:
- Production build passes.
- Preview deploy passes.
- Deep-link refresh passes.
- Auth callback works.
- One protected CRUD flow passes for authorized and unauthorized roles.
- Diagnostics/status expose safe and correct release identity.
- Rollback point is recorded in `PROJECT_CONTEXT.md`.

## 9. Proven prevention patterns included
- SPA fallback in both `netlify.toml` and `public/_redirects`
- startup environment validation without printing values
- explicit application release metadata
- public status page
- protected diagnostics page pattern
- CI quality gate
- release verification script
- secret-like public variable rejection

## 10. Required adaptation
This starter is intentionally narrow. For projects not using React/Vite/Supabase/Netlify, keep the boot sequence, branch strategy, root-cause workflow, deployment proof and prevention controls, but document equivalent implementation details before coding.