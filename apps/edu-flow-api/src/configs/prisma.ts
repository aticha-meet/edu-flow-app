import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient instance — ใช้ร่วมกันทั้ง project
// หลีกเลี่ยงการสร้าง new PrismaClient() ซ้ำหลายตัว
const prisma = new PrismaClient();

export default prisma;
