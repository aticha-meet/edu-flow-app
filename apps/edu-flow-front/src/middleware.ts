import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths ที่ไม่ต้องการ authentication
const PUBLIC_PATHS = ['/login', '/callback', '/api/auth'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. ตรวจสอบว่าเป็น public path หรือไม่
    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
    if (isPublicPath) return NextResponse.next();

    // 2. ดึง ac_tk cookie ที่ backend set ไว้
    const acToken = request.cookies.get('ac_tk')?.value;
    console.log("Acces : ", acToken)

    // 3. ดึง next-auth JWT เพื่อเอา refreshToken
    //    getToken() อ่านได้จาก middleware โดยตรง (server-side เท่านั้น)
    const jwtSession = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });
    const refreshToken = jwtSession?.refreshToken as string | undefined;

    // 4. ถ้าไม่มี ac_tk
    if (!acToken && !refreshToken) {


        // ไม่มีทั้ง ac_tk และ refreshToken → บังคับ login ใหม่
        const loginUrl = new URL('/login', request.nextUrl.origin);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 5. มี ac_tk → อนุญาตให้ผ่าน
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
    ],
};