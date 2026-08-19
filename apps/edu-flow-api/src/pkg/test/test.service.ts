import prisma from '../../configs/prisma';

export class TestService {
  /**
   * ดึงรายการ Test ทั้งหมดของ course
   */
  async findByCourse(courseId: string) {
    return prisma.test.findMany({
      where: { courseId },
      include: {
        createdBy: { select: { id: true, name: true, sureName: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ดึง Test พร้อม Questions และ Choices สำหรับหน้าสอบ
   */
  async findById(testId: string) {
    return prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: { select: { id: true, className: true, code: true } },
        createdBy: { select: { id: true, name: true, sureName: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            choices: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * สร้าง Test พร้อม Questions และ Choices ในคราวเดียว
   */
  async create(data: {
    title: string;
    courseId: string;
    createdById: string;
    durationMinutes?: number;
    questions: Array<{
      questionText: string;
      order: number;
      choices: Array<{
        value: string;
        isCorrect: boolean;
        order: number;
      }>;
    }>;
  }) {
    return prisma.test.create({
      data: {
        title: data.title,
        courseId: data.courseId,
        createdById: data.createdById,
        durationMinutes: data.durationMinutes,
        questions: {
          create: data.questions.map((q) => ({
            questionText: q.questionText,
            order: q.order,
            choices: {
              create: q.choices.map((c) => ({
                value: c.value,
                isCorrect: c.isCorrect,
                order: c.order,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { choices: true },
        },
        _count: { select: { questions: true } },
      },
    });
  }

  /**
   * ลบ Test (cascade ลบ Questions และ Choices ด้วย)
   */
  async delete(testId: string) {
    return prisma.test.delete({ where: { id: testId } });
  }
}

export const testService = new TestService();
