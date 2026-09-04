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

  // ─────────────────────────────────────────────────────────────
  // Attempt Management
  // ─────────────────────────────────────────────────────────────

  /**
   * ดึง Attempts ทั้งหมดของนักเรียนในข้อสอบนี้ (เรียงตาม attemptNumber)
   */
  async getAttemptsByStudent(testId: string, studentId: string) {
    return prisma.attempt.findMany({
      where: { testId, studentId },
      orderBy: { attemptNumber: 'asc' },
      include: {
        test: {
          select: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  /**
   * เริ่ม Attempt ใหม่ — ตรวจสอบว่าไม่เกิน MAX_ATTEMPTS ก่อน
   * คืน Attempt ที่สร้างใหม่ หรือ throw ถ้าหมดสิทธิ์
   */
  async startAttempt(testId: string, studentId: string, maxAttempts = 2) {
    const existing = await prisma.attempt.findMany({
      where: { testId, studentId },
      orderBy: { attemptNumber: 'asc' },
    });

    if (existing.length >= maxAttempts) {
      throw new Error(`ATTEMPT_LIMIT_REACHED`);
    }

    const nextAttemptNumber = existing.length + 1;

    return prisma.attempt.create({
      data: {
        testId,
        studentId,
        attemptNumber: nextAttemptNumber,
      },
    });
  }

  /**
   * ส่งข้อสอบ — บันทึกคำตอบ + คำนวณ score + set submittedAt
   * answers: { questionId → choiceId }
   */
  async submitAttempt(
    attemptId: string,
    answers: Record<string, string>,
    submittedByCheat = false,
  ) {
    // ดึง attempt + questions + choices เพื่อคำนวณคะแนน
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { choices: true },
            },
          },
        },
      },
    });

    if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
    if (attempt.submittedAt) throw new Error('ALREADY_SUBMITTED');

    // คำนวณ score
    let score = 0;
    for (const question of attempt.test.questions) {
      const correctChoice = question.choices.find((c) => c.isCorrect);
      const chosenChoiceId = answers[question.id];
      if (correctChoice && chosenChoiceId === correctChoice.id) {
        score++;
      }
    }

    // บันทึก StudentAnswers + update Attempt ในคราวเดียว (transaction)
    const answerEntries = Object.entries(answers);

    return prisma.$transaction([
      // สร้าง StudentAnswer สำหรับแต่ละข้อที่ตอบ
      ...answerEntries
        .filter(([questionId, choiceId]) => questionId && choiceId)
        .map(([questionId, choiceId]) =>
          prisma.studentAnswer.create({
            data: {
              attemptId,
              questionId,
              choiceId,
            },
          }),
        ),
      // อัพเดต Attempt
      prisma.attempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: new Date(),
          score,
          submittedByCheat,
        },
      }),
    ]);
  }
}

export const testService = new TestService();
