'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEnrollments, removeEnrollment } from '@/api/course/controller';
import { getListCourse } from '@/api/course/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { ImportCSVModal } from '@/components/course/ImportCSVModal';
import { AddStudentsModal } from '@/components/course/students/AddStudentsModal';
import { EditStudentModal } from '@/components/course/students/EditStudentModal';
import { StudentFilterToolbar } from '@/components/course/students/StudentFilterToolbar';
import { StudentList } from '@/components/course/students/StudentList';
import type { StudentItem } from '@/components/course/students/types';
import { useToast } from '@/components/ToastProvider';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './students.module.scss';

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function ManageStudentsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const notify = useToast();
  const requestVersion = useRef(0);
  const { session } = useRoleGuard(['TEACHER', 'ADMIN'], '/course');
  const userRole = (session?.user as any)?.role as 'TEACHER' | 'ADMIN' | undefined;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollments, setEnrollments] = useState<StudentItem[]>([]);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [courseSections, setCourseSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [actionError, setActionError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem['student'] | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    const version = ++requestVersion.current;
    setIsLoading(true);
    setActionError('');

    try {
      const [courseData, studentsData] = await Promise.all([
        getListCourse(`/course/${courseId}`, {}, {}),
        getEnrollments(courseId, {
          search: search.trim() || undefined,
          section: filterSection || undefined,
        }),
      ]);
      if (version !== requestVersion.current) return;

      setCourse(courseData);
      setEnrollments(studentsData.users);
      setStudentCount(studentsData.totalCount);
      setResultCount(studentsData.count);
      setCourseSections(studentsData.sections);
    } catch {
      if (version === requestVersion.current) {
        setStudentCount(null);
        setResultCount(null);
        setActionError('โหลดรายชื่อนักเรียนไม่สำเร็จ กรุณาลองใหม่');
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [courseId, filterSection, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchData(), 250);
    const refresh = () => void fetchData();
    window.addEventListener('focus', refresh);
    window.addEventListener('students-updated', refresh);
    return () => {
      window.clearTimeout(timer);
      ++requestVersion.current;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('students-updated', refresh);
    };
  }, [fetchData]);

  const handleRemoveStudent = async (student: StudentItem['student']) => {
    const name = [student.name, student.sureName].filter(Boolean).join(' ') || student.email;
    if (!window.confirm(`ต้องการนำ ${name} ออกจากรายวิชานี้หรือไม่?`)) return;

    setDeletingStudentId(student.id);
    setActionError('');
    try {
      await removeEnrollment(courseId, student.id);
      notify('นำนักเรียนออกจากรายวิชาสำเร็จ');
      await fetchData();
    } catch (error: any) {
      setActionError(error?.response?.data?.message || 'นำออกจากรายวิชาไม่สำเร็จ');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const courseCode = course?.code ?? `COURSE-${courseId}`;
  const courseName = course?.className ?? 'รายวิชา';
  const hasActiveFilter = Boolean(search || filterSection);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {isLoading ? <SidebarSkeleton /> : (
          <CourseSidebar
            courseId={courseId}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu="manage-students"
            userRole={userRole}
          />
        )}

        <main className={styles.content}>
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/course">ห้องเรียน</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href={`/course/${courseId}`}>{isLoading ? '...' : courseName}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span>Manage Students</span>
          </nav>

          <header className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Manage Students</h1>
              <p className={styles.pageSubtitle}>จัดการรายชื่อนักเรียนใน{isLoading ? '...' : ` ${courseName}`}</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.importCsvBtn} id="import-csv-btn" onClick={() => setIsCSVModalOpen(true)}>
                Import CSV
              </button>
              <button className={styles.addBtn} id="add-student-btn" onClick={() => setIsAddModalOpen(true)}>
                เพิ่มนักเรียน
              </button>
            </div>
          </header>

          {actionError && <div className={styles.msgError}>{actionError}</div>}

          <section className={styles.statsRow} aria-label="สรุปนักเรียน">
            <div className={styles.statCard}>
              <span className={styles.statValue}>{isLoading ? '—' : studentCount ?? '—'}</span>
              <span className={styles.statLabel}>นักเรียนทั้งหมด</span>
            </div>
            {courseSections.length > 0 && (
              <div className={styles.statCard}>
                <span className={styles.statValue}>{courseSections.length}</span>
                <span className={styles.statLabel}>ห้องเรียน</span>
              </div>
            )}
          </section>

          <StudentFilterToolbar
            search={search}
            section={filterSection}
            sections={courseSections}
            onSearchChange={setSearch}
            onSectionChange={setFilterSection}
          />

          {hasActiveFilter && !isLoading && resultCount !== null && (
            <p className={styles.selectionCount}>พบ {resultCount} คน</p>
          )}

          <StudentList
            enrollments={enrollments}
            isLoading={isLoading}
            hasActiveFilter={hasActiveFilter}
            canManageStudents={Boolean(userRole)}
            deletingStudentId={deletingStudentId}
            onAdd={() => setIsAddModalOpen(true)}
            onEdit={setEditingStudent}
            onRemove={handleRemoveStudent}
          />
        </main>
      </div>

      {isAddModalOpen && (
        <AddStudentsModal
          courseId={courseId}
          courseName={courseName}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={fetchData}
        />
      )}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onUpdated={fetchData}
        />
      )}
      {isCSVModalOpen && (
        <ImportCSVModal
          courseId={courseId}
          onClose={() => setIsCSVModalOpen(false)}
          onImported={fetchData}
        />
      )}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.skeletonBanner} />
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[80, 100, 100, 100].map((width, index) => (
          <div key={index} className={styles.skeletonLine} style={{ height: 36, width: `${width}%` }} />
        ))}
      </div>
    </aside>
  );
}
