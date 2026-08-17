import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { TOKEN } from '../configs/callToken';
import prisma from '../configs/prisma';

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const acToken = req.cookies?.ac_tk;
    const refreshTokenHeader = req.headers.authorization;
    console.log("Access Token : ", acToken);

    // ==========================================
    // 1. ด่านแรก: ลองเช็ค Access Token ก่อน
    // ==========================================
    if (acToken) {
      try {
        const user = jwt.verify(acToken, TOKEN.JWT as string) as {
          id: string;
        };

        console.log(user);

        // 💡 ใช้ select ดึงมาเฉพาะข้อมูลที่จำเป็น ปลอดภัยตอนเอาไปเข้ารหัส
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true },
        });

        if (!userData)
          return res.status(403).json({ message: 'User not found' });

        return next(); // ✅ ตั๋วยังไม่หมดอายุ ปล่อยผ่านไปทำงานต่อเลย!
      } catch (error) {
        console.log(error);
      }
    }

    // ==========================================
    // 2. ด่านสอง: ชุบชีวิตด้วย Refresh Token
    // ==========================================
    if (!refreshTokenHeader || !refreshTokenHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Refresh token is required and must be Bearer' });
    }

    const token = refreshTokenHeader.split(' ')[1];

    // ✅ Verify Refresh Token ด้วย JWT ที่เราออกเอง
    const payload = jwt.verify(token, TOKEN.JWT as string) as { id: string };

    const userData = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true },
    });

    if (!userData)
      return res.status(403).json({ message: 'User not found in database' });

    console.log(userData);

    // สร้าง Access Token ใหม่ 10 นาที
    const newAccessToken = jwt.sign(userData, TOKEN.JWT as string, {
      expiresIn: '10m',
    });
    // console.log("Access Token OK : ", newAccessToken);

    // 💡 ตั้งค่า Cookie แบบใช้ Express (สะอาดกว่า serialize เยอะมาก)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 10 * 60 * 1000, // ⚠️ Express ใช้หน่วย "มิลลิวินาที" (10 นาที * 60 วิ * 1000)
    };

    res.cookie('ac_tk', newAccessToken, cookieOptions);
    res.cookie('role', userData.role, cookieOptions);

    // ✅ ชุบชีวิตเสร็จแล้ว ต้องสั่ง next() เพื่อให้ API เส้นนั้นทำงานต่อ
    return next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error });
  }
};
