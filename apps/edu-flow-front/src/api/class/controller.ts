import { PAGE_PATH } from '@/config/pagePath';
import axiosInstance from '@/config/axiosConfig';
export const getListClasses = async (url: string, config: {}, params: any) => {
    try {
        const request = await axiosInstance.get(`${PAGE_PATH.API_URL}${url}`, {
            params,
            ...config
        })
        return request.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const createClass = async (data: {
    className: string;
    description?: string;
    teacherId: string;
    role: string;
    roomId: string;
    status: 'upcoming' | 'active' | 'complete'
}) => {
    try {
        const request = await axiosInstance.post(`${PAGE_PATH.API_URL}/class`, data);
        return request.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}