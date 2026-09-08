'use client';

import { useRouter } from 'next/navigation';
import styles from './test-navigation-actions.module.scss';

interface TestNavigationActionsProps {
  courseId: string;
}

export function TestNavigationActions({
  courseId,
}: TestNavigationActionsProps) {
  const router = useRouter();

  return (
    <div className={styles.actions}>
      <button
        className={styles.secondaryButton}
        type="button"
        onClick={() => router.push(`/course/${courseId}/test/dashboard`)}
        id="dashboard-btn"
      >
        Dashboard คะแนน
      </button>
      <button
        className={styles.primaryButton}
        type="button"
        onClick={() => router.push(`/course/${courseId}/test/manage`)}
        id="manage-test-btn"
      >
        จัดการข้อสอบ
      </button>
    </div>
  );
}
