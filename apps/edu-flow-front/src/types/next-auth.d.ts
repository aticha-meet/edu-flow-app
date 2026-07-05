import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    /**
     * ขยายโครงสร้างของ Session ที่ได้จาก `useSession()` หรือ `getServerSession()`
     */
    interface Session {
        accessToken?: string; // 💡 เพิ่มฟิลด์ accessToken เข้าไปใน Session
        refreshToken?: string
        user: {
            id?: string;
            role?: string;
        } & DefaultSession["user"];
    }

    /**
     * ขยายโครงสร้างของ User ตอนที่ได้มาจาก Provider (เช่น ตอนล็อกอินสำเร็จ)
     */
    interface User {
        id?: string;
        role?: string;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    /**
     * ขยายโครงสร้างของ JWT Token (สำหรับด่านกลางก่อนแปลงเป็น Session)
     */
    interface JWT {
        id?: string;
        role?: string;
        accessToken?: string;
        refreshToken?: string;
    }
}