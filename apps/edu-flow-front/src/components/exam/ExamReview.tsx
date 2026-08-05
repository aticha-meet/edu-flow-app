'use client';

import styles from '@/app/(main)/exam/exam.module.scss';
import { ExamQuestion } from '@/app/(main)/exam/page';

interface ExamReviewProps {
  examData: ExamQuestion[];
  selectedAnswers: Record<number, number>;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  onDownloadPDF: () => void;
  onBackToResult: () => void;
  onRetry: () => void;
}

export const ExamReview = ({
  examData,
  selectedAnswers,
  correctCount,
  totalQuestions,
  percentage,
  onDownloadPDF,
  onBackToResult,
  onRetry,
}: ExamReviewProps) => {
  const handleGoToQuestion = (index: number) => {
    const element = document.getElementById(`review-question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
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
        <h1 className={styles.examTitle}>ผลการตรวจข้อสอบ</h1>
        <p className={styles.examSubtitle}>
          คะแนน {correctCount}/{totalQuestions} ({percentage}%)
        </p>
      </div>

      {/* Question Navigator */}
      <div className={styles.questionNav}>
        {examData.map((q, i) => {
          const isCorrect = selectedAnswers[q.questionID] === q.correct;
          return (
            <button
              key={q.questionID}
              className={
                isCorrect ? styles.questionDotCorrect : styles.questionDotWrong
              }
              onClick={() => handleGoToQuestion(i)}
              id={`review-dot-${i}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* All questions with answers */}
      {examData.map((q, index) => {
        const userAnswer = selectedAnswers[q.questionID];
        const isCorrect = userAnswer === q.correct;

        return (
          <div
            className={styles.questionCard}
            key={q.questionID}
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
                data-correct={isCorrect ? 'true' : 'false'}
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

            <p className={styles.questionText}>{q.Question}</p>

            <div className={styles.answerList}>
              {q.answer.map((opt) => {
                const isUserAnswer = userAnswer === opt.id;
                const isCorrectAnswer = q.correct === opt.id;
                const isUserWrong = isUserAnswer && !isCorrectAnswer;

                let optionClass = styles.answerOptionDisabled;
                let radioClass = styles.radioCircle;

                if (isCorrectAnswer) {
                  optionClass = styles.answerOptionCorrect;
                  radioClass = styles.radioCircleCorrect;
                } else if (isUserWrong) {
                  optionClass = styles.answerOptionWrong;
                  radioClass = styles.radioCircleWrong;
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
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={styles.resultActions}>
        <button
          className={styles.pdfBtn}
          onClick={onDownloadPDF}
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
          onClick={onBackToResult}
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
          onClick={onRetry}
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
  );
};
