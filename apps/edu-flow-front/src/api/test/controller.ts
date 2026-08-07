import axiosInstance from '@/config/axiosConfig';
import { PAGE_PATH } from '@/config/pagePath';
import type {
  TestSummary,
  TestWithQuestions,
  CreateTestPayload,
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
