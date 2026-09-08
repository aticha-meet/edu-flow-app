'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getListCourse } from '@/api/course/controller';
import { getTestsByCourse } from '@/api/test/controller';
import { CourseTestFrame } from '@/components/course/test/CourseTestFrame';
import { TestBreadcrumb } from '@/components/course/test/TestBreadcrumb';
import { TestList } from '@/components/course/test/TestList';
import { TestNavigationActions } from '@/components/course/test/TestNavigationActions';
import { TestPageHeader } from '@/components/course/test/TestPageHeader';
import type { CourseTestDetail } from '@/components/course/test/types';
import type { TestSummary } from '@/types/test-type';
import styles from './test.module.scss';

export default function TestPracticePage() {
  const params = useParams();
  const { data: session } = useSession();
  const courseId = params?.id as string;
  const user = session?.user as { role?: 'TEACHER' | 'ADMIN' | 'STUDENT' };
  const canManageTests = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [course, setCourse] = useState<CourseTestDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const [courseData, testsData] = await Promise.all([
        getListCourse(`/course/${courseId}`, {}, {}),
        getTestsByCourse(courseId),
      ]);
      setCourse(courseData);
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch test practice data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courseName = course?.className ?? 'รายวิชา';

  return (
    <CourseTestFrame
      courseId={courseId}
      course={course}
      isLoading={isLoading}
      activeMenu="test"
      userRole={user?.role}
    >
      <TestBreadcrumb
        courseId={courseId}
        courseName={isLoading ? '...' : courseName}
        items={[{ label: 'แบบทดสอบ' }]}
      />

      <TestPageHeader
        title="แบบทดสอบ"
        description="เลือกแบบทดสอบเพื่อเริ่มทำ"
        count={`${tests.length} แบบทดสอบ`}
        actions={canManageTests ? <TestNavigationActions courseId={courseId} /> : null}
      />

      {isLoading ? (
        <div className={styles.loadingState} aria-label="กำลังโหลดแบบทดสอบ">
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <TestList tests={tests} />
      )}
    </CourseTestFrame>
  );
}
