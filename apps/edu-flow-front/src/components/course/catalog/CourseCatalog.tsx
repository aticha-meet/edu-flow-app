import styles from '@/app/(main)/course/course.module.scss';
import type { CourseStatus, CourseSummary } from './types';

const COURSE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#ef4444', '#14b8a6'];
const STATUS_LABEL: Record<CourseStatus, string> = { active: 'กำลังเรียน', upcoming: 'เร็วๆ นี้', complete: 'เสร็จสิ้น' };

interface CourseCatalogProps {
  courses: CourseSummary[];
  status: 'all' | CourseStatus;
  isLoading: boolean;
  onStatusChange: (status: 'all' | CourseStatus) => void;
  onOpenCourse: (courseId: string) => void;
}

export function CourseCatalog({ courses, status, isLoading, onStatusChange, onOpenCourse }: CourseCatalogProps) {
  const visibleCourses = status === 'all' ? courses : courses.filter((course) => course.status === status);

  return (
    <>
      <div className={styles.filterRow} aria-label="กรองรายวิชา">
        {(['all', 'active', 'upcoming', 'complete'] as const).map((item) => (
          <button
            key={item}
            id={`filter-${item}`}
            className={`${styles.filterTab} ${status === item ? styles.filterTabActive : ''}`}
            onClick={() => onStatusChange(item)}
          >
            {item === 'all' ? 'ทั้งหมด' : STATUS_LABEL[item]}
          </button>
        ))}
      </div>

      {isLoading ? <CourseGridSkeleton /> : visibleCourses.length === 0 ? <EmptyCourseList /> : (
        <div className={styles.grid}>
          {visibleCourses.map((course) => <CourseCard key={course.id} course={course} onOpen={() => onOpenCourse(course.id)} />)}
        </div>
      )}
    </>
  );
}

function CourseCard({ course, onOpen }: { course: CourseSummary; onOpen: () => void }) {
  const color = COURSE_COLORS[course.id.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % COURSE_COLORS.length];
  const instructor = [course.teacher?.name, course.teacher?.sureName].filter(Boolean).join(' ') || 'ไม่ระบุ';
  const progress = course.maxStudents > 0 ? Math.min((course._count.enrollments / course.maxStudents) * 100, 100) : 0;

  return (
    <article className={styles.card} id={`class-card-${course.id}`}>
      <div className={styles.cardAccent} style={{ background: color }} />
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.classCode} style={{ color }}>{course.code || '-'}</span>
          <span className={`${styles.badge} ${styles[`badge_${course.status}`]}`}>{STATUS_LABEL[course.status]}</span>
        </div>
        <h2 className={styles.className}>{course.className}</h2>
        <p className={styles.instructor}>ผู้สอน: {instructor}</p>
        <div className={styles.infoGrid}><div className={styles.infoItem}>ห้อง: {course.roomId || 'ไม่ระบุ'}</div></div>
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}><span>นักศึกษา</span><span style={{ color }}>{course._count.enrollments} / {course.maxStudents}</span></div>
          <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${progress}%`, background: color }} /></div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <button className={styles.detailBtn} onClick={onOpen} style={{ '--accent': color } as React.CSSProperties}>ดูรายละเอียด <span aria-hidden="true">→</span></button>
      </div>
    </article>
  );
}

function CourseGridSkeleton() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonBar} style={{ width: '60%', height: 12 }} />
          <div className={styles.skeletonBar} style={{ width: '90%', height: 20, marginTop: 12 }} />
          <div className={styles.skeletonBar} style={{ width: '75%', height: 12, marginTop: 8 }} />
          <div className={styles.skeletonBar} style={{ width: '50%', height: 12, marginTop: 24 }} />
          <div className={styles.skeletonBar} style={{ width: '100%', height: 8, marginTop: 16 }} />
        </div>
      ))}
    </div>
  );
}

function EmptyCourseList() {
  return <div className={styles.empty}><p>ไม่พบรายวิชาในหมวดนี้</p></div>;
}
