import styles from './exam-timer.module.scss';

interface ExamTimerProps {
  seconds: number;
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
}

export function ExamTimer({ seconds }: ExamTimerProps) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.timer} ${seconds < 60 ? styles.warning : ''}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className={styles.text} aria-label={`เหลือเวลา ${formatTime(seconds)}`}>
          {formatTime(seconds)}
        </span>
      </div>
    </div>
  );
}
