'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getListCourse } from '@/api/course/controller';
import { getTestsByCourse } from '@/api/test/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import type { TestSummary } from '@/types/test-type';
import styles from './dashboard.module.scss';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function TestDashboardListPage() {
  const params = useParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Guard — นักเรียนไม่ควรเข้าหน้านี้
  useEffect(() => {
    if (!isLoading && user && !isTeacherOrAdmin) {
      router.replace(`/course/${courseId}/test`);
    }
  }, [isLoading, user, isTeacherOrAdmin, courseId, router]);

  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${courseId}`;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Sidebar */}
        {isLoading ? (
          <aside className={styles.sidebar} />
        ) : (
          <CourseSidebar
            courseId={courseId}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu="test-dashboard"
            userRole={user?.role}
            onMenuChange={(menu) => {
              if (menu === 'syllabus') router.push(`/course/${courseId}`);
            }}
          />
        )}

        {/* Content */}
        <main className={styles.content}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/course">ห้องเรียน</Link>
            <span>/</span>
            <Link href={`/course/${courseId}`}>
              {isLoading ? '...' : courseName}
            </Link>
            <span>/</span>
            <Link href={`/course/${courseId}/test`}>Test Practice</Link>
            <span>/</span>
            <span>Dashboard คะแนน</span>
          </nav>

          {/* Header */}
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>TEACHER DASHBOARD</span>
              <h1>Dashboard คะแนน</h1>
              <p>ดูคะแนนนักเรียนรายบุคคลของแต่ละแบบทดสอบ</p>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              {tests.length} แบบทดสอบ
            </div>
          </header>

          {/* Test List */}
          {isLoading ? (
            <div className={styles.loadingState}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p>ยังไม่มีแบบทดสอบใน course นี้</p>
            </div>
          ) : (
            <div className={styles.testGrid}>
              {tests.map((test) => {
                const submitted = test._count.attempts;
                return (
                  <Link
                    key={test.id}
                    href={`/course/${courseId}/test/dashboard/${test.id}`}
                    className={styles.testCard}
                    id={`dashboard-test-${test.id}`}
                  >
                    {/* Icon */}
                    <div className={styles.testCardIcon}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className={styles.testCardInfo}>
                      <p className={styles.testCardTitle}>{test.title}</p>
                      <div className={styles.testCardMeta}>
                        <span className={styles.metaChip}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {test.durationMinutes} นาที
                        </span>
                        <span className={styles.metaChip}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                          {test._count.questions} ข้อ
                        </span>
                        <span className={styles.metaChip}>
                          โดย {test.createdBy.name ?? ''}{' '}
                          {test.createdBy.sureName ?? ''}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.testCardStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>{submitted}</span>
                        <span className={styles.statLabel}>ครั้งที่ส่ง</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={styles.testCardArrow}>
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
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
