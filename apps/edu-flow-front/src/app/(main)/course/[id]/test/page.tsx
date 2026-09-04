'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import { getTestsByCourse } from '@/api/test/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { TestList } from '@/components/course/test/TestList';
import type { TestSummary } from '@/types/test-type';
import styles from './test.module.scss';
import { useSession } from 'next-auth/react';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function TestPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  console.log(sessionData);
  const user = sessionData?.user as any;
  const id = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [setIsCreateModalOpen] = useState(false);

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
  // const userId = user?.id || '';

  // ─── Create test handler ──────────────────────────────────────
  // const handleCreate = async (
  //   title: string,
  //   questions: Array<{
  //     questionText: string;
  //     choices: Array<{ value: string; isCorrect: boolean }>;
  //   }>,
  // ) => {
  //   await createTest({
  //     title,
  //     courseId: id,
  //     createdById: userId,
  //     questions: questions.map((q, qi) => ({
  //       questionText: q.questionText,
  //       order: qi,
  //       choices: q.choices.map((c, ci) => ({
  //         value: c.value,
  //         isCorrect: c.isCorrect,
  //         order: ci,
  //       })),
  //     })),
  //   });
  //   // setIsCreateModalOpen(false);
  //   // Refresh list
  //   await fetchData();
  // };

  // Check role
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

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
            userRole={user?.role}
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
              {isTeacherOrAdmin && (
                <>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: 'rgba(99,102,241,0.1)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    type="button"
                    onClick={() => router.push(`/course/${id}/test/dashboard`)}
                    aria-label="ดู Dashboard คะแนน"
                    id="dashboard-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard คะแนน
                  </button>
                  <button
                    className={styles.manageButton}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#fff',
                      color: '#6366f1',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    type="button"
                    onClick={() => router.push(`/course/${id}/test/manage`)}
                    aria-label="จัดการข้อสอบ"
                    id="manage-test-btn"
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    จัดการข้อสอบ
                  </button>
                </>
              )}
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
    </div>
  );
}
