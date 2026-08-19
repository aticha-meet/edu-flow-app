'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestById } from '@/api/test/controller';
import type { TestWithQuestions } from '@/types/test-type';
import styles from '@/app/(main)/exam/exam.module.scss';
import { ScoreRing } from '@/components/exam/ScoreRing';

// ─── Types ────────────────────────────────────────────────────────
type SelectedAnswers = Record<string, string>; // questionId → choiceId
const MAX_VIOLATIONS = 5;
const SECS_PER_QUESTION = 90;

// ─── PDF ──────────────────────────────────────────────────────────
async function downloadPDF(
  test: TestWithQuestions,
  selectedAnswers: SelectedAnswers,
  correctCount: number,
  wrongCount: number,
  percentage: number,
) {
  // Dynamically import to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  const { sarabunRegularBase64 } = await import(
    '@/config/fonts/Sarabun-Regular'
  );

  const doc = new jsPDF();
  doc.addFileToVFS('Sarabun-Regular.ttf', sarabunRegularBase64);
  doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('EduFlow - สรุปผลการสอบ', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Test name
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(test.title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Date
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  const dateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`วันที่ทำแบบทดสอบ: ${dateStr}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 14;

  // Score box
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 28, 4, 4);
  y += 8;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `คะแนนรวม: ${correctCount} จาก ${test.questions.length} คะแนน`,
    margin + 10,
    y + 6,
  );
  doc.text(`${percentage}%`, pageWidth - margin - 10, y + 6, {
    align: 'right',
  });
  y += 14;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `ตอบถูก: ${correctCount} ข้อ  |  ตอบผิด: ${wrongCount} ข้อ`,
    margin + 10,
    y + 2,
  );
  y += 18;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Questions
  test.questions.forEach((q, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const chosenId = selectedAnswers[q.id];
    const correctChoice = q.choices.find((c) => c.isCorrect);
    const chosenChoice = q.choices.find((c) => c.id === chosenId);
    const isCorrect = chosenId === correctChoice?.id;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`ข้อ ${index + 1}.`, margin, y);
    doc.setFontSize(12);
    doc.setTextColor(
      ...((isCorrect ? [34, 197, 94] : [239, 68, 68]) as [
        number,
        number,
        number,
      ]),
    );
    doc.text(isCorrect ? '[ถูกต้อง]' : '[ผิด]', margin + 14, y);
    y += 8;

    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(q.questionText, contentWidth - 10);
    doc.text(lines, margin + 5, y);
    y += lines.length * 6 + 3;

    doc.setFontSize(12);
    if (isCorrect) {
      doc.setTextColor(34, 150, 80);
      doc.text(
        `คำตอบของคุณ: ${chosenChoice?.value || 'ไม่ได้ตอบ'}`,
        margin + 5,
        y,
      );
    } else {
      doc.setTextColor(200, 60, 60);
      doc.text(
        `คำตอบของคุณ: ${chosenChoice?.value || 'ไม่ได้ตอบ'}`,
        margin + 5,
        y,
      );
      y += 6;
      doc.setTextColor(34, 150, 80);
      doc.text(`คำตอบที่ถูกต้อง: ${correctChoice?.value || ''}`, margin + 5, y);
    }
    y += 12;

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(margin + 5, y - 4, pageWidth - margin - 5, y - 4);
    y += 4;
  });

  // Footer
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'สร้างโดยระบบ EduFlow - Education Management System',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  doc.save(`EduFlow_Exam_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Main Component ───────────────────────────────────────────────
export default function TestExamPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.id as string;

  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const isSubmittedRef = useRef(false);

  // ─── Fetch test ──────────────────────────────────────────────
  const fetchTest = useCallback(async () => {
    if (!testId) return;
    setIsLoading(true);
    try {
      const data = await getTestById(testId);
      setTest(data);
      // ใช้ durationMinutes จาก test (กำหนดโดยครู/admin) แปลงเป็นวินาที
      setTimeLeft(data.durationMinutes * 60);
    } catch {
      setFetchError('ไม่สามารถโหลดแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // ─── Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!test || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [test, isSubmitted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && test && !isSubmitted) handleSubmit();
  }, [timeLeft, test, isSubmitted]);

  // ─── Anti-cheat Guard ─────────────────────────────────────────
  useEffect(() => {
    if (!test || isSubmitted) return;

    const addViolation = () => {
      setViolations((prev) => {
        const next = prev + 1;
        if (next >= MAX_VIOLATIONS) {
          isSubmittedRef.current = true;
          setIsSubmitted(true);
        }
        return next;
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden && !isSubmittedRef.current) addViolation();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittedRef.current)
        addViolation();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [test, isSubmitted]);

  // ─── Helpers ─────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    isSubmittedRef.current = true;
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setIsSubmitted(false);
    isSubmittedRef.current = false;
    setShowReview(false);
    setViolations(0);
    if (test) setTimeLeft(test.questions.length * SECS_PER_QUESTION);
  };

  const scrollToQuestion = (index: number) => {
    document.getElementById(`review-question-${index}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // ─── Score ───────────────────────────────────────────────────
  const calculateScore = (questions: TestWithQuestions['questions']) => {
    let correct = 0;
    for (const q of questions) {
      const correctChoice = q.choices.find((c) => c.isCorrect);
      if (selectedAnswers[q.id] === correctChoice?.id) correct++;
    }
    return correct;
  };

  const getGrade = (pct: number) => {
    if (pct >= 80) return 'excellent';
    if (pct >= 60) return 'good';
    if (pct >= 40) return 'average';
    return 'poor';
  };

  const getGradeText = (pct: number) => {
    if (pct >= 80) return 'ยอดเยี่ยม!';
    if (pct >= 60) return 'ดีมาก!';
    if (pct >= 40) return 'พอใช้';
    return 'ควรปรับปรุง';
  };

  const getGradeSubtext = (pct: number) => {
    if (pct >= 80) return 'คุณทำข้อสอบได้ดีเยี่ยม ยินดีด้วย!';
    if (pct >= 60) return 'คุณทำได้ดี แต่ยังมีส่วนที่ปรับปรุงได้';
    if (pct >= 40) return 'คุณควรทบทวนเนื้อหาเพิ่มเติม';
    return 'คุณควรศึกษาเนื้อหาใหม่อีกครั้ง';
  };

  // ─── Loading / Error ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 16,
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(99,102,241,0.15)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ margin: 0 }}>กำลังโหลดแบบทดสอบ...</p>
          </div>
        </main>
      </div>
    );
  }

  if (fetchError || !test) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 16,
              color: '#64748b',
            }}
          >
            <p style={{ margin: 0 }}>{fetchError || 'ไม่พบแบบทดสอบ'}</p>
            <button className={styles.retryBtn} onClick={() => router.back()}>
              ← กลับ
            </button>
          </div>
        </main>
      </div>
    );
  }

  const questions = test.questions;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const correctCount = isSubmitted ? calculateScore(questions) : 0;
  const wrongCount = totalQuestions - correctCount;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const grade = getGrade(percentage);

  const handleDownloadPDF = () =>
    downloadPDF(test, selectedAnswers, correctCount, wrongCount, percentage);

  // ─── Result Page ──────────────────────────────────────────────
  if (isSubmitted && !showReview) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.resultContainer}>
            <div className={styles.resultCard}>
              <div className={styles.resultIconWrap} data-grade={grade}>
                {grade === 'excellent' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
                {grade === 'good' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                )}
                {grade === 'average' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="15" x2="16" y2="15" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                )}
                {grade === 'poor' && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                )}
              </div>

              <h2 className={styles.resultTitle}>{getGradeText(percentage)}</h2>
              <p className={styles.resultSubtitle}>
                {getGradeSubtext(percentage)}
              </p>

              <ScoreRing percentage={percentage} />

              <div className={styles.scoreDisplay}>
                <div className={styles.scoreStat}>
                  <span className={styles.scoreValue} data-color="green">
                    {correctCount}
                  </span>
                  <span className={styles.scoreLabel}>ถูกต้อง</span>
                </div>
                <div className={styles.scoreStat}>
                  <span className={styles.scoreValue} data-color="red">
                    {wrongCount}
                  </span>
                  <span className={styles.scoreLabel}>ผิด</span>
                </div>
                <div className={styles.scoreStat}>
                  <span className={styles.scoreValue} data-color="blue">
                    {totalQuestions}
                  </span>
                  <span className={styles.scoreLabel}>ทั้งหมด</span>
                </div>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button
                className={styles.pdfBtn}
                onClick={handleDownloadPDF}
                id="download-pdf-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                ดาวน์โหลด PDF
              </button>
              <button
                className={styles.reviewBtn}
                onClick={() => setShowReview(true)}
                id="review-answers-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                ดูเฉลย
              </button>
              <button
                className={styles.retryBtn}
                onClick={handleRetry}
                id="retry-exam-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                ทำใหม่
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Review Page ──────────────────────────────────────────────
  if (isSubmitted && showReview) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.reviewContainer}>
            <div className={styles.examHeader}>
              <div className={styles.examBadge}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                ดูเฉลย
              </div>
              <h1 className={styles.examTitle}>{test.title}</h1>
              <p className={styles.examSubtitle}>
                คะแนน {correctCount}/{totalQuestions} ({percentage}%)
              </p>
            </div>

            {/* Question Navigator */}
            <div className={styles.questionNav}>
              {questions.map((q, i) => {
                const correctChoice = q.choices.find((c) => c.isCorrect);
                const isCorrect = selectedAnswers[q.id] === correctChoice?.id;
                return (
                  <button
                    key={q.id}
                    className={
                      isCorrect
                        ? styles.questionDotCorrect
                        : styles.questionDotWrong
                    }
                    onClick={() => scrollToQuestion(i)}
                    id={`review-dot-${i}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* All Questions with Answers */}
            {questions.map((q, index) => {
              const chosenId = selectedAnswers[q.id];
              const correctChoice = q.choices.find((c) => c.isCorrect);
              const isCorrect = chosenId === correctChoice?.id;
              return (
                <div
                  className={styles.questionCard}
                  key={q.id}
                  id={`review-question-${index}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <div className={styles.questionNumber}>{index + 1}</div>
                    <span
                      className={styles.correctBadge}
                      data-correct={String(isCorrect)}
                    >
                      {isCorrect ? (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          ถูกต้อง
                        </>
                      ) : (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          ผิด
                        </>
                      )}
                    </span>
                  </div>
                  <p className={styles.questionText}>{q.questionText}</p>
                  <div className={styles.answerList}>
                    {q.choices.map((c) => {
                      const isUserAnswer = chosenId === c.id;
                      const isUserWrong = isUserAnswer && !c.isCorrect;
                      let optionClass = styles.answerOptionDisabled;
                      let radioClass = styles.radioCircle;
                      if (c.isCorrect) {
                        optionClass = styles.answerOptionCorrect;
                        radioClass = styles.radioCircleCorrect;
                      } else if (isUserWrong) {
                        optionClass = styles.answerOptionWrong;
                        radioClass = styles.radioCircleWrong;
                      }
                      return (
                        <div key={c.id} className={optionClass}>
                          <div className={radioClass}>
                            {(c.isCorrect || isUserWrong) && (
                              <span className={styles.radioDot} />
                            )}
                          </div>
                          <span className={styles.answerText}>{c.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className={styles.resultActions}>
              <button
                className={styles.pdfBtn}
                onClick={handleDownloadPDF}
                id="review-download-pdf-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                ดาวน์โหลด PDF
              </button>
              <button
                className={styles.retryBtn}
                onClick={() => setShowReview(false)}
                id="back-to-result-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                กลับหน้าผลคะแนน
              </button>
              <button
                className={styles.retryBtn}
                onClick={handleRetry}
                id="review-retry-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                ทำใหม่
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Exam Page ────────────────────────────────────────────────
  const currentQ = questions[currentQuestion];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Anti-Cheat Guard Banner */}
        {violations > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'rgba(127,29,29,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: 12,
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: 20,
                animation: 'pulseWarning 2s infinite',
                boxShadow: '0 4px 12px rgba(220,38,38,0.15)',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              คำเตือน: ตรวจพบการสลับหน้าจอ {violations}/{MAX_VIOLATIONS} ครั้ง
              (หากครบจะถูกส่งข้อสอบทันที)
            </div>
          </div>
        )}

        {/* Exam Header */}
        <div className={styles.examHeader}>
          <div className={styles.examBadge}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            ข้อสอบปรนัย
          </div>
          <h1 className={styles.examTitle}>{test.title}</h1>
          <p className={styles.examSubtitle}>
            {test.course.className} · เลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ
          </p>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className={`${styles.timerContainer} ${timeLeft < 60 ? styles.timerWarning : ''}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
            <span className={styles.progressCount}>
              {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Navigator */}
        <div className={styles.questionNav}>
          {questions.map((q, i) => {
            let dotClass = styles.questionDot;
            if (i === currentQuestion) dotClass = styles.questionDotCurrent;
            else if (selectedAnswers[q.id])
              dotClass = styles.questionDotAnswered;
            return (
              <button
                key={q.id}
                className={dotClass}
                onClick={() => setCurrentQuestion(i)}
                id={`question-dot-${i}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.questionNumber}>{currentQuestion + 1}</div>
          <p className={styles.questionText}>{currentQ.questionText}</p>
          <div className={styles.answerList}>
            {currentQ.choices.map((choice) => {
              const isSelected = selectedAnswers[currentQ.id] === choice.id;
              return (
                <div
                  key={choice.id}
                  className={
                    isSelected
                      ? styles.answerOptionSelected
                      : styles.answerOption
                  }
                  onClick={() =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [currentQ.id]: choice.id,
                    }))
                  }
                  id={`answer-${currentQ.id}-${choice.id}`}
                >
                  <div
                    className={
                      isSelected
                        ? styles.radioCircleSelected
                        : styles.radioCircle
                    }
                  >
                    {isSelected && <span className={styles.radioDot} />}
                  </div>
                  <span className={styles.answerText}>{choice.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navButtons}>
          <button
            className={styles.navBtn}
            onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))}
            disabled={currentQuestion === 0}
            id="prev-question-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {answeredCount < totalQuestions
                ? `ส่งคำตอบ (เหลือ ${totalQuestions - answeredCount} ข้อ)`
                : 'ส่งคำตอบ'}
            </button>
          ) : (
            <button
              className={styles.navBtn}
              onClick={() =>
                setCurrentQuestion((c) => Math.min(totalQuestions - 1, c + 1))
              }
              id="next-question-btn"
            >
              ข้อถัดไป
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
