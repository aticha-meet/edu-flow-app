'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRoleGuard } from '@/utils/useRoleGuard';
import {
  getListCourse,
  getEnrollments,
  addEnrollments,
  removeEnrollment,
} from '@/api/course/controller';
import {
  getListUsers,
  getStudentClassrooms,
  updateStudent,
} from '@/api/user/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { ImportCSVModal } from '@/components/course/ImportCSVModal';
import styles from './students.module.scss';
import { useToast } from '@/components/ToastProvider';

interface StudentProfile {
  studentId: string;
  section: string | null;
  room: number | null;
}

interface StudentItem {
  id: number;
  enrolledAt: string;
  student: {
    id: string;
    name: string | null;
    sureName: string | null;
    email: string;
    studentProfile?: StudentProfile | null;
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
  const notify = useToast();
  const requestVersion = useRef(0);

  const { session } = useRoleGuard(['TEACHER', 'ADMIN'], '/course');
  const userRole = (session?.user as any)?.role as
    | 'TEACHER'
    | 'ADMIN'
    | undefined;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollments, setEnrollments] = useState<StudentItem[]>([]);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [courseSections, setCourseSections] = useState<string[]>([]);
  const [studentsRevision, setStudentsRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Add student modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classroomOptions, setClassroomOptions] = useState<
    { section: string | null; room: number | null }[]
  >([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [studentRoom, setStudentRoom] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit/remove student state
  const [editingStudent, setEditingStudent] = useState<StudentItem['student'] | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    sureName: '',
    email: '',
    studentId: '',
    section: '',
    room: '',
  });
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // CSV Import modal
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    const version = ++requestVersion.current;
    setIsLoading(true);
    setActionError('');
    try {
      const [courseData, enrollData] = await Promise.all([
        getListCourse(`/course/${id}`, {}, {}),
        getEnrollments(id, { search: search.trim() || undefined, section: filterSection || undefined }),
      ]);
      if (version !== requestVersion.current) return;
      setCourse(courseData);
      setEnrollments(enrollData.users);
      setStudentCount(enrollData.totalCount);
      setResultCount(enrollData.count);
      setCourseSections(enrollData.sections);
    } catch (err) {
      if (version === requestVersion.current) {
        setStudentCount(null);
        setResultCount(null);
        setActionError('โหลดรายชื่อนักเรียนไม่สำเร็จ กรุณาลองใหม่');
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [id, search, filterSection]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 250);
    const refresh = () => {
      setStudentsRevision((value) => value + 1);
      setClassroomOptions([]);
      void fetchData();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('students-updated', refresh);
    return () => {
      window.clearTimeout(timer);
      ++requestVersion.current;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('students-updated', refresh);
    };
  }, [fetchData]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setAddError('');
    setAddSuccess('');
    setSelectedStudentIds([]);
    setStudentSearch('');
    setStudentSection('');
    setStudentRoom('');
  };

