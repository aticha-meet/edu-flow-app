// eslint-disable-next-line @nx/enforce-module-boundaries
import jwt from 'jsonwebtoken';
import { handleGoogleTokens } from '../utils/verifyGgToken';
import { NextFunction, Request, Response } from 'express';
import { TOKEN } from '../configs/callToken';
import { PrismaClient } from '@prisma/client';
import { serialize } from 'cookie';

const prisma = new PrismaClient()

export const handleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 💡 แกะอ่าน Refresh Token จากคุกกี้ที่หน้าบ้านส่งมาได้โดยตรงเลย!
        const cookies = req.cookies;
        const refreshToken = req.headers.authorization;
        const acToken = cookies['ac_tk']

        try {
            const user = jwt.verify(acToken, TOKEN.JWT as string) as { email: string }

            const userData = await prisma.user.findUnique({
                where: {
                    email: user.email
                },
            }) as { id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN' }

            if (!userData) return res.status(403).json({ message: "Invalid token" })

            const role = serialize('role', userData.role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            })

            res.setHeader('Set-Cookie', role)
        } catch (error) {
            if (error) {

                if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

                const token = refreshToken.split(' ')[1];
                const user = await handleGoogleTokens(res, token) as { email: string }

                const userData = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    },
                }) as { id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN' }

                const accessToken = jwt.sign(userData, TOKEN.JWT as string,)
                console.log("Access Token : ", accessToken)

                const acTokenCookie = serialize('ac_tk', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 1 * 60, // 10 Min
                });

                const role = serialize('role', userData.role, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 1 * 60, // 10 Min
                });

                res.setHeader('Set-Cookie', [acTokenCookie, role])
            }
        }
        // console.log(refreshToken)
        return next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}