import styles from '@/app/(main)/course/[id]/students/students.module.scss';
import type { StudentItem, StudentProfile } from './types';

interface StudentListProps {
  enrollments: StudentItem[];
  isLoading: boolean;
  hasActiveFilter: boolean;
  canManageStudents: boolean;
  deletingStudentId: string | null;
  onAdd: () => void;
  onEdit: (student: StudentItem['student']) => void;
  onRemove: (student: StudentItem['student']) => void;
}

const avatarColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

export function StudentList({
  enrollments,
  isLoading,
  hasActiveFilter,
  canManageStudents,
  deletingStudentId,
  onAdd,
  onEdit,
  onRemove,
}: StudentListProps) {
  if (isLoading) return <StudentListSkeleton />;

  if (enrollments.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.3}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p>{hasActiveFilter ? 'ไม่พบนักเรียนที่ค้นหา' : 'ยังไม่มีนักเรียนในรายวิชานี้'}</p>
        {!hasActiveFilter && <button className={styles.emptyAddBtn} onClick={onAdd}>เพิ่มนักเรียนคนแรก</button>}
      </div>
    );
  }

  return (
    <div className={styles.studentGrid}>
      {enrollments.map((enrollment, index) => (
        <StudentCard
          key={enrollment.id}
          enrollment={enrollment}
          color={avatarColors[index % avatarColors.length]}
          canManageStudents={canManageStudents}
          isRemoving={deletingStudentId === enrollment.student.id}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function StudentListSkeleton() {
  return (
    <div className={styles.studentGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonAvatar} />
          <div style={{ flex: 1 }}>
            <div className={styles.skeletonLine} style={{ height: 14, width: '60%' }} />
            <div className={styles.skeletonLine} style={{ height: 12, width: '80%', marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentCard({
  enrollment,
  color,
  canManageStudents,
  isRemoving,
  onEdit,
  onRemove,
}: {
  enrollment: StudentItem;
  color: string;
  canManageStudents: boolean;
  isRemoving: boolean;
  onEdit: (student: StudentItem['student']) => void;
  onRemove: (student: StudentItem['student']) => void;
}) {
  const student = enrollment.student;
  const fullName = [student.name, student.sureName].filter(Boolean).join(' ') || '—';
  const initials = [student.name?.[0], student.sureName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  const classroom = classroomLabel(student.studentProfile);

  return (
    <div className={styles.studentCard} id={`student-card-${student.id}`}>
      <div className={styles.avatarWrap} style={{ background: `${color}22`, borderColor: `${color}44` }}>
        <span className={styles.avatarText} style={{ color }}>{initials}</span>
      </div>
      <div className={styles.studentInfo}>
        <p className={styles.studentName}>{fullName}</p>
        <p className={styles.studentEmail}>{student.email}</p>
        {classroom && <span className={styles.classroomBadge}>{classroom}</span>}
      </div>
      <div className={styles.enrolledDate}>
        {new Date(enrollment.enrolledAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
      {canManageStudents && (
        <div className={styles.studentActions}>
          <button type="button" className={styles.editStudentBtn} onClick={() => onEdit(student)} aria-label={`แก้ไขข้อมูล ${fullName}`} title="แก้ไขข้อมูลนักเรียน">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          </button>
          <button type="button" className={styles.deleteStudentBtn} onClick={() => onRemove(student)} disabled={isRemoving} aria-label={`นำ ${fullName} ออกจากรายวิชา`} title="นำออกจากรายวิชา">
            {isRemoving ? <span className={styles.spinner} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>}
          </button>
        </div>
      )}
    </div>
  );
}

function classroomLabel(profile?: StudentProfile | null) {
  if (!profile) return null;
  const parts = [profile.section, profile.room ? `ห้อง ${profile.room}` : null].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}
