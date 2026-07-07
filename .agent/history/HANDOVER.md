# 📝 Handover Notes: สรุปสิ่งที่ทำไปล่าสุด (EduFlow)
**วันที่อัปเดตล่าสุด:** 6 กรกฎาคม 2026

เอกสารนี้สรุปสถานะปัจจุบันของโปรเจกต์ **EduFlow** และสิ่งที่จำเป็นต้องทำต่อ

---

## 1. 🔑 ระบบ Auth & Token (เสร็จแล้ว ✅)
* ระบบ Next-Auth + Google OAuth ทำงานได้
* Middleware ตรวจ `ac_tk` cookie → redirect ไป `/login` หรือ `/callback` สำหรับ silent refresh
* Backend middleware `handleRefreshToken` ตรวจ Access Token / Refresh Token
* Cookie `ac_tk` (Access Token) + `role` ถูก set จาก backend

---

## 2. 🎨 หน้า UI ที่สร้างแล้ว (เสร็จแล้ว ✅)
* **Login Page** — Google Sign-in
* **Callback Page** — SCSS Module, รองรับ fresh login + silent refresh
* **Class Page** — Class cards grid พร้อม skeleton loading, filter tabs, stats row

---

## 3. 🆕 Create Class API (เสร็จแล้ว ✅ — 6 ก.ค. 2026)

### Backend
* **`POST /class`** endpoint ใน [`route.ts`](file:///D:/project/edu-flow-app/apps/edu-flow-api/src/pkg/class/route.ts)
* **`createClass` controller** ใน [`controller.ts`](file:///D:/project/edu-flow-app/apps/edu-flow-api/src/pkg/class/controller.ts):
  - ตรวจสิทธิ์ ADMIN (403 ถ้าไม่ใช่)
  - Validate `className` + `teacherId` required
  - ตรวจ `teacherId` ว่ามีตัวตนและเป็น TEACHER/ADMIN
  - สร้าง Class ผ่าน Prisma → return 201

### Frontend
* **API function** `createClass()` ใน [`controller.ts`](file:///D:/project/edu-flow-app/apps/edu-flow-front/src/api/class/controller.ts)
* **Create Class Modal** ใน [`page.tsx`](file:///D:/project/edu-flow-app/apps/edu-flow-front/src/app/class/page.tsx):
  - ตรวจ `role === 'ADMIN'` จาก `useUserStore` → แสดงปุ่มเฉพาะ ADMIN
  - Popup modal พร้อมฟอร์ม (className, description, teacherId)
  - Glassmorphism design, slide-up animation, form validation
  - Error/Success messages, loading spinner
  - Auto-refresh class list หลังสร้างสำเร็จ

---

## 4. 🗄️ Database Schema (ปัจจุบัน)

| Model | สถานะ |
|---|---|
| `User` | ✅ มี role (ADMIN/TEACHER/STUDENT) |
| `TeacherProfile` | ✅ เก็บ department |
| `StudentProfile` | ✅ เก็บ studentId |
| `Class` | ✅ className, description, teacherId, createdAt |
| `Enrollment` | ✅ many-to-many นักเรียน-คลาส |

---

## 📋 สิ่งที่ต้องทำต่อ (Next Steps)

### 🔴 Priority สูง
1. **หน้า Class — เชื่อม API จริง**
   - เปลี่ยน mock data → ใช้ข้อมูลจาก `GET /class` API จริง
   - Map ข้อมูลจาก Prisma model ให้ตรงกับ `ClassItem` interface ที่หน้าบ้านใช้

2. **เพิ่ม Teacher Dropdown ใน Create Modal**
   - ดึงรายชื่อ Teacher จาก API (`GET /user?role=TEACHER`) แทนการกรอก UUID ด้วยมือ

### 🟡 Priority กลาง
3. **Class Detail Page**
   - สร้าง `/class/[id]` route
   - ดึงรายละเอียด class, รายชื่อนักเรียน, assignment

4. **Backend — `requireAdmin` Middleware**
   - สร้าง middleware แยกสำหรับตรวจ role เพื่อ reuse ได้ทุก route

### 🟢 Backlog
5. **Enrollment API** — เพิ่ม/ลบ นักเรียนเข้า/ออก class
6. **Edit/Delete Class** — CRUD เต็มรูปแบบ
7. **Next-Auth Type Extension** — เพิ่ม `refreshToken`, `expiresAt` ใน JWT interface