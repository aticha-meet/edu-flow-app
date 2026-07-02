'use client';

import { RightCard } from '@/components/login/RightCard';
import styles from './login.module.scss';

export default function Login() {
    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth 2.0 flow
        // This will redirect to Google OAuth consent screen
        // and send the authorization code to the Express backend
        console.log('Google Login clicked — OAuth flow will be implemented in Step 2');
    };

    return (
        <div className={styles.loginPage}>
            {/* Animated background orbs */}
            <div className={`${styles.bgOrb} ${styles.bgOrb1}`} />
            <div className={`${styles.bgOrb} ${styles.bgOrb2}`} />
            <div className={`${styles.bgOrb} ${styles.bgOrb3}`} />

            {/* Grid pattern overlay */}
            <div className={styles.gridOverlay} />

            <div className={styles.loginContainer}>
                {/* ── Left: Branding ── */}
                <div className={styles.brandingSide}>
                    {/* Logo */}
                    <div className={styles.brandLogo}>
                        <div className={styles.brandLogoIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L2 7L12 12L22 7L12 2Z"
                                    fill="currentColor"
                                    opacity="0.9"
                                />
                                <path
                                    d="M2 17L12 22L22 17"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.6"
                                />
                                <path
                                    d="M2 12L12 17L22 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.8"
                                />
                            </svg>
                        </div>
                        <span className={styles.brandLogoText}>EduFlow</span>
                    </div>

                    {/* Headline */}
                    <h1 className={styles.brandHeadline}>
                        ระบบจัดการห้องเรียน
                        <br />
                        <span className={styles.brandHeadlineAccent}>
                            อัจฉริยะ สำหรับสถานศึกษา
                        </span>
                    </h1>

                    <p className={styles.brandDescription}>
                        จัดการหลักสูตร ตารางเรียน และติดตามผลการเรียนรู้ของนักศึกษา
                        ทั้งหมดในแพลตฟอร์มเดียว ใช้งานง่าย ปลอดภัย และทันสมัย
                    </p>

                    {/* Feature highlights */}
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                            </span>
                            จัดการหลักสูตรและรายวิชาอย่างเป็นระบบ
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </span>
                            ตารางเรียนอัตโนมัติ ลดความซ้ำซ้อน
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                                </svg>
                            </span>
                            รายงานผลสรุปแบบ Real-time Dashboard
                        </li>
                    </ul>
                </div>

                {/* ── Right: Login Card ── */}
                <RightCard />
            </div>
        </div>
    );
}