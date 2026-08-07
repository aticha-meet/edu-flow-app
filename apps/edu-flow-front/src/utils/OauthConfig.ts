import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { PAGE_PATH } from '@/config/pagePath';
import { CALL_ENV } from '@/config/callEnv';

// Set NEXTAUTH_URL dynamically ตาม mode (NextAuth อ่านค่านี้จาก process.env โดยตรง)
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = PAGE_PATH.NEXTAUTH_URL;
}

export const authOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: CALL_ENV.GOOGLE_CLIENT_ID as string,
      clientSecret: CALL_ENV.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GithubProvider({
      clientId: CALL_ENV.GITHUB_ID as string,
      clientSecret: CALL_ENV.GITHUB_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/login', //
    // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
    error: '/login', // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
    signOut: '/login', // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบที่กำหนดเอง
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at * 1000; // เป็น ms

        // Sync with our backend to get role and custom backendToken
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_ENDPOINT_URL || 'http://localhost:3333/api';
          // The Express routes usually have a prefix or no prefix. Looking at axiosConfig, the baseURL is NEXT_PUBLIC_ENDPOINT_URL
          // Let's use that.
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/auth/google-sync`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            },
          );

          if (res.ok) {
            const { data } = await res.json();
            if (data) {
              token.userId = data.id;
              token.role = data.role;
              token.backendToken = data.backendToken;
            }
          } else {
            console.error('Google sync failed:', await res.text());
          }
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.accessToken = token.accessToken; // Google token
        session.refreshToken = token.refreshToken; // Google refresh token
        session.backendToken = token.backendToken; // Our custom API token
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
      if (url.startsWith('/')) {
        const targetBase = PAGE_PATH.NEXTAUTH_URL || nextAuthUrl;
        return `${targetBase}${url}`;
      }

      return `${nextAuthUrl}/login`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
