import prisma from '../../configs/prisma';
import { Prisma } from '@prisma/client';

export class CourseService {
  /**
   * ดึง classes ทั้งหมด (สำหรับ ADMIN)
   */
  async findAllAdmin() {
    return prisma.course.findMany({
      include: {
        teacher: { select: { name: true, sureName: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  /**
   * ดึง class ตาม id (สำหรับหน้า Course Detail)
   */
  async findById(id: string) {
    return prisma.course.findUnique({
      where: {
        id: id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            sureName: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                sureName: true,
                email: true,
                studentProfile: { select: { studentId: true, section: true, room: true } },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
  }

  /**
   * ดึง classes ตาม teacherId (สำหรับ TEACHER)
   */
  async findByTeacher(teacherId: string) {
    return prisma.course.findMany({
      where: { teacherId },
      include: {
        teacher: { select: { name: true, sureName: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  /**
   * ดึง classes ที่ student enrolled (สำหรับ STUDENT)
   */
  async findByStudent(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: { select: { name: true, sureName: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
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
    code: string;
    maxStudents?: number;
    status: 'upcoming' | 'active' | 'complete';
  }) {
    return prisma.course.create({
      data: data,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
  /**
   * ดึงรายชื่อนักเรียนใน course
   */
  async getEnrollments(courseId: string, filters: { search?: string; section?: string } = {}) {
    const student: Prisma.UserWhereInput = { role: 'STUDENT' };
    if (filters.section) student.studentProfile = { is: { section: filters.section } };
    const search = filters.search?.trim();
    if (search) {
      student.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sureName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { is: { studentId: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    const where: Prisma.EnrollmentWhereInput = { courseId, student };
    const [users, count, totalCount, classrooms] = await prisma.$transaction([
      prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            sureName: true,
            email: true,
            studentProfile: { select: { studentId: true, section: true, room: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
      }),
      prisma.enrollment.count({ where }),
      prisma.enrollment.count({ where: { courseId, student: { role: 'STUDENT' } } }),
      prisma.studentProfile.findMany({
        where: { user: { role: 'STUDENT', enrollments: { some: { courseId } } } },
        select: { section: true },
        distinct: ['section'],
        orderBy: { section: 'asc' },
      }),
    ]);
    return { users, count, totalCount, sections: classrooms.flatMap(({ section }) => section ? [section] : []) };
  }

  /**
   * เพิ่มนักเรียนเข้า course
   */
  async addEnrollment(courseId: string, studentId: string) {
    return prisma.enrollment.create({
      data: { courseId, studentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            sureName: true,
            email: true,
            studentProfile: { select: { studentId: true, section: true, room: true } },
          },
        },
      },
    });
  }

  async removeEnrollment(courseId: string, studentId: string) {
    const result = await prisma.enrollment.deleteMany({
      where: { courseId, studentId },
    });
    return result.count > 0;
  }

  async addEnrollments(courseId: string, studentIds: string[]) {
    const uniqueStudentIds = [...new Set(studentIds.filter(Boolean))];
    if (uniqueStudentIds.length === 0) {
      return { added: 0, skipped: 0, missing: 0 };
    }

    const students = await prisma.user.findMany({
      where: { id: { in: uniqueStudentIds }, role: 'STUDENT' },
      select: { id: true },
    });
    const validStudentIds = students.map((student) => student.id);
    const missing = uniqueStudentIds.length - validStudentIds.length;

    const created = await prisma.enrollment.createMany({
      data: validStudentIds.map((studentId) => ({ courseId, studentId })),
      skipDuplicates: true,
    });

    return {
      added: created.count,
      skipped: validStudentIds.length - created.count,
      missing,
    };
  }

  /**
   * ดึง Syllabus ทั้งหมดของ course เรียงตาม week
   */
  async getSyllabus(courseId: string) {
    return prisma.courseSyllabus.findMany({
      where: { courseId },
      orderBy: { week: 'asc' },
    });
  }

  /**
   * สร้างหรืออัปเดต Syllabus ของ week ที่ระบุ
   */
  async upsertSyllabus(
    courseId: string,
    week: number,
    data: { title: string; description?: string; topics: string[] },
  ) {
    return prisma.courseSyllabus.upsert({
      where: { courseId_week: { courseId, week } },
      create: { courseId, week, ...data },
      update: { ...data },
    });
  }

  /**
   * ลบ Syllabus ของ week ที่ระบุ
   */
  async deleteSyllabusWeek(courseId: string, week: number) {
    return prisma.courseSyllabus.delete({
      where: { courseId_week: { courseId, week } },
    });
  }

  // ─── Course Settings ──────────────────────────────────────────────

  /**
   * อัปเดต config ของ course (ชื่อ, description, status, maxStudents, roomId, code)
   */
  async updateCourse(
    id: string,
    data: {
      className?: string;
      description?: string;
      roomId?: string;
      code?: string;
      maxStudents?: number;
      status?: 'upcoming' | 'active' | 'complete';
    },
  ) {
    return prisma.course.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, name: true, sureName: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  /**
   * ลบ course ตาม id (children cascade ผ่าน Prisma schema)
   */
  async deleteCourse(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  /**
   * ตรวจสอบว่า course นั้นมีอยู่จริงและ teacherId ตรงกับ owner หรือไม่
   */
  async findCourseOwner(id: string) {
    return prisma.course.findUnique({
      where: { id },
      select: { id: true, teacherId: true, className: true },
    });
  }
}

export const courseService = new CourseService();
