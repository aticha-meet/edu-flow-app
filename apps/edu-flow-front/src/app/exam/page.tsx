'use client'

import { useState, useCallback, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import styles from './exam.module.scss'
import { jsPDF } from 'jspdf'

// ─── Types ───────────────────────────────────────────────────────
interface AnswerOption {
    id: number
    value: string
}

interface ExamQuestion {
    questionID: number
    Question: string
    answer: AnswerOption[]
    correct: number
}

// ─── Mock Exam Data ──────────────────────────────────────────────
const MOCK_EXAM: ExamQuestion[] = [
    {
        questionID: 1,
        Question: "HTML ย่อมาจากอะไร?",
        answer: [
            { id: 1, value: "Hyper Text Markup Language" },
            { id: 2, value: "High Tech Modern Language" },
            { id: 3, value: "Hyper Transfer Markup Language" },
            { id: 4, value: "Home Tool Markup Language" },
        ],
        correct: 1,
    },
    {
        questionID: 2,
        Question: "ภาษาใดใช้สำหรับจัดรูปแบบ (Styling) เว็บไซต์?",
        answer: [
            { id: 1, value: "JavaScript" },
            { id: 2, value: "Python" },
            { id: 3, value: "CSS" },
            { id: 4, value: "SQL" },
        ],
        correct: 3,
    },
    {
        questionID: 3,
        Question: "ข้อใดคือ JavaScript Framework ที่พัฒนาโดย Facebook?",
        answer: [
            { id: 1, value: "Angular" },
            { id: 2, value: "Vue.js" },
            { id: 3, value: "Svelte" },
            { id: 4, value: "React" },
        ],
        correct: 4,
    },
    {
        questionID: 4,
        Question: "คำสั่ง `git commit -m` ใช้สำหรับทำอะไร?",
        answer: [
            { id: 1, value: "อัพโหลดไฟล์ไปยัง Remote Repository" },
            { id: 2, value: "บันทึกการเปลี่ยนแปลงพร้อมข้อความอธิบาย" },
            { id: 3, value: "ดาวน์โหลด Repository ใหม่" },
            { id: 4, value: "สร้าง Branch ใหม่" },
        ],
        correct: 2,
    },
    {
        questionID: 5,
        Question: "ข้อใดคือ HTTP Status Code สำหรับ 'Not Found'?",
        answer: [
            { id: 1, value: "200" },
            { id: 2, value: "301" },
            { id: 3, value: "404" },
            { id: 4, value: "500" },
        ],
        correct: 3,
    },
    {
        questionID: 6,
        Question: "ฐานข้อมูลประเภทใดที่ใช้ภาษา SQL ในการจัดการข้อมูล?",
        answer: [
            { id: 1, value: "NoSQL Database" },
            { id: 2, value: "Relational Database" },
            { id: 3, value: "Graph Database" },
            { id: 4, value: "Document Database" },
        ],
        correct: 2,
    },
    {
        questionID: 7,
        Question: "ข้อใดไม่ใช่ประเภทข้อมูลพื้นฐาน (Primitive Type) ใน JavaScript?",
        answer: [
            { id: 1, value: "string" },
            { id: 2, value: "number" },
            { id: 3, value: "array" },
            { id: 4, value: "boolean" },
        ],
        correct: 3,
    },
    {
        questionID: 8,
        Question: "Protocol ใดที่ใช้สำหรับการรับส่งข้อมูลบนเว็บอย่างปลอดภัย?",
        answer: [
            { id: 1, value: "FTP" },
            { id: 2, value: "HTTP" },
            { id: 3, value: "HTTPS" },
            { id: 4, value: "SMTP" },
        ],
        correct: 3,
    },
    {
        questionID: 9,
        Question: "คำสั่ง `npm install` ใช้สำหรับทำอะไร?",
        answer: [
            { id: 1, value: "สร้างโปรเจกต์ใหม่" },
            { id: 2, value: "ติดตั้ง Dependencies ที่ระบุใน package.json" },
            { id: 3, value: "รันเซิร์ฟเวอร์แบบ Development" },
            { id: 4, value: "ลบ Node Modules" },
        ],
        correct: 2,
    },
    {
        questionID: 10,
        Question: "ข้อใดเป็นหลักการของ REST API?",
        answer: [
            { id: 1, value: "Stateless Communication" },
            { id: 2, value: "Server-side Rendering" },
            { id: 3, value: "Compile-time Type Checking" },
            { id: 4, value: "Real-time Data Streaming" },
        ],
        correct: 1,
    },
]

// ─── Component ───────────────────────────────────────────────────
export default function ExamPage() {
    const [examData] = useState<ExamQuestion[]>(MOCK_EXAM)
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
    const generatePDF = async () => {
        const doc = new jsPDF()

        // Load Thai font - use default for now, Thai text may not render perfectly
        // For production, embed a Thai font file

        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        let y = 20

        // Title
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('EduFlow - Exam Result', pageWidth / 2, y, { align: 'center' })
        y += 12

        // Date
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 120, 120)
        const dateStr = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        doc.text(`Date: ${dateStr}`, pageWidth / 2, y, { align: 'center' })
        y += 16

        // Score summary box
        doc.setDrawColor(99, 102, 241)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, y, contentWidth, 28, 4, 4)
        y += 8

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`Score: ${correctCount} / ${totalQuestions}`, margin + 10, y + 4)

        doc.setFontSize(14)
        doc.text(`${percentage}%`, pageWidth - margin - 10, y + 4, { align: 'right' })

        y += 12
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`Correct: ${correctCount}  |  Wrong: ${wrongCount}`, margin + 10, y + 2)
        y += 18

        // Divider
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10

        // Questions detail
        examData.forEach((q, index) => {
            // Check if we need a new page
            if (y > 260) {
                doc.addPage()
                y = 20
            }

            const userAnswer = selectedAnswers[q.questionID]
            const isCorrect = userAnswer === q.correct
            const correctAnswer = q.answer.find(a => a.id === q.correct)
            const userAnswerText = q.answer.find(a => a.id === userAnswer)

            // Question number & status
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)

            const statusIcon = isCorrect ? '[CORRECT]' : '[WRONG]'
            const statusColor = isCorrect ? [34, 197, 94] : [239, 68, 68]
            doc.text(`Q${index + 1}.`, margin, y)

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
            doc.setFontSize(9)
            doc.text(statusIcon, margin + 12, y)

            y += 7

            // Question text
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(40, 40, 40)
            const questionLines = doc.splitTextToSize(q.Question, contentWidth - 10)
            doc.text(questionLines, margin + 5, y)
            y += questionLines.length * 5 + 3

            // User's answer
            doc.setFontSize(9)
            if (isCorrect) {
                doc.setTextColor(34, 150, 80)
                doc.text(`Your answer: ${userAnswerText?.value || 'No answer'}`, margin + 5, y)
            } else {
                doc.setTextColor(200, 60, 60)
                doc.text(`Your answer: ${userAnswerText?.value || 'No answer'}`, margin + 5, y)
                y += 5
                doc.setTextColor(34, 150, 80)
                doc.text(`Correct answer: ${correctAnswer?.value || ''}`, margin + 5, y)
            }
            y += 10

            // Separator line
            doc.setDrawColor(230, 230, 230)
            doc.setLineWidth(0.1)
            doc.line(margin + 5, y - 3, pageWidth - margin - 5, y - 3)
            y += 4
        })

        // Footer
        if (y > 270) {
            doc.addPage()
            y = 20
        }
        y += 5
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Generated by EduFlow - Education Management System', pageWidth / 2, y, { align: 'center' })

        doc.save(`EduFlow_Exam_Result_${new Date().toISOString().slice(0, 10)}.pdf`)
    }

    // ─── Score Ring Component ────────────────────────────────────
    const ScoreRing = () => {
        const radius = 60
        const stroke = 8
        const normalizedRadius = radius - stroke / 2
        const circumference = normalizedRadius * 2 * Math.PI
        const [offset, setOffset] = useState(circumference)

        useEffect(() => {
            const timer = setTimeout(() => {
                setOffset(circumference - (percentage / 100) * circumference)
            }, 100)
            return () => clearTimeout(timer)
        }, [circumference])

        const getStrokeColor = () => {
            if (percentage >= 80) return '#22c55e'
            if (percentage >= 60) return '#6366f1'
            if (percentage >= 40) return '#f59e0b'
            return '#ef4444'
        }

        return (
            <div className={styles.scoreRing}>
                <svg className={styles.scoreRingSvg} width={radius * 2} height={radius * 2}>
                    <circle
                        className={styles.scoreRingBg}
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        className={styles.scoreRingFill}
                        stroke={getStrokeColor()}
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={offset}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className={styles.scoreRingText}>
                    <span className={styles.scoreRingPercent}>{percentage}</span>
                    <span className={styles.scoreRingLabel}>คะแนน %</span>
                </div>
            </div>
        )
    }

    // ─── Render: Result Page ─────────────────────────────────────
    if (isSubmitted && !showReview) {
        const grade = getGrade()

        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.resultContainer}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultIconWrap} data-grade={grade}>
                                {grade === 'excellent' && (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                )}
                                {grade === 'good' && (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                )}
                                {grade === 'average' && (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="8" y1="15" x2="16" y2="15" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                )}
                                {grade === 'poor' && (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                )}
                            </div>

                            <h2 className={styles.resultTitle}>{getGradeText()}</h2>
                            <p className={styles.resultSubtitle}>{getGradeSubtext()}</p>

                            <ScoreRing />

                            <div className={styles.scoreDisplay}>
                                <div className={styles.scoreStat}>
                                    <span className={styles.scoreValue} data-color="green">{correctCount}</span>
                                    <span className={styles.scoreLabel}>ถูกต้อง</span>
                                </div>
                                <div className={styles.scoreStat}>
                                    <span className={styles.scoreValue} data-color="red">{wrongCount}</span>
                                    <span className={styles.scoreLabel}>ผิด</span>
                                </div>
                                <div className={styles.scoreStat}>
                                    <span className={styles.scoreValue} data-color="blue">{totalQuestions}</span>
                                    <span className={styles.scoreLabel}>ทั้งหมด</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.resultActions}>
                            <button className={styles.pdfBtn} onClick={generatePDF} id="download-pdf-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                ดาวน์โหลด PDF
                            </button>
                            <button className={styles.reviewBtn} onClick={() => setShowReview(true)} id="review-answers-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                ดูเฉลย
                            </button>
                            <button className={styles.retryBtn} onClick={handleRetry} id="retry-exam-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 4 23 10 17 10" />
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                ทำใหม่
                            </button>
                        </div>
                    </div>
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
                    <div className={styles.examHeader}>
                        <div className={styles.examBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            ดูเฉลย
                        </div>
                        <h1 className={styles.examTitle}>ผลการตรวจข้อสอบ</h1>
                        <p className={styles.examSubtitle}>คะแนน {correctCount}/{totalQuestions} ({percentage}%)</p>
                    </div>

                    {/* Question Navigator */}
                    <div className={styles.questionNav}>
                        {examData.map((q, i) => {
                            const isCorrect = selectedAnswers[q.questionID] === q.correct
                            return (
                                <button
                                    key={q.questionID}
                                    className={isCorrect ? styles.questionDotCorrect : styles.questionDotWrong}
                                    onClick={() => handleGoToQuestion(i)}
                                    id={`review-dot-${i}`}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>

                    {/* All questions with answers */}
                    {examData.map((q, index) => {
                        const userAnswer = selectedAnswers[q.questionID]
                        const isCorrect = userAnswer === q.correct

                        return (
                            <div className={styles.questionCard} key={q.questionID}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div className={styles.questionNumber}>{index + 1}</div>
                                    <span className={styles.correctBadge} data-correct={isCorrect ? 'true' : 'false'}>
                                        {isCorrect ? (
                                            <>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                ถูกต้อง
                                            </>
                                        ) : (
                                            <>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                                ผิด
                                            </>
                                        )}
                                    </span>
                                </div>

                                <p className={styles.questionText}>{q.Question}</p>

                                <div className={styles.answerList}>
                                    {q.answer.map(opt => {
                                        const isUserAnswer = userAnswer === opt.id
                                        const isCorrectAnswer = q.correct === opt.id
                                        const isUserWrong = isUserAnswer && !isCorrectAnswer

                                        let optionClass = styles.answerOptionDisabled
                                        let radioClass = styles.radioCircle

                                        if (isCorrectAnswer) {
                                            optionClass = styles.answerOptionCorrect
                                            radioClass = styles.radioCircleCorrect
                                        } else if (isUserWrong) {
                                            optionClass = styles.answerOptionWrong
                                            radioClass = styles.radioCircleWrong
                                        }

                                        return (
                                            <div key={opt.id} className={optionClass}>
                                                <div className={radioClass}>
                                                    {(isCorrectAnswer || isUserWrong) && (
                                                        <span className={styles.radioDot} />
                                                    )}
                                                </div>
                                                <span className={styles.answerText}>{opt.value}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    <div className={styles.resultActions}>
                        <button className={styles.pdfBtn} onClick={generatePDF} id="review-download-pdf-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            ดาวน์โหลด PDF
                        </button>
                        <button className={styles.retryBtn} onClick={() => setShowReview(false)} id="back-to-result-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            กลับหน้าผลคะแนน
                        </button>
                        <button className={styles.retryBtn} onClick={handleRetry} id="review-retry-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            ทำใหม่
                        </button>
                    </div>
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
