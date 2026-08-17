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
