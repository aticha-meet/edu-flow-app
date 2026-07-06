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

export const getLoginUser = async (data: any) => {
    try {
        const request = await axiosInstance.post(`${PAGE_PATH.API_URL}/user/login`, data)
        return request.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getTeachers = async () => {
    try {
        const request = await axiosInstance.get(`${PAGE_PATH.API_URL}/teachers`)
        return request.data
    } catch (err) {
        console.log(err);
        throw err;
    }
}