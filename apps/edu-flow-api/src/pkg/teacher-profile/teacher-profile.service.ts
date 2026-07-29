import prisma from '../../configs/prisma';

export class TeacherProfileService {
    /**
     * ดึง teacher profiles ทั้งหมด พร้อมข้อมูล user
     */
    async findAll() {
        return prisma.teacherProfile.findMany({
            include: { user: true }
        });
    }

    /**
     * สร้าง teacher profile ใหม่
     */
    async create(data: any) {
        return prisma.teacherProfile.create({ data });
    }
}

export const teacherProfileService = new TeacherProfileService();
