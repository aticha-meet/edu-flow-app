import { Request, Response, NextFunction } from 'express';
import { parse } from 'cookie';
// eslint-disable-next-line @nx/enforce-module-boundaries
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET_KEY

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const cookies = parse(req.headers.cookie ? req.headers.cookie : '');
    const accessToken = cookies['access_token']

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    try {
        // Decoding the JWT token
        const decoded = jwt.verify(accessToken, secret as string);
        (req as any).user = decoded; // แนบ user เข้า req
        // console.log("Decode", decoded)
        next();
    } catch (err) {
        return res.status(403).json({ error: `Invalid or expired token ${err}` });
    }
}