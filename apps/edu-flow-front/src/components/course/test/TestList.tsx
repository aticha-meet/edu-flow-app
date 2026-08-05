import { useRouter } from 'next/navigation';
import type { TestSummary } from '@/types/TestType';
import styles from '@/app/(main)/course/[id]/test/test.module.scss';

interface TestListProps {
  tests: TestSummary[];
}

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr));

export const TestList = ({ tests }: TestListProps) => {
  const router = useRouter();

  if (tests.length === 0) {
    return (
      <section className={styles.emptyState} aria-label="ไม่มีแบบทดสอบ">
        <div className={styles.emptyIcon}>📝</div>
        <p>ยังไม่มีแบบทดสอบในรายวิชานี้</p>
        <span>กด + เพื่อสร้างแบบทดสอบแรก</span>
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
            <span className={styles.testLabel}>PRACTICE TEST</span>
            <h2>{test.title}</h2>
            <p>
              <span className={styles.metaItem}>
                📋 {test._count.questions} ข้อ
              </span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>
                สร้างเมื่อ {formatDate(test.createdAt)}
              </span>
            </p>
          </div>
          <button
            className={styles.startButton}
            type="button"
            onClick={() => router.push(`/test/${test.id}`)}
            id={`start-test-${test.id}`}
          >
            เริ่มทำแบบทดสอบ <span aria-hidden="true">→</span>
          </button>
        </article>
      ))}
    </section>
  );
};
