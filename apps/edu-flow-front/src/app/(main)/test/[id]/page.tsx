'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getTestById,
  getMyAttempts,
  startAttempt,
  submitAttempt,
} from '@/api/test/controller';
import type { TestWithQuestions, AttemptSummary } from '@/types/test-type';
import styles from '@/app/(main)/exam/exam.module.scss';
import { ScoreRing } from '@/components/exam/ScoreRing';
import useUserStore from '@/store/userStore';

// ─── Types ────────────────────────────────────────────────────────
type SelectedAnswers = Record<string, string>; // questionId → choiceId

const MAX_VIOLATIONS = 3; // โกง 3 ครั้งถูกส่งทันที
const MAX_ATTEMPTS = 2; // ทำได้สูงสุด 2 ครั้ง

// ─── Exam Phase ──────────────────────────────────────────────────
// 'checking'    → กำลังโหลด + ตรวจสอบสิทธิ์
// 'locked'      → หมดสิทธิ์ทำ (ครบ 2 ครั้งแล้ว)
// 'ready'       → พร้อมทำ (แสดง intro + ปุ่ม "เริ่มทำ")
// 'in_progress' → กำลังทำข้อสอบ
// 'submitted'   → ส่งแล้ว แสดงผล
type ExamPhase = 'checking' | 'locked' | 'ready' | 'in_progress' | 'submitted';

