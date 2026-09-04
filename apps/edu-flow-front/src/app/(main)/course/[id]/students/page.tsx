'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRoleGuard } from '@/utils/useRoleGuard';
import { getListCourse, getEnrollments, addEnrollment } from '@/api/course/controller';
import { getListUsers } from '@/api/user/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import styles from './students.module.scss';

interface StudentItem {
  id: number;
  enrolledAt: string;
  student: {
    id: string;
    name: string | null;
    sureName: string | null;
    email: string;
  };
}

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

export default function ManageStudentsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { session } = useRoleGuard(['TEACHER', 'ADMIN'], '/course');
  const userRole = (session?.user as any)?.role as 'TEACHER' | 'ADMIN' | undefined;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollments, setEnrollments] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add student modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Search filter
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [courseData, enrollData] = await Promise.all([
        getListCourse(`/course/${id}`, {}, {}),
        getEnrollments(id),
      ]);
      setCourse(courseData);
      setEnrollments(enrollData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setAddError('');
    setAddSuccess('');
    setSelectedStudentId('');
    if (allStudents.length === 0) {
      setIsLoadingStudents(true);
      try {
        const res = await getListUsers('/users/student');
        setAllStudents(res.data || []);
      } catch {
        setAllStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      setAddError('กรุณาเลือกนักเรียน');
      return;
    }
    setIsAdding(true);
    setAddError('');
    try {
      await addEnrollment(id, selectedStudentId);
      setAddSuccess('เพิ่มนักเรียนสำเร็จ!');
      await fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setAddSuccess('');
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'เกิดข้อผิดพลาด';
      setAddError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const courseCode = course?.code ?? `COURSE-${id}`;
  const courseName = course?.className ?? 'รายวิชา';

  const enrolledIds = new Set(enrollments.map((e) => e.student.id));
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s.id));

  const filtered = enrollments.filter((e) => {
    const fullName = [e.student.name, e.student.sureName].filter(Boolean).join(' ').toLowerCase();
    return fullName.includes(search.toLowerCase()) || e.student.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        {isLoading ? (
          <aside className={styles.sidebar}>
            <div className={styles.skeletonBanner} />
            <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[80, 100, 100, 100].map((w, i) => (
                <div key={i} className={styles.skeletonLine} style={{ height: 36, width: `${w}%` }} />
              ))}
            </div>
          </aside>
        ) : (
          <CourseSidebar
            courseId={id}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu="manage-students"
            userRole={userRole}
            onMenuChange={(menu) => {
              router.push(`/course/${id}`);
            }}
          />
        )}

        {/* ── Main Content ── */}
        <main className={styles.content}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/course">ห้องเรียน</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href={`/course/${id}`}>{isLoading ? '...' : courseName}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span>Manage Students</span>
          </nav>

          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Manage Students</h1>
              <p className={styles.pageSubtitle}>
                จัดการรายชื่อนักเรียนใน{isLoading ? '...' : ` ${courseName}`}
              </p>
            </div>
            <button
              className={styles.addBtn}
              id="add-student-btn"
              onClick={handleOpenModal}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              เพิ่มนักเรียน
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{isLoading ? '—' : enrollments.length}</span>
              <span className={styles.statLabel}>นักเรียนทั้งหมด</span>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="ค้นหาชื่อหรืออีเมล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-student"
              />
            </div>
          </div>

          {/* Student List */}
          {isLoading ? (
            <div className={styles.studentGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar} />
                  <div style={{ flex: 1 }}>
                    <div className={styles.skeletonLine} style={{ height: 14, width: '60%' }} />
                    <div className={styles.skeletonLine} style={{ height: 12, width: '80%', marginTop: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.3}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>{search ? 'ไม่พบนักเรียนที่ค้นหา' : 'ยังไม่มีนักเรียนในรายวิชานี้'}</p>
              {!search && (
                <button className={styles.emptyAddBtn} onClick={handleOpenModal}>
                  เพิ่มนักเรียนคนแรก
                </button>
              )}
            </div>
          ) : (
            <div className={styles.studentGrid}>
              {filtered.map((enrollment, idx) => {
                const s = enrollment.student;
                const fullName = [s.name, s.sureName].filter(Boolean).join(' ') || '—';
                const initials = [s.name?.[0], s.sureName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
                const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];
                const color = colors[idx % colors.length];
                return (
                  <div key={enrollment.id} className={styles.studentCard} id={`student-card-${s.id}`}>
                    <div className={styles.avatarWrap} style={{ background: `${color}22`, borderColor: `${color}44` }}>
                      <span className={styles.avatarText} style={{ color }}>{initials}</span>
                    </div>
                    <div className={styles.studentInfo}>
                      <p className={styles.studentName}>{fullName}</p>
                      <p className={styles.studentEmail}>{s.email}</p>
                    </div>
                    <div className={styles.enrolledDate}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(enrollment.enrolledAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Add Student Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)} id="add-student-modal-overlay">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} id="add-student-modal">
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)} aria-label="ปิด">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h2 className={styles.modalTitle}>เพิ่มนักเรียนเข้าวิชา</h2>
              <p className={styles.modalSubtitle}>เลือกนักเรียนที่ต้องการเพิ่มเข้า {courseName}</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                เลือกนักเรียน <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={selectedStudentId}
                onChange={(e) => { setSelectedStudentId(e.target.value); setAddError(''); }}
                disabled={isLoadingStudents}
                id="select-student"
              >
                <option value="">
                  {isLoadingStudents ? 'กำลังโหลด...' : availableStudents.length === 0 ? 'ไม่มีนักเรียนที่เพิ่มได้' : '-- เลือกนักเรียน --'}
                </option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {[s.name, s.sureName].filter(Boolean).join(' ') || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {addError && (
              <div className={styles.msgError}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className={styles.msgSuccess}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {addSuccess}
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)} disabled={isAdding}>
                ยกเลิก
              </button>
              <button className={styles.submitBtn} onClick={handleAddStudent} disabled={isAdding || !selectedStudentId} id="confirm-add-student-btn">
                {isAdding ? (
                  <><span className={styles.spinner} /> กำลังเพิ่ม...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    เพิ่มนักเรียน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
