import { PAGE_PATH } from '@/config/pagePath';
import axiosInstance from '@/config/axiosConfig';
export const getListCourse = async (url: string, config: {}, params: any) => {
  try {
    const request = await axiosInstance.get(`${PAGE_PATH.API_URL}${url}`, {
      params,
      ...config,
    });
    return request.data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const createCourse = async (data: {
  className: string;
  description?: string;
  teacherId: string;
  role: string;
  roomId: string;
  status: 'upcoming' | 'active' | 'complete';
  code?: string;
  maxStudents?: number;
}) => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/course`,
      data,
    );
    return request.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getEnrollments = async (courseId: string) => {
  try {
    const request = await axiosInstance.get(
      `${PAGE_PATH.API_URL}/course/${courseId}/students`,
    );
    return request.data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addEnrollment = async (courseId: string, studentId: string) => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/course/${courseId}/students`,
      { studentId },
    );
    return request.data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// ─── Syllabus ─────────────────────────────────────────────────────

export const getSyllabus = async (courseId: string) => {
  try {
    const request = await axiosInstance.get(
      `${PAGE_PATH.API_URL}/course/${courseId}/syllabus`,
    );
    return request.data.data as SyllabusWeek[];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const upsertSyllabus = async (
  courseId: string,
  week: number,
  data: { title: string; description?: string; topics: string[] },
) => {
  try {
    const request = await axiosInstance.put(
      `${PAGE_PATH.API_URL}/course/${courseId}/syllabus/${week}`,
      data,
    );
    return request.data.data as SyllabusWeek;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteSyllabusWeek = async (courseId: string, week: number) => {
  try {
    await axiosInstance.delete(
      `${PAGE_PATH.API_URL}/course/${courseId}/syllabus/${week}`,
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export interface SyllabusWeek {
  id: string;
  courseId: string;
  week: number;
  title: string;
  description: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}
