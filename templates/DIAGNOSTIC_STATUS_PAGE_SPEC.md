# Diagnostic and Status Page Specification

Required for every deployed application.

## 1. Public `/status`

Purpose: prove which release is running and whether the application can reach required services without exposing private information.

### Required fields
- Application name
- Application version
- Environment: local / preview / production
- Git commit SHA, shortened for display but full value available to authorized diagnostics
- Build timestamp
- Frontend status
- Supabase reachability status using a safe operation
- Authentication configuration status: configured/not configured, never URLs containing secrets
- Last status refresh time

### Allowed status values
- `operational`
- `degraded`
- `unavailable`
- `unknown`

### Public status must not expose
- Email addresses or user IDs
- Access/refresh tokens
- Supabase anon/service key values
- Database schema details beyond a non-sensitive migration marker
- Raw exception stack traces
- Private Netlify URLs or internal IDs unless explicitly classified safe
- Full environment variable dump

### Behavior
- Must load without login.
- Must work after direct navigation and browser refresh.
- Dependency checks must have timeout and return `unknown` rather than hanging.
- A failed dependency must not crash the page.
- The page must clearly show release SHA to identify stale deploys.

## 2. Protected `/admin/diagnostics`

Purpose: allow an Admin to diagnose branch/deploy/environment/Auth/RLS problems quickly.

### Authorization
- Route hidden in normal navigation unless Admin.
- Server/database authorization must enforce Admin access; UI hiding alone is insufficient.
- Non-admin access returns a safe forbidden state, not diagnostic data.

### Required sections

#### Release identity
- Repository name
- Expected production branch
- App environment
- Full Git commit SHA
- App version
- Build timestamp
- Netlify deploy context
- Netlify deploy ID/SHA when injected safely

#### Supabase
- Project host only, not keys
- Reachability
- Current authenticated session: signed-in yes/no
- Current role from database authorization
- Latest application migration marker
- Realtime channel state when applicable

#### Configuration checks
- Required public variables: present/missing only
- OAuth callback mode: local/preview/production classification
- Router SPA fallback configured yes/no
- Feature flags names and boolean state only when non-sensitive

#### Client health
- Latest redacted client errors
- Failed network requests summarized by path/status without tokens or bodies
- Cache/build mismatch warning when displayed SHA differs from expected deploy SHA

### Required actions
- Refresh diagnostics
- Copy safe diagnostic report
- Run safe connectivity check
- Clear local application cache/session only with explicit confirmation
- Open status page

### Forbidden actions
- Display or copy secrets
- Modify database schema
- Override RLS
- Run arbitrary SQL
- Delete production data
- Reveal other users' PII

## 3. Safe metadata implementation pattern

Build-time public variables:

```dotenv
VITE_APP_NAME=
VITE_APP_ENV=
VITE_APP_VERSION=
VITE_GIT_COMMIT_SHA=
VITE_BUILD_TIMESTAMP=
VITE_NETLIFY_CONTEXT=
VITE_NETLIFY_DEPLOY_ID=
```

Rules:
- Values are generated/injected by CI/Netlify where possible.
- Never infer the current commit from UI text or package version alone.
- Display `unknown` if metadata is absent and fail the release gate for Production.

## 4. Safe Supabase reachability check

Use a dedicated low-risk mechanism such as:
- Read a public/safely RLS-protected one-row `app_health` view/table, or
- Call a safe RPC returning service time and migration marker.

Do not diagnose connectivity by querying user records or business data.

Suggested response:

```json
{
  "status": "operational",
  "server_time": "ISO-8601",
  "migration_marker": "20260722_001"
}
```

## 5. Required tests

- `/status` renders when dependency is healthy.
- `/status` renders degraded/unknown when dependency times out.
- Direct refresh of `/status` does not return 404.
- Non-admin cannot access diagnostics.
- Admin can access diagnostics.
- Diagnostic report contains expected safe metadata.
- Diagnostic report redacts token/key/password-like values.
- Missing commit SHA fails Production release verification.
- Displayed commit SHA matches injected build SHA.

## 6. Incident uses

Use diagnostics first for these proven recurring failures:
- Wrong branch or stale deploy: compare displayed SHA with GitHub/Netlify SHA.
- Missing environment variable: inspect present/missing matrix.
- OAuth callback mismatch: inspect environment/callback classification.
- Supabase connectivity or migration drift: inspect reachability and migration marker.
- Realtime issue: inspect channel state.
- Old cache: compare release metadata and offer confirmed local cache clear.

## 7. Definition of done

Diagnostic/status implementation is complete only when:
- Both routes exist.
- Deep-link refresh works.
- Authorization is enforced beyond UI.
- Secrets/PII redaction tests pass.
- Production release metadata is visible and correct.
- Dependency failure does not crash either page.
- The pages are included in post-deploy smoke tests.