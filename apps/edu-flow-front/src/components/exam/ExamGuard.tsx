'use client'
import { useEffect } from 'react'
import { useExamStore } from '@/store/examStore'



export const ExamGuard = () => {
    const violations = useExamStore(state => state.violations)
    const addViolation = useExamStore(state => state.addViolation)
    const isSubmitted = useExamStore(state => state.isSubmitted)
    const MAX_VIOLATIONS = 5

    useEffect(() => {
        if (isSubmitted) return // Stop tracking if already submitted

        const handleVisibilityChange = () => {
            if (document.hidden) addViolation('tab_switch', MAX_VIOLATIONS)
        }
        
        const handleBlur = () => {
            addViolation('window_blur', MAX_VIOLATIONS)
        }
        
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) addViolation('exit_fullscreen', MAX_VIOLATIONS)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        // window.addEventListener('blur', handleBlur)
        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [addViolation, isSubmitted])

    if (violations === 0) return null

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(127, 29, 29, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px',
            animation: 'pulseWarning 2s infinite',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
        }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            คำเตือน: ตรวจพบการสลับหน้าจอ {violations}/{MAX_VIOLATIONS} ครั้ง (หากครบจะถูกส่งข้อสอบทันที)
        </div>
    )
}
