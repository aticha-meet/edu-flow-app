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
   * ลบ Test พร้อม Attempts, StudentAnswers, Questions และ Choices ทั้งหมด
   */
  async delete(testId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. หา attempt IDs ทั้งหมดของ test นี้
      const attempts = await tx.attempt.findMany({
        where: { testId },
        select: { id: true },
      });
      const attemptIds = attempts.map((a) => a.id);

      // 2. ลบ StudentAnswers ของ attempts ทั้งหมด
      if (attemptIds.length > 0) {
        await tx.studentAnswer.deleteMany({
          where: { attemptId: { in: attemptIds } },
        });
      }

      // 3. ลบ Attempts ทั้งหมดของ test นี้
      await tx.attempt.deleteMany({
        where: { testId },
      });

      // 4. ลบ Choices และ Questions ของ test นี้
      const questions = await tx.question.findMany({
        where: { testId },
        select: { id: true },
      });
      const questionIds = questions.map((q) => q.id);
      if (questionIds.length > 0) {
        await tx.choice.deleteMany({
          where: { questionId: { in: questionIds } },
        });
        await tx.question.deleteMany({
          where: { testId },
        });
      }

      // 5. ลบ Test
      return tx.test.delete({
        where: { id: testId },
      });
    });
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

  /**
   * Dashboard คะแนนสำหรับครู — ดึงคะแนนนักเรียนทุกคนใน course ของ test นั้น
   */
  async getScoreDashboard(testId: string) {
    // 1. ดึง test info + จำนวนข้อ
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
        title: true,
        durationMinutes: true,
        courseId: true,
        _count: { select: { questions: true } },
      },
    });

    if (!test) throw new Error('TEST_NOT_FOUND');

    const totalQuestions = test._count.questions;

    // 2. ดึงนักเรียนทุกคนที่ enroll ใน course นี้
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: test.courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            sureName: true,
            studentProfile: { select: { studentId: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    // 3. ดึง attempts ที่ submitted แล้วของ test นี้ทั้งหมด
    const attempts = await prisma.attempt.findMany({
      where: { testId, submittedAt: { not: null } },
      select: {
        id: true,
        studentId: true,
        attemptNumber: true,
        score: true,
        submittedAt: true,
        submittedByCheat: true,
      },
      orderBy: { attemptNumber: 'asc' },
    });

    // 4. Group attempts by studentId
    const attemptsByStudent = new Map<string, typeof attempts>();
    for (const a of attempts) {
      if (!attemptsByStudent.has(a.studentId)) {
        attemptsByStudent.set(a.studentId, []);
      }
      attemptsByStudent.get(a.studentId)!.push(a);
    }

    // 5. Build response
    const students = enrollments.map((e) => {
      const studentAttempts = attemptsByStudent.get(e.student.id) ?? [];
      const scores = studentAttempts
        .map((a) => a.score)
        .filter((s): s is number => s !== null);
      const bestScore = scores.length > 0 ? Math.max(...scores) : null;
      const percentage =
        bestScore !== null && totalQuestions > 0
          ? Math.round((bestScore / totalQuestions) * 100)
          : null;

      return {
        id: e.student.id,
        name: e.student.name,
        sureName: e.student.sureName,
        studentId: e.student.studentProfile?.studentId ?? null,
        attempts: studentAttempts.map((a) => ({
          id: a.id,
          attemptNumber: a.attemptNumber,
          score: a.score,
          submittedAt: a.submittedAt,
          submittedByCheat: a.submittedByCheat,
          totalQuestions,
        })),
        bestScore,
        percentage,
      };
    });

    return {
      test: {
        id: test.id,
        title: test.title,
        totalQuestions,
        durationMinutes: test.durationMinutes,
      },
      students,
    };
  }
}

export const testService = new TestService();
