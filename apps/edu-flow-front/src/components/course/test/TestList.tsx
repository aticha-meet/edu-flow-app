import { useRouter } from 'next/navigation';
import type { TestSummary } from '@/types/test-type';
import styles from '@/app/(main)/course/[id]/test/test.module.scss';

interface TestListProps {
  tests: TestSummary[];
  isManageMode?: boolean;
  onDelete?: (testId: string) => void;
}

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));

const getCreatorName = (test: TestSummary) =>
  [test.createdBy.name, test.createdBy.sureName].filter(Boolean).join(' ') ||
  'ไม่ระบุผู้สร้าง';

function TestDocumentIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export const TestList = ({
  tests,
  isManageMode = false,
  onDelete,
}: TestListProps) => {
  const router = useRouter();

  if (tests.length === 0) {
    return (
      <section className={styles.emptyState} aria-label="ไม่มีแบบทดสอบ">
        <div className={styles.emptyIcon}>
          <TestDocumentIcon />
        </div>
        <p>ยังไม่มีแบบทดสอบในรายวิชานี้</p>
        {isManageMode && <span>กด “สร้างแบบทดสอบใหม่” เพื่อเริ่มต้น</span>}
      </section>
    );
  }

  return (
    <section className={styles.testList} aria-label="Test list">
      {tests.map((test, index) => (
        <article className={styles.testCard} key={test.id}>
          <div className={styles.testNumber}>
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className={styles.testInfo}>
            <span className={styles.testLabel}>แบบทดสอบ</span>
            <h2>{test.title}</h2>
            <p>
              <span className={styles.metaItem}>
                {test._count.questions} ข้อ
              </span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>
                {test.durationMinutes} นาที
              </span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>
                สร้างเมื่อ {formatDate(test.createdAt)}
              </span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>
                โดย {getCreatorName(test)}
              </span>
            </p>
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.startButton}
              type="button"
              onClick={() => router.push(`/test/${test.id}`)}
              id={`start-test-${test.id}`}
            >
              เริ่มทำแบบทดสอบ <span aria-hidden="true">→</span>
            </button>
            {isManageMode && onDelete && (
              <button
                className={styles.deleteButton}
                type="button"
                onClick={() => {
                  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${test.title}"?`)) {
                    onDelete(test.id);
                  }
                }}
                id={`delete-test-${test.id}`}
                aria-label={`ลบแบบทดสอบ ${test.title}`}
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
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
};
