import axiosInstance from '@/config/axiosConfig';
import { PAGE_PATH } from '@/config/pagePath';
import type {
  TestSummary,
  TestWithQuestions,
  CreateTestPayload,
  AttemptSummary,
  StartAttemptResponse,
} from '@/types/test-type';

const BASE = PAGE_PATH.API_URL;

/**
 * GET /test?courseId=... — ดึงรายการ Test ของ course
 */
export const getTestsByCourse = async (
  courseId: string,
): Promise<TestSummary[]> => {
  const res = await axiosInstance.get(`${BASE}/test`, { params: { courseId } });
  return res.data.data;
};

/**
 * GET /test/:id — ดึง Test พร้อม Questions + Choices
 */
export const getTestById = async (
  testId: string,
): Promise<TestWithQuestions> => {
  const res = await axiosInstance.get(`${BASE}/test/${testId}`);
  return res.data.data;
};

/**
 * POST /test — สร้าง Test ใหม่พร้อม Questions
 */
export const createTest = async (
  payload: CreateTestPayload,
): Promise<TestSummary> => {
  const res = await axiosInstance.post(`${BASE}/test`, payload);
  return res.data.data;
};

/**
 * DELETE /test/:id
 */
export const deleteTest = async (testId: string): Promise<void> => {
  await axiosInstance.delete(`${BASE}/test/${testId}`);
};

// ─────────────────────────────────────────────────────────────
// Attempt API
// ─────────────────────────────────────────────────────────────

/**
 * GET /test/:id/attempts?studentId=...
 * ดึงประวัติ attempts ของนักเรียนในข้อสอบนี้
 */
export const getMyAttempts = async (
  testId: string,
  studentId: string,
): Promise<AttemptSummary[]> => {
  const res = await axiosInstance.get(`${BASE}/test/${testId}/attempts`, {
    params: { studentId },
  });
  return res.data.data;
};

/**
 * POST /test/:id/attempt/start
 * เริ่มทำข้อสอบ — สร้าง Attempt ใหม่
 * Throws ถ้าหมดสิทธิ์ (HTTP 403)
 */
export const startAttempt = async (
  testId: string,
  studentId: string,
): Promise<StartAttemptResponse> => {
  const res = await axiosInstance.post(`${BASE}/test/${testId}/attempt/start`, {
    studentId,
  });
  return res.data.data;
};

/**
 * POST /test/attempt/:attemptId/submit
 * ส่งข้อสอบ + บันทึกคะแนน
 */
export const submitAttempt = async (
  attemptId: string,
  answers: Record<string, string>, // { questionId → choiceId }
  submittedByCheat = false,
): Promise<{ score: number; submittedAt: string }> => {
  const res = await axiosInstance.post(
    `${BASE}/test/attempt/${attemptId}/submit`,
    { answers, submittedByCheat },
  );
  return res.data.data;
};