  useEffect(() => {
    if (!isModalOpen || !id) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoadingStudents(true);
      try {
        const res = await getListUsers('/users/student', {
          courseId: id,
          section: studentSection || undefined,
          room: studentRoom || undefined,
          search: studentSearch.trim() || undefined,
        });
        if (!cancelled) {
          setAllStudents(res.data.users);
          setAvailableCount(res.data.count);
        }
      } catch {
        if (!cancelled) {
          setAllStudents([]);
          setAvailableCount(null);
          setAddError('โหลดรายชื่อนักเรียนไม่สำเร็จ กรุณาลองใหม่');
        }
      } finally {
        if (!cancelled) setIsLoadingStudents(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [id, isModalOpen, studentRoom, studentSearch, studentSection, studentsRevision]);

  useEffect(() => {
    if (!isModalOpen || classroomOptions.length > 0) return;
    getStudentClassrooms()
      .then(setClassroomOptions)
      .catch(() => setClassroomOptions([]));
  }, [classroomOptions.length, isModalOpen]);

  const handleAddStudent = async () => {
    if (selectedStudentIds.length === 0) {
      setAddError('กรุณาเลือกนักเรียน');
      return;
    }
    setIsAdding(true);
    setAddError('');
    try {
      const result = await addEnrollments(id, selectedStudentIds);
      notify(result.added > 0 ? `เพิ่มนักเรียนสำเร็จ ${result.added} คน` : 'ไม่มีนักเรียนที่ถูกเพิ่มใหม่', result.added > 0 ? 'success' : 'info');
      await fetchData();
      setAddSuccess(`เพิ่มนักเรียนสำเร็จ ${result.added} คน`);
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

  const canManageStudents = userRole === 'TEACHER' || userRole === 'ADMIN';

  const handleOpenEdit = (student: StudentItem['student']) => {
    setEditingStudent(student);
    setEditError('');
    setActionError('');
    setEditForm({
      name: student.name ?? '',
      sureName: student.sureName ?? '',
      email: student.email,
      studentId: student.studentProfile?.studentId ?? '',
      section: student.studentProfile?.section ?? '',
      room: student.studentProfile?.room ? String(student.studentProfile.room) : '',
    });
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.studentId.trim()) {
      setEditError('กรุณากรอกชื่อ อีเมล และรหัสนักเรียนให้ครบถ้วน');
      return;
    }
    if (editForm.room && (!/^\d+$/.test(editForm.room) || Number(editForm.room) < 1)) {
      setEditError('ห้องต้องเป็นเลขจำนวนเต็มที่มากกว่า 0');
      return;
    }

    setIsUpdating(true);
    setEditError('');
    try {
      await updateStudent(editingStudent.id, {
        name: editForm.name.trim(),
        sureName: editForm.sureName.trim(),
        email: editForm.email.trim(),
        studentId: editForm.studentId.trim(),
        section: editForm.section.trim(),
        room: editForm.room ? Number(editForm.room) : null,
      });
      notify('แก้ไขข้อมูลนักเรียนสำเร็จ');
      setClassroomOptions([]);
      await fetchData();
      setEditingStudent(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'แก้ไขข้อมูลนักเรียนไม่สำเร็จ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveStudent = async (student: StudentItem['student']) => {
    if (!window.confirm(`ต้องการนำ ${[student.name, student.sureName].filter(Boolean).join(' ')} ออกจากรายวิชานี้หรือไม่?`)) {
      return;
    }

    setDeletingStudentId(student.id);
    setActionError('');
    try {
      await removeEnrollment(id, student.id);
      notify('นำนักเรียนออกจากรายวิชาสำเร็จ');
      await fetchData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'นำออกจากรายวิชาไม่สำเร็จ');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const courseCode = course?.code ?? `COURSE-${id}`;
  const courseName = course?.className ?? 'รายวิชา';

  // Inactive client filtering; retained pending approval to remove.
  /*
  const enrolledIds = new Set(enrollments.map((e) => e.student.id));
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s.id));
  */
  const availableStudents = allStudents;

  const modalSections = Array.from(
    new Set(
      classroomOptions
        .map((option) => option.section)
        .filter(Boolean) as string[],
    ),
  ).sort();
  const modalRooms = Array.from(
    new Set(
      classroomOptions
        .filter(
          (option) => !studentSection || option.section === studentSection,
        )
        .map((option) => option.room)
        .filter((room): room is number => room !== null && room !== undefined),
    ),
  ).sort((a, b) => a - b);
  // รายการนี้ถูกกรองจาก API แล้ว จึงไม่ต้องโหลดนักเรียนทั้งหมดมา filter ที่ browser
  const filteredAvailableStudents = availableStudents;
  const allVisibleSelected =
    filteredAvailableStudents.length > 0 &&
    filteredAvailableStudents.every((s) => selectedStudentIds.includes(s.id));

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
    setAddError('');
  };

  const toggleAllVisibleStudents = () => {
    setSelectedStudentIds((current) => {
      if (allVisibleSelected) {
        const visibleIds = new Set(filteredAvailableStudents.map((s) => s.id));
        return current.filter((studentId) => !visibleIds.has(studentId));
      }
      return Array.from(
        new Set([...current, ...filteredAvailableStudents.map((s) => s.id)]),
      );
    });
    setAddError('');
  };

  // ดึง unique sections สำหรับ filter dropdown
  // Inactive client filtering; retained pending approval to remove.
  /*
  const sections = Array.from(
    new Set(
      enrollments
        .map((e) => e.student.studentProfile?.section)
        .filter(Boolean) as string[],
    ),
  ).sort();

  const filtered = enrollments.filter((e) => {
    const fullName = [e.student.name, e.student.sureName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      e.student.email.toLowerCase().includes(search.toLowerCase());
    const matchSection = filterSection
      ? e.student.studentProfile?.section === filterSection
      : true;
    return matchSearch && matchSection;
  });
  */
  const filtered = enrollments;

  // สร้าง label ห้องเรียน
  const classroomLabel = (profile?: StudentProfile | null) => {
    if (!profile) return null;
    const parts = [
      profile.section,
      profile.room ? `ห้อง ${profile.room}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  };

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
              {[80, 100, 100, 100].map((w, i) => (
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
            activeMenu="manage-students"
            userRole={userRole}
            onMenuChange={() => {
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
            <div className={styles.headerActions}>
              {/* Import CSV */}
              <button
                className={styles.importCsvBtn}
                id="import-csv-btn"
                onClick={() => setIsCSVModalOpen(true)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Import CSV
              </button>
              {/* Add single student */}
              <button
                className={styles.addBtn}
                id="add-student-btn"
                onClick={handleOpenModal}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                เพิ่มนักเรียน
              </button>
            </div>
          </div>

          {actionError && <div className={styles.msgError}>{actionError}</div>}

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {isLoading ? '—' : studentCount ?? '—'}
              </span>
              <span className={styles.statLabel}>นักเรียนทั้งหมด</span>
            </div>
            {courseSections.length > 0 && (
              <div className={styles.statCard}>
                <span className={styles.statValue}>{courseSections.length}</span>
                <span className={styles.statLabel}>ห้องเรียน</span>
              </div>
            )}
          </div>

          {/* Search & Filter Row */}
          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.searchIcon}
              >
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
            {/* Section filter */}
            {courseSections.length > 0 && (
              <select
                className={styles.filterSelect}
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                id="filter-section"
              >
                <option value="">ทุกห้อง</option>
                {courseSections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {(search || filterSection) && !isLoading && resultCount !== null && (
            <p className={styles.selectionCount}>พบ {resultCount} คน</p>
          )}
          {/* Student List */}
          {isLoading ? (
            <div className={styles.studentGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar} />
                  <div style={{ flex: 1 }}>
                    <div
                      className={styles.skeletonLine}
                      style={{ height: 14, width: '60%' }}
                    />
                    <div
                      className={styles.skeletonLine}
                      style={{ height: 12, width: '80%', marginTop: 8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.3}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>
                {search || filterSection
                  ? 'ไม่พบนักเรียนที่ค้นหา'
                  : 'ยังไม่มีนักเรียนในรายวิชานี้'}
              </p>
              {!search && !filterSection && (
                <button
                  className={styles.emptyAddBtn}
                  onClick={handleOpenModal}
                >
                  เพิ่มนักเรียนคนแรก
                </button>
              )}
            </div>
          ) : (
            <div className={styles.studentGrid}>
              {filtered.map((enrollment, idx) => {
                const s = enrollment.student;
                const fullName =
                  [s.name, s.sureName].filter(Boolean).join(' ') || '—';
                const initials =
                  [s.name?.[0], s.sureName?.[0]]
                    .filter(Boolean)
                    .join('')
                    .toUpperCase() || '?';
                const colors = [
                  '#6366f1',
                  '#8b5cf6',
                  '#06b6d4',
                  '#f59e0b',
                  '#10b981',
                  '#ec4899',
                ];
                const color = colors[idx % colors.length];
                const classroom = classroomLabel(s.studentProfile);
                return (
                  <div
                    key={enrollment.id}
                    className={styles.studentCard}
                    id={`student-card-${s.id}`}
                  >
                    <div
                      className={styles.avatarWrap}
                      style={{
                        background: `${color}22`,
                        borderColor: `${color}44`,
                      }}
                    >
                      <span className={styles.avatarText} style={{ color }}>
                        {initials}
                      </span>
                    </div>
                    <div className={styles.studentInfo}>
                      <p className={styles.studentName}>{fullName}</p>
                      <p className={styles.studentEmail}>{s.email}</p>
                      {/* Classroom badge */}
                      {classroom && (
                        <span className={styles.classroomBadge}>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {classroom}
                        </span>
                      )}
                    </div>
                    <div className={styles.enrolledDate}>
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
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(enrollment.enrolledAt).toLocaleDateString(
                        'th-TH',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </div>
                    {canManageStudents && (
                      <div className={styles.studentActions}>
                        <button
                          type="button"
                          className={styles.editStudentBtn}
                          onClick={() => handleOpenEdit(s)}
                          aria-label={`แก้ไขข้อมูล ${fullName}`}
                          title="แก้ไขข้อมูลนักเรียน"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.deleteStudentBtn}
                          onClick={() => handleRemoveStudent(s)}
                          disabled={deletingStudentId === s.id}
                          aria-label={`นำ ${fullName} ออกจากรายวิชา`}
                          title="นำออกจากรายวิชา"
                        >
                          {deletingStudentId === s.id ? (
                            <span className={styles.spinner} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Add Student Modal ── */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
          id="add-student-modal-overlay"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            id="add-student-modal"
          >
            <button
              className={styles.modalClose}
              onClick={() => setIsModalOpen(false)}
              aria-label="ปิด"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h2 className={styles.modalTitle}>เพิ่มนักเรียนเข้าวิชา</h2>
              <p className={styles.modalSubtitle}>
                เลือกนักเรียนที่ต้องการเพิ่มเข้า {courseName}
              </p>
            </div>

            <div className={styles.studentPicker}>
              <div className={styles.pickerToolbar}>
                <div>
                  <p className={styles.formLabel}>เลือกนักเรียน</p>
                  <p className={styles.selectionCount}>
                    เลือกแล้ว {selectedStudentIds.length} จาก{' '}
                    {isLoadingStudents ? '…' : availableCount ?? '—'} คน
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.selectAllBtn}
                  onClick={toggleAllVisibleStudents}
                  disabled={
                    isLoadingStudents || filteredAvailableStudents.length === 0
                  }
                >
                  {allVisibleSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
              </div>

              <div className={styles.pickerFilters}>
                <input
                  className={styles.pickerSearch}
                  type="search"
                  placeholder="ค้นหาชื่อ อีเมล หรือรหัสนักเรียน"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <select
                  className={styles.pickerSelect}
                  value={studentSection}
                  onChange={(e) => {
                    setStudentSection(e.target.value);
                    setStudentRoom('');
                  }}
                >
                  <option value="">ทุกระดับชั้น</option>
                  {modalSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.pickerSelect}
                  value={studentRoom}
                  onChange={(e) => setStudentRoom(e.target.value)}
                >
                  <option value="">ทุกห้อง</option>
                  {modalRooms.map((room) => (
                    <option key={room} value={String(room)}>
                      ห้อง {room}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.studentOptions}>
                {isLoadingStudents ? (
                  <div className={styles.optionsEmpty}>
                    กำลังโหลดรายชื่อนักเรียน...
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className={styles.optionsEmpty}>
                    ไม่พบนักเรียนที่ตรงกับตัวกรอง
                  </div>
                ) : (
                  filteredAvailableStudents.map((s) => {
                    const fullName =
                      [s.name, s.sureName].filter(Boolean).join(' ') || s.email;
                    const classroom = [
                      s.studentProfile?.section,
                      s.studentProfile?.room
                        ? `ห้อง ${s.studentProfile.room}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ');
                    const checked = selectedStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`${styles.studentOption} ${checked ? styles.studentOptionSelected : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudent(s.id)}
                        />
                        <span className={styles.checkboxMark} />
                        <span className={styles.optionInfo}>
                          <span className={styles.optionName}>{fullName}</span>
                          <span className={styles.optionMeta}>
                            {classroom || 'ยังไม่มีข้อมูลห้อง'} · {s.email}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {addError && (
              <div className={styles.msgError}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className={styles.msgSuccess}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {addSuccess}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={isAdding}
              >
                ยกเลิก
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleAddStudent}
                disabled={isAdding || selectedStudentIds.length === 0}
                id="confirm-add-student-btn"
              >
                {isAdding ? (
                  <>
                    <span className={styles.spinner} /> กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

      {/* ── Edit Student Modal ── */}
      {editingStudent && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isUpdating && setEditingStudent(null)}
          id="edit-student-modal-overlay"
        >
          <div
            className={`${styles.modal} ${styles.editModal}`}
            onClick={(e) => e.stopPropagation()}
            id="edit-student-modal"
          >
            <button
              className={styles.modalClose}
              onClick={() => setEditingStudent(null)}
              disabled={isUpdating}
              aria-label="ปิด"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className={styles.modalHeader}>
              <div className={`${styles.modalIcon} ${styles.editModalIcon}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <h2 className={styles.modalTitle}>แก้ไขข้อมูลนักเรียน</h2>
              <p className={styles.modalSubtitle}>ข้อมูลจะถูกอัปเดตในระบบกลาง</p>
            </div>

            <div className={styles.editFormGrid}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>ชื่อ *</span>
                <input className={styles.formInput} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>นามสกุล</span>
                <input className={styles.formInput} value={editForm.sureName} onChange={(e) => setEditForm({ ...editForm, sureName: e.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>อีเมล *</span>
                <input type="email" className={styles.formInput} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>รหัสนักเรียน *</span>
                <input className={styles.formInput} value={editForm.studentId} onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>ระดับชั้น</span>
                <input className={styles.formInput} value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })} />
              </label>
              <label className={styles.formField}>
                <span className={styles.formLabel}>ห้อง</span>
                <input type="number" min="1" className={styles.formInput} value={editForm.room} onChange={(e) => setEditForm({ ...editForm, room: e.target.value })} />
              </label>
            </div>

            {editError && <div className={styles.msgError}>{editError}</div>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditingStudent(null)} disabled={isUpdating}>ยกเลิก</button>
              <button className={styles.submitBtn} onClick={handleUpdateStudent} disabled={isUpdating}>
                {isUpdating ? <><span className={styles.spinner} /> กำลังบันทึก...</> : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import CSV Modal ── */}
      {isCSVModalOpen && (
        <ImportCSVModal
          courseId={id}
          onClose={() => setIsCSVModalOpen(false)}
          onImported={fetchData}
        />
      )}
    </div>
  );
}
