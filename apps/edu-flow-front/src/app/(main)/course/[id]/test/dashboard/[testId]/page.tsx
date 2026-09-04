'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getListCourse } from '@/api/course/controller';
import { getTestScoreDashboard } from '@/api/test/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import type { TestScoreDashboard, StudentScoreRow } from '@/types/test-type';
import styles from '../dashboard.module.scss';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

type SortKey = 'name' | 'score' | 'percentage';

function getLevel(pct: number | null): 'high' | 'mid' | 'low' | 'none' {
  if (pct === null) return 'none';
  if (pct >= 70) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
}

export default function TestScoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  const courseId = params?.id as string;
  const testId = params?.testId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [dashboard, setDashboard] = useState<TestScoreDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('score');

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const fetchData = useCallback(async () => {
    if (!courseId || !testId) return;
    setIsLoading(true);
    try {
      const [courseData, dashData] = await Promise.all([
        getListCourse(`/course/${courseId}`, {}, {}),
        getTestScoreDashboard(testId),
      ]);
      setCourse(courseData);
      setDashboard(dashData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, testId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isLoading && user && !isTeacherOrAdmin) {
      router.replace(`/course/${courseId}/test`);
    }
  }, [isLoading, user, isTeacherOrAdmin, courseId, router]);

  // ─── Sort students ─────────────────────────────────────────────
  const sorted = useMemo<StudentScoreRow[]>(() => {
    if (!dashboard) return [];
    return [...dashboard.students].sort((a, b) => {
      if (sortKey === 'name') {
        const na = `${a.name ?? ''} ${a.sureName ?? ''}`.trim();
        const nb = `${b.name ?? ''} ${b.sureName ?? ''}`.trim();
        return na.localeCompare(nb, 'th');
      }
      if (sortKey === 'score') {
        return (b.bestScore ?? -1) - (a.bestScore ?? -1);
      }
      // percentage
      return (b.percentage ?? -1) - (a.percentage ?? -1);
    });
  }, [dashboard, sortKey]);

  // ─── Summary stats ─────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    if (!dashboard) return { total: 0, attempted: 0, avgPct: null, passed: 0 };
    const total = dashboard.students.length;
    const attempted = dashboard.students.filter((s) => s.attempts.length > 0).length;
    const percentages = dashboard.students
      .map((s) => s.percentage)
      .filter((p): p is number => p !== null);
    const avgPct = percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : null;
    const passed = dashboard.students.filter((s) => (s.percentage ?? 0) >= 70).length;
    return { total, attempted, avgPct, passed };
  }, [dashboard]);

  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${courseId}`;
  const testTitle = dashboard?.test.title ?? '...';
  const totalQ = dashboard?.test.totalQuestions ?? 0;

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
            <Link href={`/course/${courseId}`}>{isLoading ? '...' : courseName}</Link>
            <span>/</span>
            <Link href={`/course/${courseId}/test`}>Test Practice</Link>
            <span>/</span>
            <Link href={`/course/${courseId}/test/dashboard`}>Dashboard คะแนน</Link>
            <span>/</span>
            <span>{isLoading ? '...' : testTitle}</span>
          </nav>

          {/* Back + Header */}
          <div style={{ marginBottom: 20 }}>
            <Link href={`/course/${courseId}/test/dashboard`} className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              กลับรายการ
            </Link>
          </div>

          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>SCORE DASHBOARD</span>
              <h1>{isLoading ? 'กำลังโหลด...' : testTitle}</h1>
              <p>
                {totalQ} ข้อ · {dashboard?.test.durationMinutes ?? 0} นาที · คะแนนผ่าน 70%
              </p>
            </div>
          </header>

          {/* Loading */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.summaryBar}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={styles.skeletonCard} style={{ height: 72 }} />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : !dashboard ? (
            <div className={styles.emptyState}>
              <p>ไม่สามารถโหลดข้อมูลได้</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className={styles.summaryBar}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryValue} data-color="purple">
                    {summaryStats.total}
                  </span>
                  <span className={styles.summaryLabel}>นักเรียนทั้งหมด</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryValue} data-color="yellow">
                    {summaryStats.attempted}
                  </span>
                  <span className={styles.summaryLabel}>ทำแล้ว</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryValue} data-color="green">
                    {summaryStats.passed}
                  </span>
                  <span className={styles.summaryLabel}>ผ่าน (≥70%)</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryValue} data-color="purple">
                    {summaryStats.avgPct !== null ? `${summaryStats.avgPct}%` : '-'}
                  </span>
                  <span className={styles.summaryLabel}>เฉลี่ย (คนที่ทำแล้ว)</span>
                </div>
              </div>

              {/* Sort controls */}
              <div className={styles.sortControls}>
                <span className={styles.sortLabel}>เรียงตาม:</span>
                {(['score', 'percentage', 'name'] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    className={`${styles.sortBtn} ${sortKey === key ? styles.active : ''}`}
                    onClick={() => setSortKey(key)}
                    id={`sort-${key}-btn`}
                  >
                    {key === 'score' ? 'คะแนนสูงสุด' : key === 'percentage' ? '%' : 'ชื่อ'}
                  </button>
                ))}
              </div>

              {/* Score Table */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>นักเรียน</th>
                      <th>ครั้งที่ 1</th>
                      <th>ครั้งที่ 2</th>
                      <th>คะแนนสูงสุด</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((student, idx) => {
                      const level = getLevel(student.percentage);
                      const fullName = `${student.name ?? ''} ${student.sureName ?? ''}`.trim() || 'ไม่ระบุชื่อ';
                      const attempt1 = student.attempts.find((a) => a.attemptNumber === 1);
                      const attempt2 = student.attempts.find((a) => a.attemptNumber === 2);

                      return (
                        <tr key={student.id} id={`student-row-${student.id}`}>
                          {/* Rank */}
                          <td>
                            <span
                              className={styles.rank}
                              data-top={idx < 3 && student.bestScore !== null ? String(idx + 1) : undefined}
                            >
                              {student.bestScore !== null ? idx + 1 : '—'}
                            </span>
                          </td>

                          {/* Name */}
                          <td>
                            <p className={styles.studentName}>{fullName}</p>
                            {student.studentId && (
                              <p className={styles.studentCode}>{student.studentId}</p>
                            )}
                          </td>

                          {/* Attempt 1 */}
                          <td>
                            {attempt1 ? (
                              <span
                                className={styles.attemptPill}
                                data-cheat={String(attempt1.submittedByCheat)}
                                title={attempt1.submittedByCheat ? 'ส่งอัตโนมัติเนื่องจากโกง' : undefined}
                              >
                                {attempt1.submittedByCheat && (
                                  <svg className={styles.cheatIcon} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                  </svg>
                                )}
                                {attempt1.score ?? '?'}/{totalQ}
                              </span>
                            ) : (
                              <span className={styles.notAttempted}>—</span>
                            )}
                          </td>

                          {/* Attempt 2 */}
                          <td>
                            {attempt2 ? (
                              <span
                                className={styles.attemptPill}
                                data-cheat={String(attempt2.submittedByCheat)}
                                title={attempt2.submittedByCheat ? 'ส่งอัตโนมัติเนื่องจากโกง' : undefined}
                              >
                                {attempt2.submittedByCheat && (
                                  <svg className={styles.cheatIcon} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                  </svg>
                                )}
                                {attempt2.score ?? '?'}/{totalQ}
                              </span>
                            ) : (
                              <span className={styles.notAttempted}>—</span>
                            )}
                          </td>

                          {/* Best Score */}
                          <td>
                            <div className={styles.scoreCell}>
                              <span className={styles.scoreBadge} data-level={level}>
                                {student.bestScore !== null
                                  ? `${student.bestScore}/${totalQ}`
                                  : 'ยังไม่ทำ'}
                              </span>
                            </div>
                          </td>

                          {/* Percentage Bar */}
                          <td>
                            {student.percentage !== null ? (
                              <div className={styles.pctBar}>
                                <div className={styles.pctTrack}>
                                  <div
                                    className={styles.pctFill}
                                    data-level={level}
                                    style={{ width: `${student.percentage}%` }}
                                  />
                                </div>
                                <span className={styles.pctText}>{student.percentage}%</span>
                              </div>
                            ) : (
                              <span className={styles.notAttempted}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
