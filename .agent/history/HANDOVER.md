# 📋 HANDOVER — สรุปสถานะโปรเจกต์ EduFlow (อัปเดต: 7 กรกฎาคม 2026)

เอกสารนี้ summarize สถานะล่าสุดของโปรเจกต์ EduFlow เพื่อ handover ระหว่าง session

---

## ✅ สิ่งที่เสร็จแล้ว

| Feature | ไฟล์หลัก | สถานะ |
|---|---|---|
| Google OAuth Login | `src/app/login/` | ✅ Done |
| Callback + Token Exchange | `src/app/callback/page.tsx` | ✅ Done |
| Middleware (route guard) | `src/middleware.ts` | ✅ Done |
| Class List Page (UI) | `src/app/class/page.tsx` | ✅ Done |
| Class List API (Backend) | `pkg/class/controller.ts` | ✅ Done |
| Create Class Popup | `src/components/class/CreateClassPopup.tsx` | ✅ Done |
| Teacher Dropdown ใน Create Class | `CreateClassPopup.tsx` + `class.module.scss` | ✅ Done (7 ก.ค.) |
| getTeachers() API function | `src/api/user/controller.ts` | ✅ Done (7 ก.ค.) |

---

## 🔄 Flow การทำงานปัจจุบัน

```
User → /login (Google OAuth)
     → /callback (exchange token → set ac_tk cookie)
     → /class (แสดง class list จาก GET /class)
               ↓
         กด "สร้างรายวิชา"
               ↓
         CreateClassPopup เปิด
               ↓
         Fetch GET /teachers → แสดงชื่อ teacher ใน dropdown
               ↓
         POST /class → สร้างรายวิชา
```

---

## ❌ สิ่งที่ยังต้องทำต่อ

### 🔴 สำคัญ (Blocking)

1. **Backend — `POST /auth/refresh`**
   - สร้าง `pkg/auth/` ใหม่ใน backend
   - รับ `Authorization: Bearer <refreshToken>` จาก callback page
   - verify กับ Google OAuth → ออก `ac_tk` JWT cookie ใหม่
   - **เหตุผลที่ blocking:** ถ้า token หมดอายุ user จะถูก redirect loop

### 🟡 ปานกลาง

2. **Class Detail Page** — `/class/[id]`
   - ดึงรายละเอียด class
   - แสดงรายชื่อนักเรียนที่ enroll
   - แสดง assignment list

3. **Role-based UI**
   - ปุ่ม "สร้างรายวิชา" ควรแสดงเฉพาะ `ADMIN` หรือ `TEACHER`
   - `STUDENT` ควรเห็นเฉพาะ class ที่ enroll อยู่ (ปัจจุบัน backend แยก query ตาม role แล้ว แต่ frontend ยังไม่ซ่อน UI)

### 🟢 เล็กน้อย

4. **Next-Auth Type Extension**
   - เพิ่ม `refreshToken?: string` และ `expiresAt?: number` ใน JWT interface
   - ไฟล์: `src/types/next-auth.d.ts`

---

## 🗂️ โครงสร้างไฟล์สำคัญ

```
apps/edu-flow-front/src/
├── api/
│   ├── class/controller.ts      ← createClass, getListClasses
│   └── user/controller.ts       ← getTeachers, getLoginUser, getListUsers
├── app/
│   ├── class/
│   │   ├── page.tsx             ← Class list page
│   │   └── class.module.scss
│   ├── callback/page.tsx        ← Token exchange
│   └── login/
├── components/
│   └── class/
│       └── CreateClassPopup.tsx ← สร้างรายวิชา (มี teacher dropdown)
├── config/
│   ├── axiosConfig.ts
│   └── pagePath.ts
└── store/
    └── userStore.ts

apps/edu-flow-api/src/
├── pkg/
│   ├── class/          ← GET /class (by role), POST /class
│   ├── teacher-profile/ ← GET /teachers, POST /teacher
│   ├── student-profile/
│   └── user/           ← POST /user/login
├── middleware/
│   └── checkToken.ts   ← handleRefreshToken middleware
└── router.ts
```

---

## 🔧 Environment Variables ที่ต้องมี

### Frontend (`.env`)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your_secret>
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_ENDPOINT_URL=http://localhost:3001
```

### Backend (`.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<your_secret>
```