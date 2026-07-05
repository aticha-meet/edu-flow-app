/* eslint-disable @nx/enforce-module-boundaries */
// middlewares/authMiddleware.ts
import { TOKEN } from '@/configs/callToken';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyTokenAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer <token>
    console.log(token ? `Token provided: ${token}` : 'No token provided');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        // ตรวจสอบ JWT หรือ Google token
        const decoded = jwt.verify(token, TOKEN.JWT!);
        (req as any).user = decoded; // ใส่ข้อมูลลงใน req.user
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};