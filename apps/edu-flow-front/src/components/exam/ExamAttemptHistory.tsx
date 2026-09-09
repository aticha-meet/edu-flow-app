import type { AttemptSummary } from '@/types/test-type';
import styles from './exam-attempt-history.module.scss';

interface ExamAttemptHistoryProps {
  attempts: AttemptSummary[];
  title?: string;
}

export function ExamAttemptHistory({
  attempts,
  title = 'ประวัติการทำ',
}: ExamAttemptHistoryProps) {
  if (attempts.length === 0) return null;

  return (
    <section className={styles.history} aria-label={title}>
      <h3>{title}</h3>
      {attempts.map((attempt) => {
        const percentage =
          attempt.totalQuestions > 0 && attempt.score !== null
            ? Math.round((attempt.score / attempt.totalQuestions) * 100)
            : null;

        return (
          <div className={styles.item} key={attempt.id}>
            <span className={styles.attemptName}>
              ครั้งที่ {attempt.attemptNumber}
              {attempt.submittedByCheat && (
                <small>ส่งอัตโนมัติเนื่องจากออกจากหน้าข้อสอบ</small>
              )}
            </span>
            <strong data-passed={String((percentage ?? 0) >= 60)}>
              {attempt.score !== null
                ? `${attempt.score}/${attempt.totalQuestions} (${percentage}%)`
                : 'ไม่มีข้อมูล'}
            </strong>
          </div>
        );
      })}
    </section>
  );
}
