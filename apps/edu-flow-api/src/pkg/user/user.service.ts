import prisma from '../../configs/prisma';
import { Prisma } from '@prisma/client';

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
  async findStudents(filters: {
    courseId?: string;
    section?: string;
    room?: number;
    search?: string;
  } = {}) {
    const where: Prisma.UserWhereInput = { role: 'STUDENT' };

    if (filters.courseId) {
      where.enrollments = { none: { courseId: filters.courseId } };
    }

    if (filters.section || filters.room !== undefined) {
      where.studentProfile = {
        is: {
          ...(filters.section ? { section: filters.section } : {}),
          ...(filters.room !== undefined ? { room: filters.room } : {}),
        },
      };
    }

    const search = filters.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sureName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { is: { studentId: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const countUsers = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      include: { studentProfile: true },
      orderBy: [
        {
          studentProfile:
          {
            section: 'asc'
          }
        },
        {
          studentProfile:
            { room: 'asc' }
        },
        {
          name: 'asc'
        }
      ],
    });

    return { users, count: countUsers };
  }

  async findStudentClassrooms() {
    return prisma.studentProfile.findMany({
      where: { user: { role: 'STUDENT' } },
      select: { section: true, room: true },
      orderBy: [{ section: 'asc' }, { room: 'asc' }],
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
