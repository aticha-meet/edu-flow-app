import styles from './exam-page-state.module.scss';

interface ExamLoadingStateProps {
  title?: string;
  detail?: string;
}

export function ExamLoadingState({
  title = 'กำลังโหลดแบบทดสอบ',
  detail = 'กำลังตรวจสอบสิทธิ์และเตรียมข้อสอบให้คุณ',
}: ExamLoadingStateProps) {
  return (
    <section className={styles.state} aria-live="polite" aria-busy="true">
      <div className={styles.loader} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h1>{title}</h1>
      <p>{detail}</p>
      <div className={styles.loadingLine} />
    </section>
  );
}

interface ExamErrorStateProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ExamErrorState({
  message,
  onRetry,
  onBack,
}: ExamErrorStateProps) {
  return (
    <section className={styles.state} aria-live="assertive">
      <div className={styles.errorIcon} aria-hidden="true">!</div>
      <h1>เปิดแบบทดสอบไม่สำเร็จ</h1>
      <p>{message}</p>
      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" onClick={onBack}>
          กลับ
        </button>
        <button className={styles.primaryButton} type="button" onClick={onRetry}>
          ลองอีกครั้ง
        </button>
      </div>
    </section>
  );
}
