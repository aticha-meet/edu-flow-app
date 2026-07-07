'use client'

import { useState, useCallback } from 'react'
import { Navbar } from '@/components/navbar'
import styles from './exam.module.scss'
import { jsPDF } from 'jspdf'
import { ExamResult } from '@/components/exam/ExamResult'
import { ExamReview } from '@/components/exam/ExamReview'
import { sarabunRegularBase64 } from '@/config/fonts/Sarabun-Regular'
import { preExam } from '@/assets/exam/preExam'

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
    const [examData] = useState<ExamQuestion[]>(preExam)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [showReview, setShowReview] = useState(false)

    const totalQuestions = examData.length
    const answeredCount = Object.keys(selectedAnswers).length
    const progress = (answeredCount / totalQuestions) * 100

    // ─── Handlers ────────────────────────────────────────────────
    const handleSelectAnswer = useCallback((questionID: number, answerId: number) => {
        if (isSubmitted) return
        setSelectedAnswers(prev => ({ ...prev, [questionID]: answerId }))
    }, [isSubmitted])

    const handlePrev = () => {
        setCurrentQuestion(prev => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))
    }

    const handleGoToQuestion = (index: number) => {
        setCurrentQuestion(index)
    }

    const handleSubmit = () => {
        setIsSubmitted(true)
    }

    const handleRetry = () => {
        setSelectedAnswers({})
        setIsSubmitted(false)
        setShowReview(false)
        setCurrentQuestion(0)
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
    const generatePDF = () => {
        const doc = new jsPDF()

        // 1. นำ Font Base64 ฝังเข้า Virtual File System ของ jsPDF
        doc.addFileToVFS('Sarabun-Regular.ttf', sarabunRegularBase64)

        // 2. ลงทะเบียน Font เพื่อให้ใช้งานได้
        doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal')

        // 3. ตั้งค่า Font ปัจจุบันเป็นภาษาไทย
        doc.setFont('Sarabun', 'normal')

        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        let y = 20

        // Title
        doc.setFontSize(22)
        doc.text('EduFlow - สรุปผลการสอบ', pageWidth / 2, y, { align: 'center' })
        y += 12

        // Date
        doc.setFontSize(12)
        doc.setTextColor(120, 120, 120)
        const dateStr = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        doc.text(`วันที่ทำแบบทดสอบ: ${dateStr}`, pageWidth / 2, y, { align: 'center' })
        y += 16

        // Score summary box
        doc.setDrawColor(99, 102, 241)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, y, contentWidth, 28, 4, 4)
        y += 8

        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text(`คะแนนที่ได้: ${correctCount} / ${totalQuestions}`, margin + 10, y + 6)

        doc.setFontSize(16)
        doc.text(`${percentage}%`, pageWidth - margin - 10, y + 6, { align: 'right' })

        y += 14
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text(`ตอบถูก: ${correctCount} ข้อ  |  ตอบผิด: ${wrongCount} ข้อ`, margin + 10, y + 2)
        y += 18

        // Divider
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10

        // Questions detail
        examData.forEach((q, index) => {
            if (y > 260) {
                doc.addPage()
                y = 20
            }

            const userAnswer = selectedAnswers[q.questionID]
            const isCorrect = userAnswer === q.correct
            const correctAnswer = q.answer.find(a => a.id === q.correct)
            const userAnswerText = q.answer.find(a => a.id === userAnswer)

            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)

            const statusIcon = isCorrect ? '[ถูกต้อง]' : '[ผิด]'
            const statusColor = isCorrect ? [34, 197, 94] : [239, 68, 68]
            doc.text(`ข้อ ${index + 1}.`, margin, y)

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
            doc.setFontSize(12)
            doc.text(statusIcon, margin + 14, y)

            y += 8

            // Question text
            doc.setFontSize(13)
            doc.setTextColor(40, 40, 40)
            const questionLines = doc.splitTextToSize(q.Question, contentWidth - 10)
            doc.text(questionLines, margin + 5, y)
            y += questionLines.length * 6 + 3

            // User's answer
            doc.setFontSize(12)
            if (isCorrect) {
                doc.setTextColor(34, 150, 80)
                doc.text(`คำตอบของคุณ: ${userAnswerText?.value || 'ไม่ได้ตอบ'}`, margin + 5, y)
            } else {
                doc.setTextColor(200, 60, 60)
                doc.text(`คำตอบของคุณ: ${userAnswerText?.value || 'ไม่ได้ตอบ'}`, margin + 5, y)
                y += 6
                doc.setTextColor(34, 150, 80)
                doc.text(`คำตอบที่ถูกต้อง: ${correctAnswer?.value || ''}`, margin + 5, y)
            }
            y += 12

            // Separator line
            doc.setDrawColor(230, 230, 230)
            doc.setLineWidth(0.1)
            doc.line(margin + 5, y - 4, pageWidth - margin - 5, y - 4)
            y += 4
        })

        // Footer
        if (y > 270) {
            doc.addPage()
            y = 20
        }
        y += 5
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text('สร้างโดยระบบ EduFlow - Education Management System', pageWidth / 2, y, { align: 'center' })

        doc.save(`EduFlow_Exam_Result_${new Date().toISOString().slice(0, 10)}.pdf`)
    }

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
                        onDownloadPDF={generatePDF}
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
                        onDownloadPDF={generatePDF}
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
                            onClick={handleSubmit}
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
