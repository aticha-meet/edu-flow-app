'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CourseSidebar, type MenuKey } from '@/components/course/CourseSidebar';
import { CourseSyllabus } from '@/components/course/CourseSyllabus';
import { SyllabusEditModal } from '@/components/course/SyllabusEditModal';
import { getListCourse, getSyllabus, upsertSyllabus, deleteSyllabusWeek } from '@/api/course/controller';
import type { SyllabusWeek } from '@/api/course/controller';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './course-detail.module.scss';

interface CourseDetail {
  id: number;
  code: string | null;
  className: string;
  description: string | null;
  maxStudents: number;
  status: 'active' | 'upcoming' | 'complete';
  teacher: { name: string | null; sureName: string | null };
  _count: { enrollments: number };
}

// ─── Panel Header Helper ─────────────────────────────────────
interface PanelHeaderProps {
  iconPath: React.ReactNode;
  title: string;
  subtitle: string;
}

const PanelHeader = ({ iconPath, title, subtitle }: PanelHeaderProps) => (
  <div className={styles.panelHeader}>
    <div className={styles.panelTitleGroup}>
      <div className={styles.panelIcon}>{iconPath}</div>
      <div>
        <h2 className={styles.panelTitle}>{title}</h2>
        <p className={styles.panelSubtitle}>{subtitle}</p>
      </div>
    </div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { session } = useRoleGuard(['TEACHER', 'ADMIN', 'STUDENT'], '/login');
  const userRole = (session?.user as any)?.role as
    | 'TEACHER'
    | 'ADMIN'
    | 'STUDENT'
    | undefined;

  const canEdit = userRole === 'TEACHER' || userRole === 'ADMIN';

  const [activeMenu, setActiveMenu] = useState<MenuKey>('syllabus');
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));

  // ─── Syllabus State ───────────────────────────────────────
  const [syllabusWeeks, setSyllabusWeeks] = useState<SyllabusWeek[]>([]);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<SyllabusWeek | null>(null);

  // Fetch course detail
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const data = await getListCourse(`/course/${id}`, {}, {});
        setCourse(data);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  // Fetch syllabus
  const fetchSyllabus = useCallback(async () => {
    if (!id) return;
    setIsSyllabusLoading(true);
    try {
      const data = await getSyllabus(id);
      setSyllabusWeeks(data ?? []);
    } catch (err) {
      console.error('Failed to fetch syllabus:', err);
      setSyllabusWeeks([]);
    } finally {
      setIsSyllabusLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleToggleWeek = (week: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  // ─── Syllabus Handlers ────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingWeek(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (week: SyllabusWeek) => {
    setEditingWeek(week);
    setIsModalOpen(true);
  };

  const handleDeleteWeek = async (week: number) => {
    if (!confirm(`ต้องการลบสัปดาห์ที่ ${week} ใช่หรือไม่?`)) return;
    try {
      await deleteSyllabusWeek(id, week);
      await fetchSyllabus();
    } catch (err) {
      console.error('Failed to delete week:', err);
    }
  };

  const handleSaveWeek = async (
    week: number,
    data: { title: string; description: string; topics: string[] },
  ) => {
    await upsertSyllabus(id, week, data);
    await fetchSyllabus();
    // Auto-open the saved week
    setOpenWeeks((prev) => new Set([...prev, week]));
  };

  const courseCode = course?.code ?? `COURSE-${id}`;
  const courseName = course?.className ?? 'รายวิชา';
  const usedWeeks = syllabusWeeks.map((w) => w.week);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        {isLoading ? (
          <aside className={styles.sidebar}>
            <div className={styles.skeletonBanner} />
            <div
              style={{
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[80, 100, 100].map((w, i) => (
                <div
                  key={i}
                  className={styles.skeletonLine}
                  style={{ height: 36, width: `${w}%` }}
                />
              ))}
            </div>
          </aside>
        ) : (
          <CourseSidebar
            courseId={id}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu={activeMenu}
            userRole={userRole}
            onMenuChange={(menu) => {
              if (menu !== 'test') setActiveMenu(menu);
            }}
          />
        )}

        {/* ── Main Content ── */}
        <main className={styles.content} id="course-content">
          {/* Breadcrumb */}
          <div>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <Link href="/course">ห้องเรียน</Link>
              <span className={styles.breadcrumbSep}>›</span>
              <span>{isLoading ? '...' : courseName}</span>
            </nav>
          </div>

          {/* Title Row */}
          <div className={styles.contentTitleRow}>
            <div>
              <h1 className={styles.contentTitle}>Course Syllabus</h1>
              <p className={styles.contentSubtitle}>
                เนื้อหาและแผนการสอนตลอดภาคการศึกษา
              </p>
            </div>
            {/* Add Week Button (TEACHER/ADMIN เท่านั้น) */}
            {canEdit && !isSyllabusLoading && (
              <button
                className={styles.addWeekHeaderBtn}
                onClick={handleOpenAdd}
                id="add-week-header-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                เพิ่มสัปดาห์
              </button>
            )}
          </div>

          {/* Panel */}
          <div className={styles.panel} id="syllabus-panel">
            <PanelHeader
              iconPath={
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              }
              title="Course Syllabus"
              subtitle={
                isSyllabusLoading
                  ? 'กำลังโหลด...'
                  : `เนื้อหา ${syllabusWeeks.length} สัปดาห์`
              }
            />
            <div className={styles.panelBody}>
              {isSyllabusLoading ? (
                <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={styles.skeletonLine}
                      style={{ height: 52, borderRadius: 10 }}
                    />
                  ))}
                </div>
              ) : (
                <CourseSyllabus
                  weeks={syllabusWeeks}
                  openWeeks={openWeeks}
                  onToggleWeek={handleToggleWeek}
                  canEdit={canEdit}
                  onAddWeek={handleOpenAdd}
                  onEditWeek={handleOpenEdit}
                  onDeleteWeek={handleDeleteWeek}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Syllabus Edit Modal ── */}
      {isModalOpen && (
        <SyllabusEditModal
          courseId={id}
          existingWeek={editingWeek}
          usedWeeks={usedWeeks}
          onSave={handleSaveWeek}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
