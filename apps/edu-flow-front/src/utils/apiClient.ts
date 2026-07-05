import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // URL ของ Express
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Request Interceptor: แนบ token ก่อนทุก request
apiClient.interceptors.request.use(async (config) => {
    const session = await getSession(); // ดึง session จาก Next-Auth cookie

    if (session?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    return config;
});

// ✅ Response Interceptor: จัดการ 401 อัตโนมัติ
apiClient.interceptors.response.use(
    (response) => response, // สำเร็จ → คืนค่าปกติ
    async (error) => {
        if (error.response?.status === 401) {
            // Token หมดอายุ → redirect ไปหน้า login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;