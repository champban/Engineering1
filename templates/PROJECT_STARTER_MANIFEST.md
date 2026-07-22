# Project Starter Manifest

Use this manifest for new React/Vite/TypeScript + Supabase + Netlify applications.

## 1. Files that must exist before feature coding

| Path | Purpose | Mandatory check |
|---|---|---|
| `PROJECT_CONTEXT.md` | Project source of truth | Contains repo/branch/environment/deploy mapping |
| `CLAUDE.md` | Claude operating rules | References global boot sequence and stop conditions |
| `AGENTS.md` | ChatGPT/Codex operating rules | References global boot sequence and stop conditions |
| `.env.example` | Public variable names only | No secrets; includes all required local/preview/production variable names |
| `.gitignore` | Secret/build protection | Ignores `.env*` except `.env.example`, build output and local tool files |
| `netlify.toml` | Build, redirects and headers | Build command/output correct; SPA fallback committed |
| `public/_redirects` | SPA deep-link fallback | Contains `/* /index.html 200` when applicable |
| `.github/workflows/quality-gate.yml` | Automated PR gate | Runs clean install, env verification, lint, typecheck, tests and build |
| `src/lib/env.ts` | Typed startup validation | Fails fast for missing/malformed public variables without leaking values |
| `src/lib/app-meta.ts` | Version/environment metadata | Exposes safe release metadata only |
| `src/pages/StatusPage.tsx` | Public operational status | No PII or secrets |
| `src/pages/AdminDiagnosticsPage.tsx` | Protected diagnostics | Admin-only; redacted output |
| `src/lib/supabase.ts` | Supabase client | Uses anon public key only; no service-role key |
| `src/test/` | Regression tests | Includes env, routing, auth/RLS and diagnostics redaction tests |

## 2. Required package scripts

```json
{
  "scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "verify:env": "node scripts/verify-env.mjs",
    "verify:release": "node scripts/verify-release.mjs",
    "build": "npm run verify:env && npm run typecheck && vite build",
    "quality": "npm run lint && npm run typecheck && npm run test:run && npm run build"
  }
}
```

Adapt commands only when the project stack differs and document the equivalent in `PROJECT_CONTEXT.md`.

## 3. Required environment variables

Minimum public variables:

```dotenv
VITE_APP_NAME=
VITE_APP_ENV=local
VITE_APP_VERSION=0.0.0-dev
VITE_GIT_COMMIT_SHA=local
VITE_BUILD_TIMESTAMP=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Rules:
- Never place real values in `.env.example`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite/browser code.
- Local, Netlify Deploy Preview and Production values must be maintained separately.
- `src/lib/env.ts` must validate presence and format at startup.

## 4. Required first vertical slice

Before building the full application, prove this flow in Deploy Preview:

1. App boots with validated environment.
2. `/status` loads directly and after refresh.
3. Google/Supabase login redirects correctly.
4. Signed-in user profile loads.
5. One resource can be created and read.
6. Unauthorized access is rejected by RLS.
7. `/admin/diagnostics` rejects non-admin users.
8. GitHub commit SHA equals Netlify Preview deploy SHA.

Do not proceed to broad feature development until this slice passes.

## 5. Required reusable modules

Reuse or explicitly justify replacement of:
- Auth session/provider
- Profile bootstrap
- Workspace/calendar/project membership
- Invitation flow
- Role helpers
- Permission Matrix and RLS helpers
- Comment thread
- Realtime subscription lifecycle
- Audit timestamps and ownership fields
- Status and diagnostics
- Error boundary and user-safe error reporting

## 6. New project bootstrap checklist

- [ ] Read mandatory global files.
- [ ] Create repo and confirm production branch.
- [ ] Copy this starter structure.
- [ ] Create `PROJECT_CONTEXT.md` from template.
- [ ] Complete Requirement Lock items.
- [ ] Configure branch protection and Deploy Preview.
- [ ] Configure Supabase local/preview/production mapping.
- [ ] Configure OAuth redirect URLs.
- [ ] Run `npm ci` and `npm run quality`.
- [ ] Deploy first vertical slice.
- [ ] Verify SHA, deep-link refresh, Auth and RLS.
- [ ] Record last known-good commit/deploy.

## 7. Exit criteria for bootstrap

Bootstrap is complete only when:
- `npm run quality` passes from a clean checkout.
- Netlify Deploy Preview passes.
- `/status` and protected diagnostics work.
- Auth callback works.
- One RLS-protected CRUD flow passes.
- GitHub SHA and Netlify SHA match.
- Rollback point is recorded.