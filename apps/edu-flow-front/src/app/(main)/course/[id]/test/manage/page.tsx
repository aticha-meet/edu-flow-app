'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import {
  getTestsByCourse,
  createTest,
  deleteTest,
} from '@/api/test/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { CreateTestModal } from '@/components/course/test/CreateTestModal';
import { TestList } from '@/components/course/test/TestList';
import type { TestSummary } from '@/types/test-type';
import styles from './manage.module.scss';
import { useRoleGuard } from '@/utils/useRoleGuard';
import ClassPage from '../../../page';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function TestManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Guard this route - only TEACHER and ADMIN allowed
  const { session, isAllowed } = useRoleGuard(
    ['TEACHER', 'ADMIN'],
    `/course/${id}/test`,
  );

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ─── Fetch course & tests ─────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!id || !isAllowed) return;
    setIsLoading(true);
    try {
      const [courseData, testsData] = await Promise.all([
        getListCourse(`/course/${id}`, {}, {}),
        getTestsByCourse(id),
      ]);
      setCourse(courseData);
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAllowed]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${id}`;
  const userId = session?.id || '';

  // ─── Handlers ──────────────────────────────────────
  const handleCreate = async (
    title: string,
    questions: Array<{
      questionText: string;
      choices: Array<{ value: string; isCorrect: boolean }>;
    }>,
  ) => {
    await createTest({
      title,
      courseId: id,
      createdById: userId,
      questions: questions.map((q, qi) => ({
        questionText: q.questionText,
        order: qi,
        choices: q.choices.map((c, ci) => ({
          value: c.value,
          isCorrect: c.isCorrect,
          order: ci,
        })),
      })),
    });
    setIsCreateModalOpen(false);
    // Refresh list
    await fetchData();
  };

  const handleDelete = async (testId: string) => {
    try {
      await deleteTest(testId);
      // Optimistic update
      setTests((prev) => prev.filter((t) => t.id !== testId));
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('ไม่สามารถลบแบบทดสอบได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // If not allowed, return null while redirecting
  if (!isAllowed) return null;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        {isLoading ? (
          <aside
            className={styles.sidebar}
            aria-label="Loading course navigation"
          />
        ) : (
          <CourseSidebar
            courseId={id}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu="test-manage"
            userRole={session?.role}
            onMenuChange={(menu) => {
              if (menu === 'test-manage') return;
              if (menu === 'test') {
                router.push(`/course/${id}/test`);
              } else {
                router.push(`/course/${id}`);
              }
            }}
          />
        )}

        {/* ── Content ── */}
        <main className={styles.content}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/course">ห้องเรียน</Link>
            <span>/</span>
            <Link href={`/course/${id}`}>{isLoading ? '...' : courseName}</Link>
            <span>/</span>
            <Link href={`/course/${id}/test`}>Test Practice</Link>
            <span>/</span>
            <span>จัดการข้อสอบ</span>
          </nav>

          {/* Header */}
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>TEACHER ONLY</span>
              <h1>จัดการข้อสอบ</h1>
              <p>สร้าง แก้ไข และลบแบบทดสอบสำหรับรายวิชานี้</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.count}>{tests.length} แบบทดสอบ</div>
              <button
                className={styles.addButton}
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="สร้างแบบทดสอบใหม่"
                id="add-test-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                สร้างแบบทดสอบใหม่
              </button>
            </div>
          </header>

          {/* Test List with Manage Mode */}
          {isLoading ? (
            <div className={styles.loadingState}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : (
            <TestList
              tests={tests}
              isManageMode={true}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateTestModal
          courseId={id}
          createdById={userId}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
