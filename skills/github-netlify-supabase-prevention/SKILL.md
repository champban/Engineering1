---
name: github-netlify-supabase-prevention
description: Mandatory prevention workflow for web applications using GitHub, Netlify and Supabase. Use before modifying, testing, deploying or troubleshooting any project with this stack.
version: 1.0.0
---

# GitHub + Netlify + Supabase Prevention Skill

## Purpose
ป้องกันข้อผิดพลาดเดิมไม่ให้เกิดซ้ำ ลดการเดา ลด failed deploy และทำให้ทุกการแก้ไขตรวจสอบย้อนกลับได้

## Mandatory trigger
ต้องใช้ Skill นี้เมื่อมีงานอย่างใดอย่างหนึ่ง:
- สร้างหรือแก้ Web Application
- เปลี่ยน GitHub branch, source code หรือ configuration
- Deploy/rollback บน Netlify
- เปลี่ยน Supabase schema, migration, Auth, RLS หรือ environment variables
- แก้ปัญหา build, runtime, login, permission, database หรือ production

## Mandatory boot sequence
1. อ่าน `project_context.md` จาก `champban/Engineering1` branch `Doc`
2. อ่านไฟล์นี้
3. อ่าน `PROJECT_CONTEXT.md` ของ repo ที่กำลังทำงาน
4. ยืนยัน Repository, Branch, Environment และ Deployment target
5. หากดึงไฟล์ใดไม่ได้ ให้หยุดและแจ้งผู้ใช้ ห้ามเดา

## Core prevention principles
1. **One source of truth** — GitHub เก็บ source code และ migrations; Supabase เก็บ production data/Auth; Netlify deploy จาก branch ที่ระบุชัดเจน
2. **One logical change per commit** — ห้ามรวม UI, Auth, RLS และ deployment configuration โดยไม่มีเหตุผล
3. **Root cause before patch** — ห้ามแก้ symptom ก่อน classify error
4. **Preview before production** — ใช้ Deploy Preview ก่อน merge เข้า production branch
5. **Proof before claim** — ห้ามบอกว่าแก้สำเร็จจนกว่าจะมี build/test/deploy evidence
6. **Rollback first** — ก่อนแก้ความเสี่ยงสูงต้องระบุ rollback point
7. **Prevention closure** — Incident ยังไม่ปิดจนกว่าจะบันทึกวิธีป้องกันการเกิดซ้ำ

## Error classification gate
ก่อนแก้ต้องจัดประเภทอย่างน้อยหนึ่งประเภท:
- Source/branch/commit mismatch
- Dependency/install error
- Build/type/lint error
- Routing/SPA redirect error
- Runtime/browser error
- Environment variable/configuration error
- Google OAuth/Supabase Auth redirect error
- Database schema/migration error
- RLS/permission error
- Realtime/state/cache error
- Netlify deploy/cache/domain error

ถ้ายังจัดประเภทไม่ได้ ให้รวบรวม evidence ก่อน ห้ามสุ่มแก้หลายจุด

## Evidence collection order
1. Reproduce ด้วยขั้นตอนที่แน่นอน
2. บันทึก expected vs actual result
3. ตรวจ Browser Console
4. ตรวจ Network request/response/status
5. ตรวจ Netlify build/deploy log
6. ตรวจ Supabase Auth/Database/RLS log ตามประเภทปัญหา
7. ตรวจ Repository → Branch → Commit SHA → Netlify Deploy SHA
8. ตรวจ migration version และ environment name

## Change control
ก่อนแก้:
- ระบุไฟล์/ระบบที่จะเปลี่ยน
- ระบุความเสี่ยงและผลกระทบ
- ระบุ test ที่ต้องผ่าน
- ระบุ rollback commit/deploy

ระหว่างแก้:
- เปลี่ยนเฉพาะ root cause ที่พิสูจน์ได้
- ห้ามแก้ unrelated code
- ห้ามเปลี่ยน dependency version โดยไม่จำเป็น
- ห้ามแก้ production data โดยไม่มี backup

หลังแก้:
- Local production build
- Relevant automated/manual tests
- Deploy Preview
- Verify commit SHA
- Production deploy เฉพาะเมื่อ Preview ผ่าน
- Post-deploy smoke test

## Mandatory prevention controls by failure mode

