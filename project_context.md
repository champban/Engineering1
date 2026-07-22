# Project Context: AI Collaboration & Data Storage Reference

*บันทึกไว้อ้างอิงสำหรับโปรเจคในอนาคต — สรุปจากการคุยเรื่อง MCP, การ collaborate ระหว่าง Claude กับ ChatGPT, การเลือกที่เก็บข้อมูล และมาตรฐานป้องกันข้อผิดพลาดซ้ำ*

---

## 1. MCP (Model Context Protocol) คืออะไร
มาตรฐานเปิดจาก Anthropic ที่ให้ AI (Claude, ChatGPT, Cursor, Windsurf ฯลฯ) เชื่อมต่อกับเครื่องมือ/ข้อมูลภายนอกแบบเดียวกันหมด — เหมือน "USB port" ให้ AI เสียบเข้าระบบต่าง ๆ ได้

**หลักการ collaborate ข้าม AI**: ถ้า Claude และ ChatGPT ต่อเข้า MCP server *เดียวกัน* (เช่น Supabase) ทั้งคู่จะอ่าน/เขียนข้อมูลชุดเดียวกันได้แบบ real-time แม้อยู่คนละ session

**วิธีต่อ ChatGPT กับ MCP server เดียวกับ Claude**:
Settings → Apps → เปิด Developer Mode → เพิ่ม custom connector ด้วย URL เดียวกับที่ Claude ใช้

---

## 2. Connector ที่มีอยู่แล้ว และงานที่เหมาะ
| Connector | ใช้ทำอะไร |
|---|---|
| Google Drive | เก็บ/ดึงเอกสาร spec, รายงาน |
| Slack | สรุป/ค้นหา discussion ทีม |
| Supabase | เก็บข้อมูลแบบ database จริง, real-time |
| Netlify | deploy เว็บ/เครื่องมือให้เป็น URL ถาวร |
| Figma | ออกแบบ UI/mockup |

---

## 3. GitHub vs Supabase+Netlify — เลือกใช้เมื่อไหร่

| | GitHub | Supabase + Netlify |
|---|---|---|
| เก็บอะไร | โค้ด (version control) | ข้อมูล/state จริง และ hosting |
| การทำงานร่วมของ AI | commit → PR → merge | อ่าน/เขียน database และ deploy ตาม connector/tools |
| เหมาะกับ | พัฒนา/แชร์โค้ดของแอป | ข้อมูลที่เปลี่ยนบ่อย, Auth, realtime และ production hosting |

---

## 4. ความปลอดภัย & Backup

| | GitHub | Supabase |
|---|---|---|
| Access control | private repo + 2FA แต่ไม่มี row-level security | Row Level Security (RLS) ระดับ record |
| ข้อมูลลบแล้ว | commit เก่ายังอยู่ใน git history | ลบจาก database ตาม retention/backup policy |
| Backup | source code และ migrations มี history จาก commit | ต้องกำหนด backup/export และ restore plan ให้ชัดเจน |

---

## 5. แนวทางที่แนะนำ (Hybrid)
ใช้ **Supabase** เป็นระบบข้อมูล/Auth หลัก และใช้ **GitHub** เป็น source code, migrations และ structured export backup หลักตามรอบที่กำหนด

**สำคัญ**: Supabase ไม่ sync กับ GitHub หรือ Google Drive เองอัตโนมัติ ต้องมี export/backup process เสมอ

---

## 6. Backup ปลายทาง

| ปลายทาง | บทบาท |
|---|---|
| GitHub | source code, migrations, structured export และ long-term change history หลัก |
| Supabase | production database/Auth source of truth |
| Google Drive | เอกสารและ backup เสริมสำหรับการแชร์/เข้าถึง |

ห้ามเก็บ secret หรือข้อมูล sensitive ลง Git history

---

## 7. Mandatory Project Boot and Activation Sequence

ก่อนวางแผน สร้าง แก้ไข ทดสอบ Deploy หรือ Troubleshoot application ทุกโปรเจกต์ ต้องดำเนินการตามลำดับนี้:

