# 📝 Handover Notes: สรุปสิ่งที่ทำไปล่าสุด (EduFlow)
**วันที่อัปเดตล่าสุด:** 4 กันยายน 2026

เอกสารนี้สรุปสถานะปัจจุบันของโปรเจกต์ **EduFlow** และสิ่งที่จำเป็นต้องทำต่อ

---

## 1. 🔑 ระบบ Auth & Role-Based Access (เสร็จแล้ว ✅)
* ระบบ Next-Auth + Google OAuth
* Middleware ตรวจ `ac_tk` cookie และ refresh token flow
* Role-based permissions: `ADMIN`, `TEACHER`, `STUDENT`
* การจัดการโปรไฟล์และคอร์สตามสิทธิ์ของ Role

---

## 2. 👥 การจัดการคอร์ส & นักเรียน (เสร็จแล้ว ✅)
* หน้า `/course` และ `/course/[id]`
* จัดการ Syllabus และบทเรียน
* หน้า **Manage Students** (`/course/[id]/students`) — ดูรายชื่อนักเรียน, ค้นหา, และเพิ่มนักเรียนเข้าคอร์ส

---

## 3. 📝 ระบบ Test, Anti-Cheat & Dashboard (เสร็จแล้ว ✅ — 4 ก.ย. 2026)

### 3.1 ข้อสอบ & การจำกัด Attempt
* กำหนด `durationMinutes` ตอนสร้างข้อสอบได้
* นักเรียนทำข้อสอบได้สูงสุด **2 ครั้ง (Max 2 Attempts)**
* ระบบ **Anti-Cheat Guard** (ตรวจจับ fullscreen / tab blur) — หากทำผิดเกินกำหนด จะทำการ auto-submit และคำนวณคะแนนตามข้อที่ตอบไว้ทันที

### 3.2 Teacher Test Score Dashboard
* **Backend:** `GET /test/:id/dashboard` — ดึงข้อมูลนักเรียนทั้งหมดในคอร์ส พร้อมคะแนน attempt 1, 2, best score, percentage, timestamp และสถานะ cheat
* **Frontend:**
  * หน้า `/course/[id]/test/dashboard` — สรุปรายการแบบทดสอบทั้งหมดในคอร์ส
  * หน้า `/course/[id]/test/dashboard/[testId]` — ตารางคะแนนนักเรียนรายบุคคลพร้อมตัวกรอง/เรียงลำดับ, Top 3 highlights, progress bar และ summary stats cards

---

## 📋 สิ่งที่ต้องทำต่อ (Next Steps)

### 🔴 Priority สูง
1. **เพิ่มเมนู "Dashboard Score" ใน Course Sidebar**
   - เพิ่มเมนูใน [`CourseSidebar.tsx`](file:///d:/project/edu-flow-app/apps/edu-flow-front/src/components/course/CourseSidebar.tsx) ให้เฉพาะ Teacher/Admin เห็น เพื่อกดเข้าหน้า Dashboard ได้สะดวกรวดเร็ว

2. **ตรวจสอบและแก้ไข API การลบ Test (Delete Test)**
   - ตรวจสอบว่า `DELETE /test/:id` มีใน Backend หรือยัง และตรวจสอบการผูก logic ฝั่ง Frontend ในหน้าจัดการข้อสอบ

### 🟡 Priority กลาง
3. **Export Test Scores**
   - ฟีเจอร์ Export ตารางคะแนนนักเรียนเป็น CSV หรือ Excel
4. **Question Breakdown View (Phase ถัดไป)**
   - ดูผลการตอบแบบเจาะลึกรายข้อสำหรับครู
