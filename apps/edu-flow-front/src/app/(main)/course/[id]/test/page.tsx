'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import { getTestsByCourse, createTest } from '@/api/test/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { CreateTestModal } from '@/components/course/test/CreateTestModal';
import { TestList } from '@/components/course/test/TestList';
import type { TestSummary } from '@/types/TestType';
import styles from './test.module.scss';
import useUserStore from '@/store/userStore';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function TestPracticePage() {
  const params = useParams();
  const router = useRouter();
  const session = useUserStore((state) => state.session) as { id: string };
  const id = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ─── Fetch course & tests ─────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!id) return;
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
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${id}`;
  const userId = session?.id || '';

  // ─── Create test handler ──────────────────────────────────────
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
            activeMenu="test"
            onMenuChange={(menu) => {
              if (menu !== 'test') router.push(`/course/${id}`);
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
            <span>Test Practice</span>
          </nav>

          {/* Header */}
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>COURSE TESTS</span>
              <h1>Test Practice</h1>
              <p>แบบทดสอบทั้งหมดสำหรับรายวิชานี้ — เลือกแบบทดสอบเพื่อเริ่มทำ</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.count}>{tests.length} แบบทดสอบ</div>
              <button
                className={styles.addButton}
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="เพิ่มแบบทดสอบ"
                id="add-test-btn"
              >
                +
              </button>
            </div>
          </header>

          {/* Test List */}
          {isLoading ? (
            <div className={styles.loadingState}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : (
            <TestList tests={tests} />
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
