# 📝 Handover Notes: สรุปสิ่งที่ทำไปวันนี้ (EduFlow)
**วันที่:** 3 กรกฎาคม 2026

เอกสารนี้สรุปข้อผิดพลาดที่พบ วิธีแก้ปัญหา และสิ่งที่จำเป็นต้องทำต่อในวันพรุ่งนี้สำหรับการตั้งค่าระบบ Auth และ Database ของโปรเจกต์ **EduFlow**

---

## 1. 🔑 ปัญหา Next-Auth & Callback URL (`undefined/callback`)
* **ปัญหาที่พบ:** เกิด Error `INVALID_CALLBACK_URL_ERROR` และในบราวเซอร์จำคุกกี้ปลายทางเป็น `undefined/callback` ทำให้ล็อกอินไม่ผ่าน
* **สาเหตุ:** 
  1. ขาดตัวแปร `NEXTAUTH_URL` ในไฟล์ `.env` ของหน้าบ้าน ทำให้ Next-Auth เซ็ตเซสชันปลายทางเป็น `undefined`
  2. การเรียกใช้ `process.env.NEXTAUTH_URL` ในคอมโพเนนต์ที่เป็น Client-side (`use client`) จะได้ผลลัพธ์เป็น `undefined` เสมอตามระบบความปลอดภัยของ Next.js
* **สิ่งที่เราแก้ไขไป:**
  * ปรับโครงสร้างไฟล์ [pagePath.ts](file:///F:/project-working/edu-flow/apps/edu-flow-front/src/config/pagePath.ts) ให้ใช้ตัวแปร `NEXT_PUBLIC_AUTH_URL` สำหรับหน้าบ้าน และซ่อน `NEXTAUTH_URL` ไว้เฉพาะในฝั่งหลังบ้าน
  * เพิ่มค่าแนะนำสำหรับ `.env` หน้าบ้าน:
    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_secret_key_here
    NEXT_PUBLIC_AUTH_URL=http://localhost:3000
    ```

---

## 2. 🎨 การปรับปรุงหน้า Callback Page (`src/app/callback`)
* **สิ่งที่เราทำ:**
  * ย้ายการสไตล์อินไลน์ (Tailwind) ไปใช้ **SCSS Module** โดยสร้างไฟล์ [callback.module.scss](file:///F:/project-working/edu-flow/apps/edu-flow-front/src/app/callback/callback.module.scss) เพื่อให้โค้ดคลีนขึ้น
  * เปลี่ยนข้อมูลแบรนด์เก่าจาก "Adapter CMS" -> **EduFlow**
  * เปลี่ยนไอคอน Logo ให้ตรงกับหน้า Login (รูปหมวกปริญญา/เอกสารสี Indigo-Purple)
  * เขียนโค้ดระบบเช็ก Session อัตโนมัติด้วยคำสั่ง `fetch('/api/auth/session')` เพื่อรอรับค่าสำเร็จ (Success) หรือแสดงข้อความผิดพลาด (Error) หากการล็อกอินผ่าน Google ล้มเหลว

---

## 3. 🧬 ปัญหา Schema Validation (`P1012` ใน Prisma)
* **ปัญหาที่พบ:** ตาราง `User` ในฟิลด์ `classes` แจ้งเตือนว่าหาฝั่งตรงข้ามในตาราง `Class` ไม่เจอ
* **แนวทางแก้ไขที่เราออกแบบร่วมกัน:**
  * ต้องเพิ่มการจับคู่ `@relation("TeacherClasses")` ในตาราง `User`
  * สลับฟิลด์โปรไฟล์ของครูและนักเรียนที่ถูกผูกไว้สลับประเภทกัน (`studentProfile` ชี้ไปที่ `StudentProfile` และ `teacherProfile` ชี้ไปที่ `TeacherProfile`)
  * เปลี่ยนตัว Generator จาก `"prisma-client"` ไปเป็น `"prisma-client-js"`

---

## 4. 🗄️ ปัญหา Database Connection (`P1000` ใน Prisma)
* **ปัญหาที่พบ:** ต่อฐานข้อมูลใน Docker ไม่สำเร็จและแจ้งเตือนสิทธิ์การเข้าใช้งาน (Authentication failed)
* **สาเหตุที่ค้นพบ:** 
  1. รหัสผ่านในคำสั่ง Docker รันระบุเป็น `mysecretpassword` แต่ใน `.env` ของโปรเจกต์ระบุเป็น `06102022`
  2. **พอร์ต `5432` ชนกัน:** บนเครื่อง Windows ของท่านมีโปรแกรม PostgreSQL ปกติ (ติดตั้งแบบไม่ใช่ Docker) รันอยู่เบื้องหลัง (`postgres.exe` - PID 8056) แย่งสัญญาณพอร์ต `5432` ไป ทำให้ Prisma วิ่งไปต่อกับตัวเครื่องหลัก ไม่สามารถเชื่อมเข้าไปหา Docker ที่รันอยู่ได้

---

## 📋 สิ่งที่ต้องทำต่อในวันพรุ่งนี้ (Next Steps)
1. **Set cookie on website**
   * เพิ่ม refesh token และ access token เพิ่มตรวจสอบว่าใช่คนที่เป็น User ไหม