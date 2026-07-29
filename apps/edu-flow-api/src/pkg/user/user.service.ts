import prisma from '../../configs/prisma';

export class UserService {
  /**
   * ดึงรายชื่อ users ทั้งหมด
   */
  async findAll() {
    return prisma.user.findMany();
  }

  /**
   * ค้นหา user จาก email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  /**
   * ดึงรายชื่อ users ที่เป็น STUDENT พร้อม studentProfile
   */
  async findStudents() {
    return prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { studentProfile: true },
    });
  }

  /**
   * ดึงรายชื่อ users ที่เป็น TEACHER/ADMIN ที่ยังไม่มี teacherProfile
   */
  async findTeachers() {
    return prisma.user.findMany({
      where: {
        role: { in: ['TEACHER', 'ADMIN'] },
        teacherProfile: null,
      },
      include: { teacherProfile: true },
    });
  }

  /**
   * สร้าง user ใหม่
   */
  async create(data: {
    name: string;
    sureName: string;
    email: string;
    role?: string;
  }) {
    const createData: any = {
      name: data.name,
      sureName: data.sureName,
      email: data.email,
    };
    if (data.role) {
      createData.role = data.role;
    }
    return prisma.user.create({ data: createData });
  }
}

export const userService = new UserService();
