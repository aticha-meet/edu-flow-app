'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import styles from './exam.module.scss'
import { ExamResult } from '@/components/exam/ExamResult'
import { ExamReview } from '@/components/exam/ExamReview'
import { ExamGuard } from '@/components/exam/ExamGuard'
import { generateExamPDF } from '@/utils/generateExamPDF'
import { preExam } from '@/assets/exam/preExam'
import { useExamStore } from '@/store/examStore'

// ─── Types ───────────────────────────────────────────────────────
export interface AnswerOption {
    id: number
    value: string
}

export interface ExamQuestion {
    questionID: number
    Question: string
    answer: AnswerOption[]
    correct: number
}

// ─── Component ───────────────────────────────────────────────────
export default function ExamPage() {
    const examData = preExam
    const [showReview, setShowReview] = useState(false)
    const [mounted, setMounted] = useState(false)

    const {
        currentQuestion,
        setCurrentQuestion,
        selectedAnswers,
        selectAnswer,
        isSubmitted,
        submitExam,
        timeLeft,
        decrementTime,
        resetExam
    } = useExamStore()

    // Hydration check for Zustand persist
    useEffect(() => {
        setMounted(true)
    }, [])

    // ─── Timer Logic ─────────────────────────────────────────────
    useEffect(() => {
        if (isSubmitted || timeLeft <= 0) return

        const timerId = setInterval(() => {
            decrementTime()
        }, 1000)

        return () => clearInterval(timerId)
    }, [isSubmitted, timeLeft, decrementTime])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const totalQuestions = examData.length
    const answeredCount = Object.keys(selectedAnswers).length
    const progress = (answeredCount / totalQuestions) * 100

    // ─── Handlers ────────────────────────────────────────────────
    const handleSelectAnswer = (questionID: number, answerId: number) => {
        selectAnswer(questionID, answerId)
    }

    const handlePrev = () => {
        setCurrentQuestion(Math.max(0, currentQuestion - 1))
    }

    const handleNext = () => {
        setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))
    }

    const handleGoToQuestion = (index: number) => {
        setCurrentQuestion(index)
    }

    const handleRetry = () => {
        resetExam()
        setShowReview(false)
    }

    // ─── Score Calculation ───────────────────────────────────────
    const calculateScore = () => {
        let correct = 0
        examData.forEach(q => {
            if (selectedAnswers[q.questionID] === q.correct) {
                correct++
            }
        })
        return correct
    }

    const correctCount = isSubmitted ? calculateScore() : 0
    const wrongCount = totalQuestions - correctCount
    const percentage = Math.round((correctCount / totalQuestions) * 100)

    const getGrade = () => {
        if (percentage >= 80) return 'excellent'
        if (percentage >= 60) return 'good'
        if (percentage >= 40) return 'average'
        return 'poor'
    }

    const getGradeText = () => {
        if (percentage >= 80) return 'ยอดเยี่ยม!'
        if (percentage >= 60) return 'ดีมาก!'
        if (percentage >= 40) return 'พอใช้'
        return 'ควรปรับปรุง'
    }

    const getGradeSubtext = () => {
        if (percentage >= 80) return 'คุณทำข้อสอบได้ดีเยี่ยม ยินดีด้วย!'
        if (percentage >= 60) return 'คุณทำได้ดี แต่ยังมีส่วนที่ปรับปรุงได้'
        if (percentage >= 40) return 'คุณควรทบทวนเนื้อหาเพิ่มเติม'
        return 'คุณควรศึกษาเนื้อหาใหม่อีกครั้ง'
    }

    // ─── PDF Generation ──────────────────────────────────────────
    const handleDownloadPDF = () => {
        generateExamPDF({
            examData,
            selectedAnswers,
            correctCount,
            wrongCount,
            totalQuestions,
            percentage,
        })
    }

    if (!mounted) return null // Prevent hydration mismatch

    // ─── Render: Result Page ─────────────────────────────────────
    if (isSubmitted && !showReview) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <ExamResult
                        grade={getGrade()}
                        gradeText={getGradeText()}
                        gradeSubtext={getGradeSubtext()}
                        correctCount={correctCount}
                        wrongCount={wrongCount}
                        totalQuestions={totalQuestions}
                        percentage={percentage}
                        onDownloadPDF={handleDownloadPDF}
                        onShowReview={() => setShowReview(true)}
                        onRetry={handleRetry}
                    />
                </main>
            </div>
        )
    }

    // ─── Render: Review Page ─────────────────────────────────────
    if (isSubmitted && showReview) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <ExamReview
                        examData={examData}
                        selectedAnswers={selectedAnswers}
                        correctCount={correctCount}
                        totalQuestions={totalQuestions}
                        percentage={percentage}
                        onDownloadPDF={handleDownloadPDF}
                        onBackToResult={() => setShowReview(false)}
                        onRetry={handleRetry}
                    />
                </main>
            </div>
        )
    }

    // ─── Render: Exam Page ───────────────────────────────────────
    const currentQ = examData[currentQuestion]

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                {/* Anti-Cheating Guard */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ExamGuard />
                </div>

                {/* Header */}
                <div className={styles.examHeader}>
                    <div className={styles.examBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        ข้อสอบปรนัย
                    </div>
                    <h1 className={styles.examTitle}>แบบทดสอบความรู้พื้นฐาน</h1>
                    <p className={styles.examSubtitle}>เลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ</p>
                </div>

                {/* Timer */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={`${styles.timerContainer} ${timeLeft < 300 ? styles.timerWarning : ''}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className={styles.timerText}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                    <div className={styles.progressInfo}>
                        <span className={styles.progressLabel}>ความคืบหน้า</span>
                        <span className={styles.progressCount}>{answeredCount}/{totalQuestions} ข้อ</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Question Navigator */}
                <div className={styles.questionNav}>
                    {examData.map((q, i) => {
                        const isCurrent = i === currentQuestion
                        const isAnswered = selectedAnswers[q.questionID] !== undefined

                        let dotClass = styles.questionDot
                        if (isCurrent) dotClass = styles.questionDotCurrent
                        else if (isAnswered) dotClass = styles.questionDotAnswered

                        return (
                            <button
                                key={q.questionID}
                                className={dotClass}
                                onClick={() => handleGoToQuestion(i)}
                                id={`question-dot-${i}`}
                            >
                                {i + 1}
                            </button>
                        )
                    })}
                </div>

                {/* Question Card */}
                <div className={styles.questionCard}>
                    <div className={styles.questionNumber}>{currentQuestion + 1}</div>
                    <p className={styles.questionText}>{currentQ.Question}</p>

                    <div className={styles.answerList}>
                        {currentQ.answer.map(opt => {
                            const isSelected = selectedAnswers[currentQ.questionID] === opt.id

                            return (
                                <div
                                    key={opt.id}
                                    className={isSelected ? styles.answerOptionSelected : styles.answerOption}
                                    onClick={() => handleSelectAnswer(currentQ.questionID, opt.id)}
                                    id={`answer-${currentQ.questionID}-${opt.id}`}
                                >
                                    <div className={isSelected ? styles.radioCircleSelected : styles.radioCircle}>
                                        {isSelected && <span className={styles.radioDot} />}
                                    </div>
                                    <span className={styles.answerText}>{opt.value}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className={styles.navButtons}>
                    <button
                        className={styles.navBtn}
                        onClick={handlePrev}
                        disabled={currentQuestion === 0}
                        id="prev-question-btn"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        ข้อก่อนหน้า
                    </button>

                    {currentQuestion === totalQuestions - 1 ? (
                        <button
                            className={styles.submitBtn}
                            onClick={submitExam}
                            disabled={answeredCount < totalQuestions}
                            id="submit-exam-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {answeredCount < totalQuestions
                                ? `ส่งคำตอบ (เหลือ ${totalQuestions - answeredCount} ข้อ)`
                                : 'ส่งคำตอบ'}
                        </button>
                    ) : (
                        <button
                            className={styles.navBtn}
                            onClick={handleNext}
                            id="next-question-btn"
                        >
                            ข้อถัดไป
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
