'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  deleteSyllabusWeek,
  getListCourse,
  getSyllabus,
  upsertSyllabus,
} from '@/api/course/controller';
import type { SyllabusWeek } from '@/api/course/controller';
import { CoursePageLayout } from '@/components/course/CoursePageLayout';
import { CourseSyllabus } from '@/components/course/CourseSyllabus';
import { SyllabusEditModal } from '@/components/course/SyllabusEditModal';
import type { CourseDetail } from '@/components/course/types';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './course-detail.module.scss';

interface PanelHeaderProps {
  title: string;
  subtitle: string;
}

function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div className={styles.panelHeader}>
      <div className={styles.panelTitleGroup}>
        <div className={styles.panelIcon}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSubtitle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function CourseSyllabusPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { session } = useRoleGuard(['TEACHER', 'ADMIN', 'STUDENT'], '/login');
  const user = session?.user as { role?: 'TEACHER' | 'ADMIN' | 'STUDENT' };
  const canEdit = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeks, setWeeks] = useState<SyllabusWeek[]>([]);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<SyllabusWeek | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        setCourse(await getListCourse(`/course/${courseId}`, {}, {}));
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const fetchSyllabus = useCallback(async () => {
    if (!courseId) return;

    setIsSyllabusLoading(true);
    try {
      setWeeks((await getSyllabus(courseId)) ?? []);
    } catch (error) {
      console.error('Failed to fetch syllabus:', error);
      setWeeks([]);
    } finally {
      setIsSyllabusLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleToggleWeek = (week: number) => {
    setOpenWeeks((previousWeeks) => {
      const nextWeeks = new Set(previousWeeks);
      nextWeeks.has(week) ? nextWeeks.delete(week) : nextWeeks.add(week);
      return nextWeeks;
    });
  };

  const handleDeleteWeek = async (week: number) => {
    if (!confirm(`ต้องการลบสัปดาห์ที่ ${week} ใช่หรือไม่?`)) return;

    try {
      await deleteSyllabusWeek(courseId, week);
      await fetchSyllabus();
    } catch (error) {
      console.error('Failed to delete week:', error);
    }
  };

  const handleSaveWeek = async (
    week: number,
    data: { title: string; description: string; topics: string[] },
  ) => {
    await upsertSyllabus(courseId, week, data);
    await fetchSyllabus();
    setOpenWeeks((previousWeeks) => new Set([...previousWeeks, week]));
  };

  const courseName = course?.className ?? 'รายวิชา';

  return (
    <CoursePageLayout
      courseId={courseId}
      course={course}
      isLoading={isLoading}
      activeMenu="syllabus"
      userRole={user?.role}
    >
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/course">ห้องเรียน</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>{isLoading ? '...' : courseName}</span>
      </nav>

      <div className={styles.contentTitleRow}>
        <div>
          <h1 className={styles.contentTitle}>Course Syllabus</h1>
          <p className={styles.contentSubtitle}>
            เนื้อหาและแผนการสอนตลอดภาคการศึกษา
          </p>
        </div>
        {canEdit && !isSyllabusLoading && (
          <button
            className={styles.addWeekHeaderBtn}
            onClick={() => {
              setEditingWeek(null);
              setIsModalOpen(true);
            }}
            id="add-week-header-btn"
          >
            เพิ่มสัปดาห์
          </button>
        )}
      </div>

      <section className={styles.panel} id="syllabus-panel">
        <PanelHeader
          title="Course Syllabus"
          subtitle={
            isSyllabusLoading ? 'กำลังโหลด...' : `เนื้อหา ${weeks.length} สัปดาห์`
          }
        />
        <div className={styles.panelBody}>
          {isSyllabusLoading ? (
            <div className={styles.syllabusLoading}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={styles.skeletonLine} />
              ))}
            </div>
          ) : (
            <CourseSyllabus
              weeks={weeks}
              openWeeks={openWeeks}
              onToggleWeek={handleToggleWeek}
              canEdit={canEdit}
              onAddWeek={() => {
                setEditingWeek(null);
                setIsModalOpen(true);
              }}
              onEditWeek={(week) => {
                setEditingWeek(week);
                setIsModalOpen(true);
              }}
              onDeleteWeek={handleDeleteWeek}
            />
          )}
        </div>
      </section>

      {isModalOpen && (
        <SyllabusEditModal
          courseId={courseId}
          existingWeek={editingWeek}
          usedWeeks={weeks.map((week) => week.week)}
          onSave={handleSaveWeek}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </CoursePageLayout>
  );
}