| Failure mode | Prevention control | Required evidence |
|---|---|---|
| Netlify deploy ผิด branch/commit | ระบุ production branch และแสดง commit SHA ใน app diagnostic | GitHub SHA ตรงกับ Netlify deploy SHA |
| Local ผ่านแต่ production พัง | รัน production build และ Preview deploy | build log + Preview URL/test result |
| Refresh route แล้ว 404 | เก็บ SPA redirect/config ใน starter template | deep-link refresh test ผ่าน |
| Environment variable ขาด/ชื่อผิด | ใช้ `.env.example` และ environment matrix; validate ตอน startup โดยไม่เปิดเผย secret | variable names ครบทุก environment |
| Google login redirect ผิด | เก็บ approved redirect URLs สำหรับ local/preview/production | login/logout/callback test ผ่าน |
| RLS ปฏิเสธหรือเปิดกว้างเกินไป | Permission matrix + SQL/RLS test ด้วยหลาย role | Admin/Owner/Member/Unauthorized cases ผ่าน |
| Migration ไม่ตรง production | migrations อยู่ใน Git; track latest applied migration | repo migration version ตรง database |
| หน้าเว็บยังเป็น version เก่า | แสดง app version/commit SHA; ตรวจ deploy cache | diagnostic page แสดง SHA ล่าสุด |
| แก้แล้วเกิด regression | Small commit + regression test + rollback point | tests ผ่านและ revert path ชัดเจน |
| Debug วนซ้ำ | Incident log ระบุ symptom, evidence, root cause, fix, prevention | เพิ่มรายการใน Prevented Recurrence Register |
| Secret รั่วใน repo/log | ใช้ environment secret store; secret scanning; ห้าม commit `.env` | git diff ไม่มี secret |
| Supabase data สูญหาย | backup/export ก่อน migration เสี่ยงสูง | backup location และ timestamp |

## Deployment gates
ห้าม Production deploy ถ้า Gate ใดไม่ผ่าน:

### Gate A — Context
- อ่าน global และ project context แล้ว
- ยืนยัน repo/branch/environment
- scope และ acceptance criteria ชัดเจน

### Gate B — Code quality
- install สำเร็จ
- lint/typecheck ผ่าน
- production build ผ่าน
- ไม่มี secret ใน diff

### Gate C — Data and security
- migration review แล้ว
- backup พร้อมสำหรับ destructive change
- RLS test ผ่านตาม Permission Matrix
- service-role key ไม่อยู่ฝั่ง client

### Gate D — Preview
- Netlify Deploy Preview สำเร็จ
- Auth callback ถูกต้อง
- deep-link refresh ผ่าน
- critical user flow ผ่าน desktop/mobile ตาม scope

### Gate E — Production
- merge จาก reviewed commit
- GitHub SHA = Netlify Deploy SHA
- smoke test ผ่าน
- diagnostic/version ถูกต้อง
- rollback deploy พร้อม

## Required test identities
สำหรับระบบ collaboration ต้องมีอย่างน้อย:
- Admin
- Resource owner
- Member/non-owner
- Invited but not accepted
- Unauthorized user

## Incident closure: Prevented Recurrence Register
ทุก error ที่ใช้เวลาแก้นานหรือมีโอกาสเกิดซ้ำ ต้องบันทึกใน `PROJECT_CONTEXT.md`:

| ID | Symptom | Root cause | Fix | Prevention control | Automated test/check | Commit/Deploy | Status |
|---|---|---|---|---|---|---|---|

สถานะ `Closed` ได้เมื่อ:
1. Root cause ยืนยันแล้ว
2. Fix ผ่าน test และ production verification
3. มี prevention control
4. มี test/check ป้องกัน regression หรือมีเหตุผลว่าทำ automation ไม่ได้
5. เอกสารและ rollback ได้รับการอัปเดต

## Standard workflow
`Read context → Define acceptance criteria → Reproduce → Classify → Collect evidence → Isolate root cause → Backup/rollback point → Small fix → Local production build → Test → Commit → Push → Deploy Preview → Verify SHA → Production deploy → Smoke test → Record prevention`

## Backup policy
- Supabase: ระบบข้อมูล/Auth หลัก; export/backup ก่อน destructive migration
- GitHub: source code, migrations และ structured export backup หลัก
- Google Drive: เอกสารและ backup เสริม
- ห้ามเก็บ secret หรือข้อมูล sensitive ลง Git history

## Performance targets
- ลดเวลา setup/deployment ≥ 50%
- ลด failed deploy 50–70%
- ลดเวลา root-cause analysis 40–60%
- ลด rework ≥ 50%
- ลด recurrence ของ known errors ≥ 80%
