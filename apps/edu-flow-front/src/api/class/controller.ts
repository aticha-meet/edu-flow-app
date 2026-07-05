import { PAGE_PATH } from '@/config/pagePath';
import axiosInstance from '@/config/axiosConfig';
export const getListClasses = async (url: string) => {
    try {
        const request = await axiosInstance.get(`${PAGE_PATH.API_URL}${url}`)
        return request.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}