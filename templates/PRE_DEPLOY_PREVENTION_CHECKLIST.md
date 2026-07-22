# Pre-Deploy Prevention Checklist

ใช้ Checklist นี้ก่อน Deploy Preview และ Production ทุกครั้ง

## A. Context and Scope
- [ ] อ่าน global `project_context.md` แล้ว
- [ ] อ่าน prevention skill แล้ว
- [ ] อ่าน `PROJECT_CONTEXT.md` ของโปรเจกต์แล้ว
- [ ] อ่าน `skills/webapp-security-6d-audit/SKILL.md` แล้ว
- [ ] ยืนยัน repository, branch, target environment และ deploy target
- [ ] Scope และ acceptance criteria ชัดเจน
- [ ] ระบุไฟล์/ระบบที่เปลี่ยน และไม่มี unrelated change

## B. Root Cause and Change Safety
- [ ] กรณี bug: reproduce ได้และมี expected vs actual
- [ ] Classify error แล้ว ไม่ได้สุ่มแก้หลายชั้นพร้อมกัน
- [ ] มี evidence จาก Console/Network/Logs/SHA ตามประเภทปัญหา
- [ ] Root cause ยืนยันแล้ว
- [ ] ระบุ rollback commit/deploy
- [ ] Backup แล้วก่อน destructive database/data change

## C. Git and Source Control
- [ ] Diff ผ่านการ review
- [ ] ไม่มี `.env`, secret key, token หรือ sensitive data
- [ ] Commit เป็น logical change ขนาดเล็ก
- [ ] Commit message อธิบาย intent ชัดเจน
- [ ] Branch ถูกต้อง
- [ ] Remote commit SHA ถูกบันทึก

## D. Build Quality
- [ ] Clean install สำเร็จ
- [ ] Lint ผ่าน
- [ ] Typecheck ผ่าน
- [ ] Unit/integration test ที่เกี่ยวข้องผ่าน
- [ ] Production build ผ่าน
- [ ] ไม่มี critical warning ที่ถูกละเลยโดยไม่มีเหตุผล

## E. Supabase / Security
- [ ] Schema และ migration อยู่ใน Git
- [ ] Migration order ถูกต้อง
- [ ] Applied migration version ตรงกับ environment
- [ ] Permission Matrix ได้รับการอัปเดต
- [ ] RLS test ผ่านสำหรับ Admin, Owner, Member และ Unauthorized
- [ ] Service-role/secret key ไม่ถูกใช้ใน browser/client
- [ ] Auth redirect URLs ครบ local/preview/production
- [ ] Backup/restore procedure พร้อมสำหรับ change ที่มีความเสี่ยง

## F. Web App Security 6D Audit Gate
- [ ] สร้าง/อัปเดต `docs/SECURITY_6D_AUDIT.md`
- [ ] Dimension 1 — Identity and access: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] Dimension 2 — Secrets and data: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] Dimension 3 — Input and content safety: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] Dimension 4 — Browser and network controls: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] Dimension 5 — Supply chain and deployment: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] Dimension 6 — Operations and recovery: ผ่านหรือมี remediation ที่อนุมัติแล้ว
- [ ] ไม่มี Critical finding ที่ยังเปิดอยู่
- [ ] ไม่มี High finding ที่ยังไม่ได้แก้หรือไม่ได้รับ explicit approval ตาม policy
- [ ] Audit decision เป็น `PASS` หรือ `CONDITIONAL PASS`
- [ ] Audit commit SHA/environment ตรงกับ build ที่กำลังจะ deploy
- [ ] สรุปผล audit และ report link ใน `PROJECT_CONTEXT.md`

## G. Netlify Preview Gate
- [ ] Netlify deploy จาก branch/commit ที่คาดไว้
- [ ] Preview build สำเร็จ
- [ ] GitHub commit SHA = Preview deploy SHA
- [ ] Homepage เปิดได้
- [ ] Direct/deep-link refresh ไม่เกิด 404
- [ ] Login, logout และ callback ผ่าน
- [ ] Critical CRUD flow ผ่าน
- [ ] Permission/RLS behavior ผ่าน
- [ ] Error state และ empty state ไม่พัง
- [ ] Mobile/responsive smoke test ผ่านตาม scope
- [ ] Diagnostic page แสดง environment/version/SHA ถูกต้องโดยไม่เปิดเผย secret

## H. Production Gate
- [ ] Preview ผ่านครบ
- [ ] 6D Audit Gate ผ่านครบ
- [ ] Reviewed commit ถูก merge เข้า production branch
- [ ] Production deploy สำเร็จ
- [ ] GitHub production SHA = Netlify production deploy SHA
- [ ] Production smoke test ผ่าน
- [ ] Supabase production migration ตรวจสอบแล้ว
- [ ] Monitoring/log ไม่มี error ใหม่ที่สำคัญ
- [ ] Last known-good deploy/rollback พร้อม

## I. Prevention Closure
- [ ] อัปเดต `PROJECT_CONTEXT.md`
- [ ] อัปเดต Current Status และ deployment mapping
- [ ] บันทึก incident ใน Prevented Recurrence Register
- [ ] เพิ่ม prevention control แล้ว
- [ ] เพิ่ม regression test/check แล้ว หรือบันทึกเหตุผลที่ automate ไม่ได้
- [ ] อัปเดต Known Issues/Backlog
- [ ] อัปเดต `docs/PROJECT_PERFORMANCE_KPI.md`

## Stop Conditions
หยุด Deploy และแจ้งผู้ใช้ทันทีเมื่อ:
- ดึง global/project context ไม่ได้
- ไม่ทราบ branch หรือ deploy target ที่แน่นอน
- Root cause ยังไม่ชัดแต่กำลังจะเปลี่ยนหลายระบบ
- Production build ไม่ผ่าน
- Preview ไม่ผ่าน
- SHA ไม่ตรงกัน
- RLS/security test ไม่ผ่าน
- ไม่มี backup สำหรับ destructive data change
- พบ secret ใน source/diff/log
- ไม่มี `docs/SECURITY_6D_AUDIT.md`
- 6D audit decision เป็น `BLOCKED` หรือยังไม่มี decision
- มี Critical finding ที่ยังเปิดอยู่
- มี High finding ที่ยังไม่ได้แก้หรือไม่ได้รับ explicit approval ตาม policy