// ─── PDF ──────────────────────────────────────────────────────────
async function downloadPDF(
  test: TestWithQuestions,
  selectedAnswers: SelectedAnswers,
  correctCount: number,
  wrongCount: number,
  percentage: number,
) {
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

  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('EduFlow - สรุปผลการสอบ', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(test.title, pageWidth / 2, y, { align: 'center' });
  y += 8;

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

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

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

  // User session
  const session = useUserStore((s: any) => s.session) as { id: string } | null;
  const studentId = session?.id ?? '';

  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Attempt state
  const [phase, setPhase] = useState<ExamPhase>('checking');
  const [pastAttempts, setPastAttempts] = useState<AttemptSummary[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [submittedByCheat, setSubmittedByCheat] = useState(false);
  const isSubmittedRef = useRef(false);

  // ─── Fetch test + past attempts ──────────────────────────────
  const fetchTestAndAttempts = useCallback(async () => {
    if (!testId || !studentId) return;
    setIsLoading(true);
    try {
      const [data, attempts] = await Promise.all([
        getTestById(testId),
        getMyAttempts(testId, studentId),
      ]);
      setTest(data);
      setPastAttempts(attempts);

      if (attempts.length >= MAX_ATTEMPTS) {
        setPhase('locked');
      } else {
        setPhase('ready');
      }
    } catch {
      setFetchError('ไม่สามารถโหลดแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [testId, studentId]);

  useEffect(() => {
    fetchTestAndAttempts();
  }, [fetchTestAndAttempts]);

  // ─── Timer (ใช้งานเฉพาะ phase in_progress) ───────────────────
  useEffect(() => {
    if (phase !== 'in_progress' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && phase === 'in_progress') handleSubmit(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  // ─── Anti-cheat Guard ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'in_progress') return;

    const addViolation = () => {
      setViolations((prev) => {
        const next = prev + 1;
        if (next >= MAX_VIOLATIONS && !isSubmittedRef.current) {
          handleSubmit(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── Helpers ─────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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

  // ─── Start Attempt ────────────────────────────────────────────
  const handleStart = async () => {
    if (!testId || !studentId || isStarting) return;
    setIsStarting(true);
    try {
      const res = await startAttempt(testId, studentId);
      setCurrentAttemptId(res.attemptId);
      setSelectedAnswers({});
      setCurrentQuestion(0);
      setViolations(0);
      setSubmittedByCheat(false);
      isSubmittedRef.current = false;
      setShowReview(false);
      if (test) setTimeLeft(test.durationMinutes * 60);
      setPhase('in_progress');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg === 'ATTEMPT_LIMIT_REACHED') {
        setPhase('locked');
      } else {
        setFetchError('ไม่สามารถเริ่มข้อสอบได้ กรุณาลองใหม่');
      }
    } finally {
      setIsStarting(false);
    }
  };

  // ─── Submit Attempt ───────────────────────────────────────────
  const handleSubmit = async (byCheat = false) => {
    if (isSubmittedRef.current || !currentAttemptId) return;
    isSubmittedRef.current = true;
    setSubmittedByCheat(byCheat);
    setIsSubmitting(true);
    try {
      await submitAttempt(currentAttemptId, selectedAnswers, byCheat);
    } catch {
      // ถ้า API fail ยังคงแสดงผลจาก local calculation ได้
    } finally {
      setIsSubmitting(false);
      // อัพเดต pastAttempts เพื่อตรวจสอบว่าหมดสิทธิ์หรือยัง
      const updatedAttempts = await getMyAttempts(testId, studentId).catch(
        () => pastAttempts,
      );
      setPastAttempts(updatedAttempts);
      setPhase('submitted');
    }
  };

  // ─── Retry (ทำใหม่ ครั้งที่ 2) ───────────────────────────────
  const handleRetry = () => {
    if (pastAttempts.length >= MAX_ATTEMPTS) {
      // หมดสิทธิ์แล้ว ไม่ให้ retry
      setPhase('locked');
      return;
    }
    // Reset แล้วกลับไปหน้า ready
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setViolations(0);
    setSubmittedByCheat(false);
    setShowReview(false);
    setCurrentAttemptId(null);
    isSubmittedRef.current = false;
    setPhase('ready');
  };

  const scrollToQuestion = (index: number) => {
    document.getElementById(`review-question-${index}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // ─── Loading ──────────────────────────────────────────────────
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

  const correctCount = phase === 'submitted' ? calculateScore(questions) : 0;
  const wrongCount = totalQuestions - correctCount;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const grade = getGrade(percentage);
  const attemptsLeft = MAX_ATTEMPTS - pastAttempts.length;

  const handleDownloadPDF = () =>
    downloadPDF(test, selectedAnswers, correctCount, wrongCount, percentage);

  // ─── Phase: LOCKED (หมดสิทธิ์) ───────────────────────────────
  if (phase === 'locked') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.resultContainer}>
            <div className={styles.resultCard}>
              <div className={styles.resultIconWrap} data-grade="poor">
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className={styles.resultTitle}>หมดสิทธิ์ทำแบบทดสอบ</h2>
              <p className={styles.resultSubtitle}>
                คุณทำแบบทดสอบนี้ครบ {MAX_ATTEMPTS} ครั้งแล้ว
              </p>

              {/* ประวัติคะแนน */}
              {pastAttempts.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    marginTop: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {pastAttempts.map((a) => {
                    const pct =
                      a.totalQuestions > 0 && a.score !== null
                        ? Math.round((a.score / a.totalQuestions) * 100)
                        : null;
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 10,
                        }}
                      >
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          ครั้งที่ {a.attemptNumber}
                          {a.submittedByCheat && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              (ส่งอัตโนมัติเนื่องจากโกง)
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            color:
                              pct !== null && pct >= 60 ? '#6ee7b7' : '#fca5a5',
                            fontWeight: 700,
                          }}
                        >
                          {a.score !== null
                            ? `${a.score}/${a.totalQuestions} (${pct}%)`
                            : 'ไม่มีข้อมูล'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={styles.resultActions}>
              <button
                className={styles.retryBtn}
                onClick={() => router.back()}
                id="locked-back-btn"
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
                กลับ
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Phase: READY (Intro screen ก่อนเริ่มทำ) ─────────────────
  if (phase === 'ready') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.resultContainer}>
            <div className={styles.resultCard}>
              <div className={styles.resultIconWrap} data-grade="good">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h2 className={styles.resultTitle}>{test.title}</h2>
              <p className={styles.resultSubtitle}>{test.course.className}</p>

              {/* ข้อมูลแบบทดสอบ */}
              <div className={styles.scoreDisplay} style={{ marginTop: 24 }}>
                <div className={styles.scoreStat}>
                  <span className={styles.scoreValue} data-color="blue">
                    {totalQuestions}
                  </span>
                  <span className={styles.scoreLabel}>ข้อ</span>
                </div>
                <div className={styles.scoreStat}>
                  <span className={styles.scoreValue} data-color="blue">
                    {test.durationMinutes}
                  </span>
                  <span className={styles.scoreLabel}>นาที</span>
                </div>
                <div className={styles.scoreStat}>
                  <span
                    className={styles.scoreValue}
                    data-color={attemptsLeft === 1 ? 'red' : 'green'}
                  >
                    {attemptsLeft}
                  </span>
                  <span className={styles.scoreLabel}>ครั้งที่เหลือ</span>
                </div>
              </div>

              {/* ประวัติ attempt ก่อนหน้า (ถ้ามี) */}
              {pastAttempts.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    marginTop: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    ประวัติการทำ
                  </p>
                  {pastAttempts.map((a) => {
                    const pct =
                      a.totalQuestions > 0 && a.score !== null
                        ? Math.round((a.score / a.totalQuestions) * 100)
                        : null;
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ color: '#94a3b8', fontSize: '0.83rem' }}>
                          ครั้งที่ {a.attemptNumber}
                          {a.submittedByCheat && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: '#f87171',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              (ส่งอัตโนมัติเนื่องจากโกง)
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            color:
                              pct !== null && pct >= 60 ? '#6ee7b7' : '#fca5a5',
                            fontWeight: 700,
                            fontSize: '0.83rem',
                          }}
                        >
                          {a.score !== null
                            ? `${a.score}/${a.totalQuestions} (${pct}%)`
                            : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* คำเตือน anti-cheat */}
              <div
                style={{
                  marginTop: 20,
                  padding: '10px 14px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 8,
                  color: '#fcd34d',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  textAlign: 'left',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                ⚠️ ระหว่างทำข้อสอบห้ามสลับหน้าต่างหรือออกจาก fullscreen
                <br />
                หากโกงเกิน {MAX_VIOLATIONS} ครั้ง ข้อสอบจะถูกส่งทันที
              </div>
            </div>

            <div className={styles.resultActions}>
              <button
                className={styles.retryBtn}
                onClick={() => router.back()}
                id="ready-back-btn"
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
                กลับ
              </button>
              <button
                className={styles.reviewBtn}
                onClick={handleStart}
                disabled={isStarting}
                id="start-exam-btn"
              >
                {isStarting ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    กำลังเริ่ม...
                  </>
                ) : (
                  <>
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
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    เริ่มทำข้อสอบ (ครั้งที่ {pastAttempts.length + 1})
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Phase: SUBMITTED — Result Page ──────────────────────────
  if (phase === 'submitted' && !showReview) {
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

              {/* แจ้ง auto-submit */}
              {submittedByCheat && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '8px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 8,
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    width: '100%',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  ⚠️ ข้อสอบถูกส่งอัตโนมัติเนื่องจากตรวจพบการโกง
                </div>
              )}

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
              {/* ทำใหม่: แสดงเฉพาะเมื่อยังมีสิทธิ์ */}
              {pastAttempts.length < MAX_ATTEMPTS ? (
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
                  ทำใหม่ (ครั้งสุดท้าย)
                </button>
              ) : (
                <button
                  className={styles.retryBtn}
                  onClick={() => setPhase('locked')}
                  id="view-history-btn"
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  หมดสิทธิ์ทำแล้ว
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Phase: SUBMITTED — Review Page ──────────────────────────
  if (phase === 'submitted' && showReview) {
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Phase: IN_PROGRESS — Exam Page ──────────────────────────
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
            ข้อสอบปรนัย (ครั้งที่ {pastAttempts.length})
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
              onClick={() => handleSubmit(false)}
              disabled={answeredCount < totalQuestions || isSubmitting}
              id="submit-exam-btn"
            >
              {isSubmitting ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
              ) : (
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
              )}
              {answeredCount < totalQuestions
                ? `ส่งคำตอบ (เหลือ ${totalQuestions - answeredCount} ข้อ)`
                : isSubmitting
                  ? 'กำลังส่ง...'
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
