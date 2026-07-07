import axiosInstance from "@/config/axiosConfig";
import { PAGE_PATH } from "@/config/pagePath";

export const createTeacherProfile = async (data: {
    userId: string;
    department: string;
}) => {
    try {
        const request = await axiosInstance.post(`${PAGE_PATH.API_URL}/teacher`, data);
        return request.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const createStudentProfile = async (data: {
    userId: string;
    studentId: string;
}) => {
    try {
        const request = await axiosInstance.post(`${PAGE_PATH.API_URL}/student`, data);
        return request.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};
