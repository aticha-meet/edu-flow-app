import prisma from '../../configs/prisma';

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
          select: { id: true, name: true, sureName: true, email: true },
        },
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, sureName: true, email: true },
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
  async getEnrollments(courseId: string) {
    return prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: { id: true, name: true, sureName: true, email: true },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });
  }

  /**
   * เพิ่มนักเรียนเข้า course
   */
  async addEnrollment(courseId: string, studentId: string) {
    return prisma.enrollment.create({
      data: { courseId, studentId },
      include: {
        student: {
          select: { id: true, name: true, sureName: true, email: true },
        },
      },
    });
  }
}

export const courseService = new CourseService();
