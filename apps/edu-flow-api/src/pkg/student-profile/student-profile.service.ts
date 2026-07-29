import prisma from '../../configs/prisma';

export class StudentProfileService {
    /**
     * ดึง student profiles ทั้งหมด พร้อมข้อมูล user
     */
    async findAll() {
        return prisma.studentProfile.findMany({
            include: { user: true }
        });
    }

    /**
     * สร้าง student profile ใหม่
     */
    async create(data: any) {
        return prisma.studentProfile.create({ data });
    }
}

export const studentProfileService = new StudentProfileService();
