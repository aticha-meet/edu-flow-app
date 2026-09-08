'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import {
  createTest,
  deleteTest,
  getTestsByCourse,
} from '@/api/test/controller';
import { CourseTestFrame } from '@/components/course/test/CourseTestFrame';
import { CreateTestModal } from '@/components/course/test/CreateTestModal';
import { TestBreadcrumb } from '@/components/course/test/TestBreadcrumb';
import { TestList } from '@/components/course/test/TestList';
import { TestPageHeader } from '@/components/course/test/TestPageHeader';
import type { CourseTestDetail } from '@/components/course/test/types';
import type { TestSummary } from '@/types/test-type';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './manage.module.scss';

export default function TestManagePage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { session, isAllowed } = useRoleGuard(
    ['TEACHER', 'ADMIN'],
    `/course/${courseId}/test`,
  );
  const user = session?.user as { id?: string; role?: 'TEACHER' | 'ADMIN' };

  const [course, setCourse] = useState<CourseTestDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!courseId || !isAllowed) return;

    setIsLoading(true);
    try {
      const [courseData, testsData] = await Promise.all([
        getListCourse(`/course/${courseId}`, {}, {}),
        getTestsByCourse(courseId),
      ]);
      setCourse(courseData);
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch managed tests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, isAllowed]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (
    title: string,
    questions: Array<{
      questionText: string;
      choices: Array<{ value: string; isCorrect: boolean }>;
    }>,
    durationMinutes: number,
  ) => {
    await createTest({
      title,
      courseId,
      createdById: user?.id ?? '',
      durationMinutes,
      questions: questions.map((question, questionIndex) => ({
        questionText: question.questionText,
        order: questionIndex,
        choices: question.choices.map((choice, choiceIndex) => ({
          value: choice.value,
          isCorrect: choice.isCorrect,
          order: choiceIndex,
        })),
      })),
    });
    setIsCreateModalOpen(false);
    await fetchData();
  };

  const handleDelete = async (testId: string) => {
    try {
      await deleteTest(testId);
      setTests((previousTests) =>
        previousTests.filter((test) => test.id !== testId),
      );
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('ไม่สามารถลบแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!isAllowed) return null;

  const courseName = course?.className ?? 'รายวิชา';

  return (
    <CourseTestFrame
      courseId={courseId}
      course={course}
      isLoading={isLoading}
      activeMenu="test-manage"
      userRole={user?.role}
    >
      <TestBreadcrumb
        courseId={courseId}
        courseName={isLoading ? '...' : courseName}
        items={[
          { label: 'แบบทดสอบ', href: `/course/${courseId}/test` },
          { label: 'จัดการข้อสอบ' },
        ]}
      />

      <TestPageHeader
        title="จัดการข้อสอบ"
        description="สร้างและลบแบบทดสอบของรายวิชานี้"
        count={`${tests.length} แบบทดสอบ`}
        actions={
          <button
            className={styles.addButton}
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            id="add-test-btn"
          >
            สร้างแบบทดสอบใหม่
          </button>
        }
      />

      {isLoading ? (
        <div className={styles.loadingState} aria-label="กำลังโหลดแบบทดสอบ">
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <TestList tests={tests} isManageMode onDelete={handleDelete} />
      )}

      {isCreateModalOpen && (
        <CreateTestModal
          courseId={courseId}
          createdById={user?.id ?? ''}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </CourseTestFrame>
  );
}
