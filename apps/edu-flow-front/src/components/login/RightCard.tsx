import React from 'react'
import styles from '@/components/login/rightCard.module.scss'
import { signIn } from 'next-auth/react'
import { getListUsers } from '@/api/user/controller';

export const RightCard = () => {
    const handleGoogleLogin = async (provider: string) => {
        try {
            await signIn(provider, {
                callbackUrl: "/class",
                redirect: false,
            });
            const users = await getListUsers('/users');
            console.log(users);
        } catch (error) {
            console.error('Error during Google login:', error);
        }
    }

    return (
        <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>เข้าสู่ระบบ</h2>
                <p className={styles.cardSubtitle}>
                    ใช้บัญชี Google ของสถานศึกษาเพื่อเข้าใช้งาน
                </p>
            </div>

            {/* Google Sign-in Button */}
            <button
                id="google-login-btn"
                className={styles.googleBtn}
                onClick={() => handleGoogleLogin('google')}
                type="button"
            >
                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                เข้าสู่ระบบด้วย Google
            </button>

            {/* Divider */}
            <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>ปลอดภัยด้วย Google OAuth</span>
                <span className={styles.dividerLine} />
            </div>

            {/* Info */}
            <p className={styles.infoText}>
                เมื่อเข้าสู่ระบบ แสดงว่าคุณยอมรับ{' '}
                <a href="#" className={styles.infoLink}>
                    เงื่อนไขการใช้งาน
                </a>{' '}
                และ{' '}
                <a href="#" className={styles.infoLink}>
                    นโยบายความเป็นส่วนตัว
                </a>
            </p>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
                <div className={styles.trustBadge}>
                    <svg
                        className={styles.trustIcon}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    เข้ารหัส SSL
                </div>
                <div className={styles.trustBadge}>
                    <svg
                        className={styles.trustIcon}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    PDPA Compliant
                </div>
            </div>
        </div>
    )
}
