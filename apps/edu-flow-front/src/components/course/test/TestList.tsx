import type { CourseTest } from './types';
import styles from '../test.module.scss';

interface TestListProps {
  tests: CourseTest[];
  onStart: () => void;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

export const TestList = ({ tests, onStart }: TestListProps) => (
  <section className={styles.testList} aria-label="Test practice list">
    {tests.map((test, index) => (
      <article className={styles.testCard} key={test.id}>
        <div className={styles.testNumber}>{String(index + 1).padStart(2, '0')}</div>
        <div className={styles.testInfo}>
          <span className={styles.testLabel}>PRACTICE TEST</span>
          <h2>{test.testName}</h2>
          <p>เปิดทำแบบทดสอบ {formatDate(test.testDate)}</p>
        </div>
        <button className={styles.startButton} type="button" onClick={onStart}>
          เริ่มทำแบบทดสอบ <span aria-hidden="true">→</span>
        </button>
      </article>
    ))}
  </section>
);
