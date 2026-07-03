'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './callback.module.scss';

const CallBackPage = () => {
    // States for tracking different statuses
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [countdown, setCountdown] = useState<number>(5);
    const router = useRouter();

    // Check NextAuth session status
    useEffect(() => {
        let isMounted = true;
        const checkSession = async () => {
            try {
                // Read error parameters from URL (e.g. callback?error=OAuthCallback)
                const urlParams = new URLSearchParams(window.location.search);
                const error = urlParams.get('error');

                if (error) {
                    if (isMounted) {
                        setStatus('error');
                        setErrorMessage(error === 'AccessDenied' 
                            ? 'สิทธิ์การเข้าใช้งานถูกปฏิเสธ (Access Denied)' 
                            : `เกิดข้อผิดพลาด: ${error}`
                        );
                    }
                    return;
                }

                // Call NextAuth session API to check authentication status
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const session = await res.json();
                    if (session && Object.keys(session).length > 0) {
                        if (isMounted) {
                            setStatus('success');
                        }
                    } else {
                        // Wait a bit and retry (in case session state is syncing)
                        setTimeout(async () => {
                            const retryRes = await fetch('/api/auth/session');
                            const retrySession = await retryRes.json();
                            if (retrySession && Object.keys(retrySession).length > 0) {
                                if (isMounted) setStatus('success');
                            } else {
                                if (isMounted) {
                                    setStatus('error');
                                    setErrorMessage('ไม่พบข้อมูลเซสชัน โปรดเข้าสู่ระบบใหม่อีกครั้ง');
                                }
                            }
                        }, 1500);
                    }
                } else {
                    if (isMounted) {
                        setStatus('error');
                        setErrorMessage('ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setStatus('error');
                    setErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบเซสชัน');
                }
            }
        };

        checkSession();

        return () => {
            isMounted = false;
        };
    }, []);

    // Countdown and Redirect Logic
    useEffect(() => {
        if (status !== 'success') return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, router]);

    const handleManualRedirect = () => {
        router.push('/');
    };

    const handleRetry = () => {
        router.push('/login');
    };

    return (
        <div className={styles.callbackPage}>
            {/* Glowing background orbs */}
            <div className={`${styles.bgOrb} ${styles.bgOrb1}`} />
            <div className={`${styles.bgOrb} ${styles.bgOrb2}`} />

            {/* Grid pattern overlay */}
            <div className={styles.gridOverlay} />

            <div className={styles.callbackCard}>
                <div className={styles.cardContent}>
                    {/* EduFlow Logo */}
                    <div className={styles.logoSection}>
                        <div className={styles.logoIconWrapper}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
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
                        <h1 className={styles.logoText}>EduFlow</h1>
                    </div>

                    {status === 'loading' && (
                        <div className={styles.statusContainer}>
                            <div className={styles.spinner}></div>
                            <p className={styles.statusTitle}>กำลังเข้าสู่ระบบ...</p>
                            <p className={styles.statusText}>กรุณารอสักครู่ ระบบกำลังยืนยันตัวตนและตรวจสอบสิทธิ์การเข้าใช้งาน</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className={styles.statusContainer}>
                            <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className={styles.statusTitle}>เข้าสู่ระบบสำเร็จ!</p>
                            <p className={styles.statusText}>กำลังนำคุณไปยังหน้าควบคุมหลักในอีก {countdown} วินาที...</p>

                            <button
                                onClick={handleManualRedirect}
                                className={styles.primaryBtn}
                            >
                                ไปยังหน้า Dashboard ทันที
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className={styles.statusContainer}>
                            <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className={styles.statusTitle}>การยืนยันตัวตนล้มเหลว</p>
                            <p className={`${styles.statusText} ${styles.errorDetail}`}>{errorMessage}</p>

                            <button
                                onClick={handleRetry}
                                className={styles.secondaryBtn}
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.cardFooter}>
                    <p className={styles.footerText}>
                        &copy; {new Date().getFullYear()} EduFlow. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CallBackPage;