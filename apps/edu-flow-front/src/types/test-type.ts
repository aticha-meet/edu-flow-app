// ─── Test List (ใช้ในหน้า course/[id]/test) ─────────────────────
export interface TestSummary {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    sureName: string | null;
  };
  _count: {
    questions: number;
    attempts: number;
  };
}

// ─── Full Test + Questions สำหรับหน้าสอบ ─────────────────────────
export interface Choice {
  id: string;
  value: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionWithChoices {
  id: string;
  questionText: string;
  order: number;
  choices: Choice[];
}

export interface TestWithQuestions {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  createdAt: string;
  course: {
    id: string;
    className: string;
    code: string | null;
  };
  createdBy: {
    id: string;
    name: string | null;
    sureName: string | null;
  };
  questions: QuestionWithChoices[];
}

// ─── Payload สำหรับสร้าง Test ─────────────────────────────────────
export interface CreateTestPayload {
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
}

// ─── Legacy type (ยังใช้อยู่ใน mock) ─────────────────────────────
export interface CourseTest {
  id: string;
  courseId: string;
  testName: string;
  testDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
