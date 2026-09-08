import axiosInstance from '@/config/axiosConfig';
import { PAGE_PATH } from '@/config/pagePath';

export const getListUsers = async (url: string, params?: Record<string, string | undefined>) => {
  try {
    const request = await axiosInstance.get(`${PAGE_PATH.API_URL}${url}`, { params });
    return request.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export interface StudentClassroomOption {
  section: string | null;
  room: number | null;
}

export const getStudentClassrooms = async (): Promise<StudentClassroomOption[]> => {
  try {
    const request = await axiosInstance.get(`${PAGE_PATH.API_URL}/users/student/classrooms`);
    return request.data.data as StudentClassroomOption[];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getLoginUser = async (data: any) => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/user/login`,
      data,
    );
    return request.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getTeachers = async () => {
  try {
    const request = await axiosInstance.get(`${PAGE_PATH.API_URL}/teachers`);
    return request.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const createUser = async (data: any) => {
  try {
    const request = await axiosInstance.post(
      `${PAGE_PATH.API_URL}/create-user`,
      data,
    );
    return request.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// ─── Student CSV Import ──────────────────────────────────────

export interface ImportCSVResult {
  imported: number;
  skipped: number;
  errors: { row: number; studentId: string; reason: string }[];
}

export const importStudentsCSV = async (csvText: string): Promise<ImportCSVResult> => {
  try {
    const request = await axiosInstance.post(`${PAGE_PATH.API_URL}/students/import-csv`, {
      csv: csvText,
    });
    return request.data.data as ImportCSVResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getStudentCSVExampleUrl = (): string =>
  `${PAGE_PATH.API_URL}/students/import-csv/example`;
