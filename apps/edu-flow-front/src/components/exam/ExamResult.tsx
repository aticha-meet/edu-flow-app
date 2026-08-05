'use client';
//.Hello

import styles from '@/app/(main)/exam/exam.module.scss';
import { ScoreRing } from './ScoreRing';

interface ExamResultProps {
  grade: string;
  gradeText: string;
  gradeSubtext: string;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  percentage: number;
  onDownloadPDF: () => void;
  onShowReview: () => void;
  onRetry: () => void;
}

export const ExamResult = ({
  grade,
  gradeText,
  gradeSubtext,
  correctCount,
  wrongCount,
  totalQuestions,
  percentage,
  onDownloadPDF,
  onShowReview,
  onRetry,
}: ExamResultProps) => {
  return (
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

        <h2 className={styles.resultTitle}>{gradeText}</h2>
        <p className={styles.resultSubtitle}>{gradeSubtext}</p>

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
          onClick={onDownloadPDF}
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
          onClick={onShowReview}
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
          onClick={onRetry}
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
  );
};