1. อ่านไฟล์นี้จาก `champban/Engineering1` branch `Doc`
2. อ่าน `skills/github-netlify-supabase-prevention/SKILL.md`
3. อ่าน `skills/project-fast-safe-bootstrap/SKILL.md`
4. อ่าน `skills/progress-and-manual-assist/SKILL.md`
5. อ่าน `templates/AI_ASSET_REGISTRY.md`
6. อ่าน `PROJECT_CONTEXT.md` ที่ root ของ repo โปรเจกต์นั้น เมื่อ repo มีอยู่แล้ว
7. ยืนยัน Repository, working branch, production branch, Environment, Supabase project และ Netlify deploy target
8. ตรวจหา project-specific documents, skills, starter, design rules, data model, security rules, prior-project learning และ reusable modules ที่เกี่ยวข้อง
9. เสนอ **Activation Set** ให้ผู้ใช้ โดยแสดงว่าอะไรถูก activate อัตโนมัติและอะไรแนะนำให้เพิ่ม
10. ถามผู้ใช้ก่อนเริ่มสร้าง application ใหม่ว่า ต้องการให้ AI อ่าน/activate ข้อตกลง, skill, starter overlay, template หรือเอกสารเฉพาะเพิ่มเติมหรือไม่
11. รอผู้ใช้ยืนยัน Activation Set ก่อนเขียน code สำหรับโปรเจกต์ใหม่หรือ architectural change สำคัญ
12. หากดึงไฟล์ ยืนยัน context หรือหาความขัดแย้งไม่ได้ ให้แจ้งผู้ใช้และหยุด ห้ามเดา

### Proactive rule
- ห้ามรอให้ผู้ใช้จำชื่อไฟล์หรือสั่งเอง
- AI ต้องรู้ asset ที่มีอยู่จาก `templates/AI_ASSET_REGISTRY.md`
- AI ต้องแนะนำ asset ที่เหมาะกับ stack, scope และ risk ของงาน
- ถ้าผู้ใช้ไม่แน่ใจ ให้เสนอ safest minimal Activation Set
- Mandatory global assets อ่านอัตโนมัติโดยไม่ต้องถามซ้ำ แต่ยังต้องถามว่ามีข้อตกลงเฉพาะเพิ่มเติมหรือไม่

### New project baseline
โปรเจกต์ใหม่ต้องสร้าง:
- `PROJECT_CONTEXT.md` จาก `templates/PROJECT_CONTEXT_TEMPLATE.md`
- `CLAUDE.md` จาก `templates/CLAUDE.md` เมื่อ Claude อาจทำงานใน repo
- `AGENTS.md` จาก `templates/AGENTS.md` เมื่อ ChatGPT/Codex อาจทำงานใน repo
- ใช้ starter ที่ตรง stack จาก asset registry

ก่อน Deploy ต้องใช้:
- `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md`
- Deployment gate และ branch strategy ที่ระบุใน Activation Set

---

## 8. Available Reusable Assets

Source of truth ฉบับเต็มอยู่ที่ `templates/AI_ASSET_REGISTRY.md`

Assets ที่พร้อมใช้ปัจจุบัน:
- `skills/github-netlify-supabase-prevention/SKILL.md`
- `skills/project-fast-safe-bootstrap/SKILL.md`
- `skills/progress-and-manual-assist/SKILL.md`
- `templates/PROJECT_CONTEXT_TEMPLATE.md`
- `templates/PRE_DEPLOY_PREVENTION_CHECKLIST.md`
- `templates/PROJECT_STARTER_MANIFEST.md`
- `templates/BRANCH_STRATEGY_AND_RELEASE_FLOW.md`
- `templates/DEPLOYMENT_GATE_AUTOMATION.md`
- `templates/DIAGNOSTIC_STATUS_PAGE_SPEC.md`
- `templates/ROOT_CAUSE_AND_INCIDENT_WORKFLOW.md`
- `templates/CLAUDE.md`
- `templates/AGENTS.md`
- `starter/react-vite-supabase-netlify/`

ทุกครั้งที่สร้าง/แก้/ยกเลิก reusable asset ต้องอัปเดต `templates/AI_ASSET_REGISTRY.md` ใน logical change เดียวกัน

