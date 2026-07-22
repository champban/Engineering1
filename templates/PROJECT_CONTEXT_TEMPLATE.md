# PROJECT_CONTEXT

## 1. Project Overview
- Project name:
- Business objective:
- Primary users:
- Current phase:
- Production URL:
- Repository:
- Production branch:
- Netlify site/project:
- Supabase project/environment:

## 2. Architecture / Tech Stack
- Frontend:
- Backend/API:
- Database:
- Authentication:
- Hosting:
- CI/CD:
- Monitoring/Logging:

## 3. Mandatory Global References
Before any application change, read:
1. `champban/Engineering1` branch `Doc` → `project_context.md`
2. `champban/Engineering1` branch `Doc` → `skills/github-netlify-supabase-prevention/SKILL.md`
3. `champban/Engineering1` branch `Doc` → `skills/project-fast-safe-bootstrap/SKILL.md`
4. `champban/Engineering1` branch `Doc` → `skills/progress-and-manual-assist/SKILL.md`
5. `champban/Engineering1` branch `Doc` → `skills/project-performance-kpi/SKILL.md`
6. `champban/Engineering1` branch `Doc` → `templates/AI_ASSET_REGISTRY.md`

Before Production deployment, also read and execute:
7. `champban/Engineering1` branch `Doc` → `skills/webapp-security-6d-audit/SKILL.md`
8. `champban/Engineering1` branch `Doc` → `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md`

If a required file cannot be retrieved, stop and inform the user. Do not guess.

## 4. Roles and Permission Matrix
| Resource/Action | Admin | Owner | Member | Invited | Unauthorized |
|---|---:|---:|---:|---:|---:|
| View | | | | | |
| Create | | | | | |
| Update | | | | | |
| Delete | | | | | |
| Comment | | | | | |

Security rules must be enforced by Supabase RLS/database policies, not only by UI controls.

## 5. Data Model and Migrations
- Main entities:
- Relationships:
- Latest migration in repository:
- Latest migration applied to each environment:
- Destructive migration backup location:
- Restore procedure:

## 6. Environment Matrix
| Item | Local | Preview | Production |
|---|---|---|---|
| Branch | | | |
| Supabase URL/environment | | | |
| OAuth callback | | | |
| Netlify context | | | |
| Public environment variables | | | |

Never place secret values in this document.

## 7. Deployment Mapping
| Environment | GitHub branch | Expected commit SHA | Netlify deploy SHA | Verification date |
|---|---|---|---|---|
| Preview | | | | |
| Production | | | | |

## 8. Key Decisions
| Date | Decision | Reason | Consequence | Revisit condition |
|---|---|---|---|---|

## 9. Current Status
- Last verified working commit:
- Last verified Netlify deploy:
- Last verified Supabase migration:
- Features working:
- Features under test:

## 10. Deploy Discipline
Mandatory workflow:

`Read context → Activation Set → User confirmation → Acceptance criteria → KPI timing → Reproduce/Classify → Evidence → Root cause → Backup/rollback → Small fix → Build/Test → Commit/Push → Deploy Preview → Verify SHA → 6D Audit → Production deploy → Smoke test → Prevention/KPI update`

Production deployment is prohibited until all required gates in the prevention skill and 6D audit pass.

## 11. Test Matrix
| Test ID | Role | Scenario | Expected result | Automated/manual | Last result |
|---|---|---|---|---|---|

Minimum identities for collaboration apps:
- Admin
- Resource owner
- Member/non-owner
- Invited but not accepted
- Unauthorized user

## 12. Rollback Procedure
- Safe rollback commit:
- Last known-good Netlify deploy:
- Database rollback/forward-fix approach:
- Backup location and timestamp:
- Responsible verification steps:

## 13. Prevented Recurrence Register
Every significant incident must include a prevention control. An incident cannot be closed with only a fix.

| ID | Symptom | Root cause | Fix | Prevention control | Automated test/check | Commit/Deploy | Status |
|---|---|---|---|---|---|---|---|

Closure criteria:
1. Root cause confirmed with evidence
2. Fix verified in Preview and Production where applicable
3. Prevention control implemented
4. Regression test/check added, or documented reason automation is impractical
5. Rollback and documentation updated

## 14. Known Issues / Open Bugs
| Priority | Issue | Impact | Evidence | Owner | Next action |
|---|---|---|---|---|---|

## 15. Backlog
| Priority | Item | Acceptance criteria | Dependency | Status |
|---|---|---|---|---|

## 16. Backup Policy
- Supabase: production data/Auth source of truth; backup/export before destructive changes
- GitHub: source code, migrations and structured export backupหลัก
- Google Drive: supporting documents and supplementary backup
- Never commit secrets or sensitive production records to Git history

## 17. Lessons Learned
| Date | Learning | Standardized action | Reusable in future projects? |
|---|---|---|---|

## 18. Project Performance KPI
Required file: `docs/PROJECT_PERFORMANCE_KPI.md`

- Comparable baseline:
- Comparison class: Directly comparable / Partially comparable / Not comparable
- M0 start timestamp:
- M4 RC/Quality Gate target:
- M6 Production Verified target:
- Current highest verified milestone:
- Actual elapsed time:
- Failed deploy count:
- Rework cycles:
- Known-error recurrence count:
- Prevention closure rate:

Do not claim an improvement percentage without equivalent milestones, timestamps and scope classification.

## 19. Web App Security 6D Audit Register
Required report: `docs/SECURITY_6D_AUDIT.md`

| Audit date | Commit SHA | Environment | Identity & access | Secrets & data | Input safety | Browser/network | Supply chain/deploy | Operations/recovery | Decision | Report |
|---|---|---|---|---|---|---|---|---|---|---|

Allowed dimension status: `Not started`, `In progress`, `Pass`, `Conditional`, `Blocked`.

Deployment rules:
- Production requires `PASS` or an allowed `CONDITIONAL PASS`.
- Critical findings block deployment.
- High findings block deployment unless fixed or explicitly accepted under the 6D policy with owner and expiry.
- Any material change affecting an audited dimension requires targeted re-audit.
