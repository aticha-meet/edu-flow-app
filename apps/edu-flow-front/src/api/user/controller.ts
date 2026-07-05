import axiosInstance from "@/config/axiosConfig";
import { PAGE_PATH } from "@/config/pagePath";

export const getListUsers = async (url: string) => {
    try {
        const request = await axiosInstance.get(`${PAGE_PATH.API_URL}${url}`)
        return request.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}