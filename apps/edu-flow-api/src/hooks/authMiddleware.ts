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
    // Next-Auth ตั้งชื่อ cookie ต่างกันตาม env
    // development → next-auth.session-token
    // production  → __Secure-next-auth.session-token
    const token =
        req.cookies?.['next-auth.session-token'] ||
        req.cookies?.['__Secure-next-auth.session-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No session cookie' });
    }

    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error('NEXTAUTH_SECRET is not defined');
        }

        // Next-Auth v4 เข้ารหัส session token เป็น JWE (A256CBC-HS512)
        // ต้องใช้ key ที่ derive จาก secret ด้วย HKDF
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HKDF' },
            false,
            ['deriveKey']
        );

        const encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: encoder.encode(''),
                info: encoder.encode('NextAuth.js Generated Encryption Key'),
            },
            keyMaterial,
            { name: 'AES-CBC', length: 256 },
            false,
            ['decrypt']
        );

        const { payload } = await jwtDecrypt(token, encryptionKey);

        // payload คือข้อมูลที่ Next-Auth เก็บใน JWT callback
        req.user = {
            email: (payload as any).email || '',
            name: (payload as any).name || '',
            picture: (payload as any).picture || '',
            accessToken: (payload as any).accessToken,
        };

        next();
    } catch (err) {
        console.error('Session token decrypt failed:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid session' });
    }
}
