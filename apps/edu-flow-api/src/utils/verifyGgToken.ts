import { OAuth2Client } from 'google-auth-library';
import { NextFunction, Response } from 'express';

// 1. ตั้งค่าเซ็ตอัป Google OAuth Client ตัวหลัก
const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,     // ใส่ Client ID ของคุณ
    process.env.GOOGLE_CLIENT_SECRET, // ใส่ Client Secret ตัวใหม่ที่คุณสลับเปลี่ยนแล้ว
    'http://localhost:3000/api/auth/callback/google' // Redirect URI
);

export async function handleGoogleTokens(res: Response, refresh_token: string) {
    try {
        console.log(refresh_token)
        if (!refresh_token) {
            return res.status(400).json({ message: 'Missing refresh token' });
        }

        // 2. หยอด Refresh Token ที่มีปัญหาลงไปในเครื่องมือของ Google
        oAuth2Client.setCredentials({
            refresh_token: refresh_token as string
        });

        // 3. สั่งชุบชีวิตดึง Access Token ตัวใหม่เอี่ยมออกมาใช้งานได้ทันที (ตัวคลังจะจัดการยิงไปหากันเอง)
        const tokenResponse = await oAuth2Client.getAccessToken();
        const accessToken = tokenResponse.token;

        // 4. 💡 ถ้าคุณอยากรู้ว่า "เจ้าของ Refresh Token ใบนี้คือใคร?" (แทนการถอดรหัสตรงๆ)
        // ให้เอาตั๋วใบใหม่ที่ได้ วิ่งไปขอข้อมูลผู้ใช้ตรงๆ จาก Google API ครับ
        const userInfoResponse = await oAuth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });

        const googleUser = userInfoResponse.data; // ข้างในนี้จะมี { email, name, picture, sub } ครบถ้วน!

        return googleUser

    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(401).json({ message: 'Invalid or expired Google Refresh Token' });
    }
}