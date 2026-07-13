import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PAGE_PATH } from "@/config/pagePath";
import { CALL_ENV } from "@/config/callEnv";

export const authOptions = {
    trustHost: true, 
    providers: [
        GoogleProvider({
            clientId: CALL_ENV.GOOGLE_CLIENT_ID as string,
            clientSecret: CALL_ENV.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                }
            },
        }),
        GithubProvider({
            clientId: CALL_ENV.GITHUB_ID as string,
            clientSecret: CALL_ENV.GITHUB_SECRET as string,
        }),
    ],
    pages: {
        signIn: "/login", // 
        // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
        error: "/login", // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
        signOut: "/login", // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
    },
    callbacks: {
        async jwt({ token, user, account }: any) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at * 1000; // เป็น ms
            }

            if (user) {
                token.userId = user.id;
                token.role = user.role || 'user';
            }

            return token;
        },

        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.userId;
                session.user.role = token.role;
                session.accessToken = token.accessToken;
                session.refreshToken = token.refreshToken;
                session.expiresAt = token.expiresAt;
            }
            return session;
        },
        async redirect({ url, baseUrl }: any) {
            // ระบุ base URL เริ่มต้น ป้องกันค่า undefined
            const nextAuthUrl = PAGE_PATH.NEXTAUTH_URL as string;
            const resolvedUrl = new URL(url, nextAuthUrl);

            // อนุญาตให้ redirect ภายใต้โดเมนเดียวกัน
            if (resolvedUrl.origin === new URL(nextAuthUrl).origin) {
                return resolvedUrl.href;
            }

            // จัดการกรณีที่เป็น Relative Path (ขึ้นต้นด้วย /)
            if (url.startsWith("/")) {
                const targetBase = PAGE_PATH.NEXTAUTH_URL || nextAuthUrl;
                return `${targetBase}${url}`;
            }

            return `${nextAuthUrl}/login`;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt" as const,
        maxAge: 7 * 24 * 60 * 60, // 30 days
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };