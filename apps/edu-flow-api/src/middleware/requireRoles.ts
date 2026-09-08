import { NextFunction, Request, Response } from 'express';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

/**
 * จำกัด route ที่มีการจัดการข้อมูลตาม role ที่กำหนดเท่านั้น
 * handleRefreshToken ต้องทำงานก่อน middleware นี้ เพื่อเติม authUser จากฐานข้อมูล
 */
export const requireRoles = (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.authUser;

    if (!authUser || !allowedRoles.includes(authUser.role)) {
      return res.status(403).json({
        message: `Access denied: Required role is ${allowedRoles.join(' or ')}`,
      });
    }

    return next();
  };
