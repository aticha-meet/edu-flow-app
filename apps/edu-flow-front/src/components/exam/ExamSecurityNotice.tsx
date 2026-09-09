import styles from './exam-security-notice.module.scss';

interface ExamSecurityNoticeProps {
  violations: number;
  maxViolations: number;
}

export function ExamSecurityNotice({
  violations,
  maxViolations,
}: ExamSecurityNoticeProps) {
  if (violations === 0) return null;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.notice}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          คำเตือน: ตรวจพบการสลับหน้าจอ {violations}/{maxViolations} ครั้ง
          {' '}(หากครบจะถูกส่งข้อสอบทันที)
        </span>
      </div>
    </div>
  );
}
