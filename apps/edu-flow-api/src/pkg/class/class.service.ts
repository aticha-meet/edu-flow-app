import prisma from '../../configs/prisma';

export class ClassService {
  /**
   * ดึง classes ทั้งหมด (สำหรับ ADMIN)
   */
  async findAllAdmin() {
    return prisma.class.findMany({});
  }

  /**
   * ดึง classes ตาม teacherId (สำหรับ TEACHER)
   */
  async findByTeacher(teacherId: string) {
    return prisma.class.findMany({
      where: {
        id: parseInt(teacherId),
      },
    });
  }

  /**
   * ดึง classes ที่ student enrolled (สำหรับ STUDENT)
   */
  async findByStudent(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: { class: true },
    });
  }

  /**
   * ค้นหา teacher/user จาก id เพื่อตรวจสอบสิทธิ์
   */
  async findTeacher(teacherId: string) {
    return prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true, name: true },
    });
  }

  /**
   * สร้าง class ใหม่
   */
  async create(data: {
    className: string;
    description?: string;
    teacherId: string;
    roomId?: string;
  }) {
    return prisma.class.create({
      data: {
        className: data.className,
        description: data.description || null,
        teacherId: data.teacherId,
        roomId: data.roomId || null,
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}

export const classService = new ClassService();
