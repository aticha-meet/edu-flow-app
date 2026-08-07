import { Request, Response, NextFunction } from 'express';
import { jwtDecrypt } from 'jose';

// ขยาย Request type ให้มี user
export interface AuthRequest extends Request {
    user?: {
        email: string;
        name: string;
        picture?: string;
        accessToken?: string;
    };
}

/**
 * Middleware: อ่าน next-auth.session-token จาก cookie
 * แล้ว decrypt ด้วย NEXTAUTH_SECRET (ใช้ jose เพราะ Next-Auth v4 เข้ารหัสแบบ JWE)
 */
export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
        const jwt = require('jsonwebtoken');
        
        // Verify token
        const payload = jwt.verify(token, secret);

        // payload contains id, email, role
        req.user = {
            email: payload.email || '',
            name: payload.name || '',
            picture: payload.picture || '',
            accessToken: token, // the backendToken itself
        };

        // Attach additional payload if needed
        (req as any).userPayload = payload;

        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}
