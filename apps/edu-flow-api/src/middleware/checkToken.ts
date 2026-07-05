import { handleGoogleTokens } from '../utils/verifyGgToken';
import { NextFunction, Request, Response } from 'express';

export const handleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 💡 แกะอ่าน Refresh Token จากคุกกี้ที่หน้าบ้านส่งมาได้โดยตรงเลย!
        const refreshToken = req.headers.authorization;
        const accesToken = req.headers.authorization;
        // console.log(refreshToken)

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token status missing" });
        }

        if (accesToken && accesToken.startsWith('Bearer ')) {
            // 💡 หั่นด้วยช่องว่าง แล้วหยิบตัวหลังมาใช้
            const token = accesToken.split(' ')[1];
            const data = await handleGoogleTokens(res, token); // ผลลัพธ์: eyJhbGci... (เหลือแต่รหัสล้วนๆ แล้ว)clg
            console.log(data)
        }

        return next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}