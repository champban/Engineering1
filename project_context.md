# Project Context: AI Collaboration & Data Storage Reference

*บันทึกไว้อ้างอิงสำหรับโปรเจคในอนาคต — สรุปจากการคุยเรื่อง MCP, การ collaborate ระหว่าง Claude กับ ChatGPT, และการเลือกที่เก็บข้อมูล*

---

## 1. MCP (Model Context Protocol) คืออะไร
มาตรฐานเปิดจาก Anthropic ที่ให้ AI (Claude, ChatGPT, Cursor, Windsurf ฯลฯ) เชื่อมต่อกับเครื่องมือ/ข้อมูลภายนอกแบบเดียวกันหมด — เหมือน "USB port" ให้ AI เสียบเข้าระบบต่าง ๆ ได้

**หลักการ collaborate ข้าม AI**: ถ้า Claude และ ChatGPT ต่อเข้า MCP server *เดียวกัน* (เช่น Supabase) ทั้งคู่จะอ่าน/เขียนข้อมูลชุดเดียวกันได้แบบ real-time แม้อยู่คนละ session

**วิธีต่อ ChatGPT กับ MCP server เดียวกับ Claude**:
Settings → Apps → เปิด Developer Mode (beta, ต้องแผน Plus ขึ้นไป) → เพิ่ม custom connector ด้วย URL เดียวกับที่ Claude ใช้

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

| | GitHub | Supabase + Netlify (MCP) |
|---|---|---|
| เก็บอะไร | โค้ด (version control) | ข้อมูล/state จริง (real-time) |
| การทำงานร่วมของ AI | commit → PR → merge (ไม่ real-time) | เขียน/อ่าน database ตรง ๆ (real-time) |
| เหมาะกับ | พัฒนา/แชร์โค้ดของแอป | ข้อมูลที่เปลี่ยนบ่อย เช่น todo list, log |

**ราคา (free tier เพียงพอสำหรับโปรเจคเล็ก)**
- GitHub: ฟรี 100% ไม่มีเงื่อนไข (repo/collaborator ไม่จำกัดสำหรับบุคคล)
- Supabase: ฟรี แต่ project pause ถ้าไม่ใช้ 7 วัน — Pro $25/เดือน
- Netlify: ฟรี 300 credits/เดือน — Personal $9 / Pro $19-20/เดือน

---

## 4. ความปลอดภัย & Backup

| | GitHub | Supabase |
|---|---|---|
| Access control | private repo + 2FA (แต่ไม่มี row-level security) | Row Level Security (RLS) ระดับ record จริง |
| ข้อมูลลบแล้ว | **ไม่หายจริง** — อยู่ใน git history ตลอดไป (ปัญหาถ้าเป็นข้อมูล sensitive) | ลบแล้วลบจริง |
| Backup (free tier) | ทุก commit = backup ฟรีตลอดไป | **ไม่มี backup อัตโนมัติเลย** ในแผนฟรี |
| Backup (paid) | เหมือนเดิม (ฟรีอยู่แล้ว) | Pro $25 = daily backup เก็บ 7 วัน |

---

## 5. แนวทางที่แนะนำ (Hybrid)
ใช้ **Supabase** เป็นที่เก็บข้อมูลใช้งานจริง (ได้ RLS + real-time collaboration ระหว่าง Claude/ChatGPT)
**บวก** export ข้อมูลเป็น JSON ไป commit เก็บใน **GitHub repo** เป็นระยะ (เช่นทุกคืน)
→ ได้ทั้งความปลอดภัยระดับ record ของ Supabase และ backup ฟรีตลอดไปจาก git history โดยไม่ต้องจ่าย Supabase Pro

**สำคัญ**: Supabase ไม่ sync กับ GitHub หรือ Google Drive เองอัตโนมัติ — ต้องมี export/backup process เสมอ ไม่ว่าจะเลือกปลายทางใด

**Use case แรกที่จะทดสอบแนวทางนี้**: Todo Planner (โครงสร้างข้อมูลง่าย, เสี่ยงต่ำ, เห็นประโยชน์ของ real-time ชัดเจน) ก่อนนำไปใช้กับโปรเจคที่ stakes สูงกว่า เช่น palletizer/HVAC tools

---

## 6. Backup ปลายทาง: GitHub (หลัก) vs Google Drive (เสริม)

| | GitHub (หลัก) | Google Drive (เสริม) |
|---|---|---|
| Version history | เก็บทุก commit ตลอดไป ฟรี | เก็บ version ~30 วัน หรือ 100 เวอร์ชันล่าสุด (แผนฟรี) |
| ลบไฟล์ | commit เก่ายังอยู่ใน history เสมอ | ลบแล้วเข้าถังขยะ 30 วัน แล้วหายจริง |
| จุดแข็ง | archive ระยะยาว, ไม่มีวันหาย | เข้าถึง/แชร์ไฟล์กับคนอื่นง่าย, ต่อ connector ไว้แล้ว |
| บทบาทที่แนะนำ | **backup หลัก** — export JSON ไป commit เป็นระยะ | **สำรองเสริม** หรือใช้แชร์ไฟล์ทำงานทั่วไป ไม่ใช่ archive ระยะยาว |

**สรุป**: ใช้ GitHub เป็นที่ backup หลักของข้อมูล todo planner (และโปรเจคอื่นในอนาคต) ส่วน Google Drive ใช้เป็นทางเลือกเสริมเวลาต้องการแชร์ไฟล์เร็ว ๆ หรือทำงานร่วมกับเอกสารอื่นที่ไม่ใช่ archive หลัก
