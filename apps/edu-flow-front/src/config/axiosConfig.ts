import axios from 'axios';
import { getSession } from 'next-auth/react';

// ชี้ไปที่ Express API (http://localhost:3333)
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ENDPOINT_URL || '',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: แนบ Authorization token จาก Next-Auth session
axiosInstance.interceptors.request.use(
    async (config) => {
        // Don't modify content-type if it's FormData
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        // ดึง session และแนบ token ไปกับทุก request
        const session = await getSession();
        console.log(session?.refreshToken)
        if (session?.refreshToken) {
            config.headers['Authorization'] = `Bearer ${session.refreshToken}`;
        }

        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axiosInstance.post('/auth/refresh-token');
                const newToken = response.data?.accessToken || response.data?.token;

                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // 💡 จุดที่ 1: ตัด window.location ออก โยน Error กลับไปให้คนเรียกจัดการ
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 💡 จุดที่ 2: กรณี 403 ก็โยน Error กลับไปตรงๆ เช่นกัน ไม่ต้องสั่งเปลี่ยนหน้าในนี้
        return Promise.reject(error);
    }
);

export default axiosInstance