---

## 9. Mandatory Prevention and Non-Recurrence Rules

เป้าหมายหลักไม่ใช่เพียงแก้ error แต่ต้องป้องกันไม่ให้ error เดิมเกิดซ้ำ

### 9.1 Incident closure rule
Incident หรือ bug สำคัญจะถือว่า `Closed` ได้เมื่อครบทุกข้อ:
1. ยืนยัน Root cause ด้วย evidence
2. แก้ไขและ verify ใน environment ที่เกี่ยวข้อง
3. เพิ่ม Prevention Control
4. เพิ่ม regression test/check หรือระบุเหตุผลชัดเจนว่าทำ automation ไม่ได้
5. อัปเดต `PROJECT_CONTEXT.md`, rollback และ Known Issues

### 9.2 Prevented Recurrence Register
ทุกโปรเจกต์ต้องมีตารางนี้ใน `PROJECT_CONTEXT.md`:

| ID | Symptom | Root cause | Fix | Prevention control | Automated test/check | Commit/Deploy | Status |
|---|---|---|---|---|---|---|---|

ห้ามบันทึกเพียง “แก้อะไร” ต้องบันทึก “ป้องกันอย่างไร” ด้วยเสมอ

### 9.3 Mandatory workflow

`Read context → Propose Activation Set → User confirmation → Define acceptance criteria → Reproduce/Classify when fixing → Collect evidence → Isolate root cause → Backup/rollback point → Small fix → Local production build → Test → Commit → Push → Deploy Preview → Verify SHA → Production deploy → Smoke test → Record prevention`

### 9.4 Deployment proof
ก่อนยืนยันว่า Production ใช้งานได้ ต้องตรวจ:
- Repository ถูกต้อง
- Branch ถูกต้อง
- GitHub commit SHA ตรงกับ Netlify Deploy SHA
- Supabase migration version ถูกต้อง
- Auth/RLS critical flow ผ่าน
- Post-deploy smoke test ผ่าน
- `/status` และ protected diagnostics แสดง release/environment ที่ถูกต้องโดยไม่เปิดเผย secret

### 9.5 Performance targets for similar future projects
- ลดเวลา setup/deployment อย่างน้อย 50%
- ลด failed deploy 50–70%
- ลดเวลา Root-cause analysis 40–60%
- ลด rework อย่างน้อย 50%
- ลดการเกิดซ้ำของ known errors อย่างน้อย 80%

ต้องเก็บ baseline และ actual result ใน `PROJECT_CONTEXT.md` ห้ามอ้างว่าเร็วขึ้นโดยไม่มีข้อมูล

### 9.6 Progress reporting and manual acceleration
สำหรับงานหลายขั้นตอน งานที่ต้องใช้หลาย tools งาน deploy/troubleshoot หรือใช้เวลานาน:
- ต้องรายงานความคืบหน้าเป็นเปอร์เซ็นต์หลัง milestone สำคัญ โดยใช้ค่า 0–100%
- Progress update ต้องระบุ Completed, Remaining, User action และ Blocker
- ห้ามรายงาน 100% จนกว่า verification และ documentation ที่จำเป็นจะเสร็จ
- ทุก stage ต้องประเมินว่ามีขั้นตอนใดที่ผู้ใช้ทำ manual ได้เร็วกว่า หรือเป็นขั้นตอนที่ AI ทำไม่ได้ เช่น OAuth approval, secret entry, restricted UI, local verification หรือ production account check
- หากผู้ใช้ทำได้เร็วกว่า ให้สั่งทันทีเป็น numbered steps พร้อม expected result และหลักฐานที่ต้องส่งกลับ
- ห้ามให้ผู้ใช้ส่ง password, token, service-role key, secret หรือข้อมูลลูกค้าที่ sensitive เข้ามาใน chat
- ห้ามโยนงานให้ผู้ใช้ถ้า AI ทำเองได้อย่างปลอดภัยผ่าน connector/tool
- Manual step ที่เกิดซ้ำต้องถูกเปลี่ยนเป็น automation backlog, reusable checklist หรือ documented unavoidable control
