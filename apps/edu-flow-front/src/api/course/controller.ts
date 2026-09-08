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

export interface CourseStudentsResponse {
  users: Array<{
    id: number;
    enrolledAt: string;
    student: {
      id: string;
      name: string | null;
      sureName: string | null;
      email: string;
      studentProfile?: { studentId: string; section: string | null; room: number | null } | null;
    };
  }>;
  count: number;
  totalCount: number;
  sections: string[];
}

export const getEnrollments = async (
  courseId: string,
  params: { search?: string; section?: string } = {},
): Promise<CourseStudentsResponse> => {
  try {
    const request = await axiosInstance.get(
      `${PAGE_PATH.API_URL}/course/${courseId}/students`,
      { params },
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

export const removeEnrollment = async (courseId: string, studentId: string) => {
  await axiosInstance.delete(
    `${PAGE_PATH.API_URL}/course/${courseId}/students/${studentId}`,
  );
};

export interface BulkEnrollmentResult {
  added: number;
  skipped: number;
  missing: number;
}

export const addEnrollments = async (
  courseId: string,
  studentIds: string[],
): Promise<BulkEnrollmentResult> => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/course/${courseId}/students/bulk`,
      { studentIds },
    );
    return request.data.data as BulkEnrollmentResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export interface ImportCourseStudentsResult {
  imported: number;
  skipped: number;
  errors: { row: number; studentId: string; reason: string }[];
  enrolled: number;
  alreadyEnrolled: number;
  missing: number;
}

export const importStudentsIntoCourse = async (
  courseId: string,
  csvText: string,
): Promise<ImportCourseStudentsResult> => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/course/${courseId}/students/import-csv`,
      { csv: csvText },
    );
    return request.data.data as ImportCourseStudentsResult;
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

// ─── Course Settings ──────────────────────────────────────────────

export const updateCourse = async (
  courseId: string,
  data: {
    className?: string;
    description?: string;
    roomId?: string;
    code?: string;
    maxStudents?: number;
    status?: 'upcoming' | 'active' | 'complete';
    role: string;
    userId: string;
  },
) => {
  try {
    const request = await axiosInstance.patch(
      `${PAGE_PATH.API_URL}/course/${courseId}`,
      data,
    );
    return request.data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteCourse = async (
  courseId: string,
  meta: { role: string; userId: string },
) => {
  try {
    await axiosInstance.delete(`${PAGE_PATH.API_URL}/course/${courseId}`, {
      data: meta,
    });
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

