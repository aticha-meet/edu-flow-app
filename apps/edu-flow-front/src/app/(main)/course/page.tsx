'use client';
import { useEffect, useState } from 'react';
import styles from './course.module.scss';
import { getListCourse } from '@/api/course/controller';
import useUserStore from '@/store/userStore';
import { useSession } from 'next-auth/react';
import { CreateClassPopup } from '@/components/course/CreateClassPopup';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/utils/useRoleGuard';
import { SessionType } from '@/types/session-type';

// ─── Types ───────────────────────────────────────────────────────
interface ClassItem {
  id: number;
  code: string | null;
  className: string;
  description: string | null;
  teacherId: string;
  roomId: string | null;
  maxStudents: number;
  status: 'active' | 'upcoming' | 'complete';
  createdAt: string;
  updatedAt: string;
  teacher: { name: string | null; sureName: string | null };
  _count: { enrollments: number };
}

// ─── Helpers ──────────────────────────────────────────────────────
const CLASS_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#ef4444',
  '#14b8a6',
];
const getClassColor = (id: number) => CLASS_COLORS[id % CLASS_COLORS.length];

const getInstructor = (cls: ClassItem) =>
  [cls.teacher?.name, cls.teacher?.sureName].filter(Boolean).join(' ') ||
  'ไม่ระบุ';

// ─── Helpers ──────────────────────────────────────────────────────
const STATUS_LABEL: Record<ClassItem['status'], string> = {
  active: 'กำลังเรียน',
  upcoming: 'เร็วๆ นี้',
  complete: 'เสร็จสิ้น',
};

export default function ClassPage() {
  const router = useRouter();
  // const session = useSession();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | ClassItem['status']>('all');
  const getUserFromStore = useUserStore((state: any) => state.getUserFromStore);
  const {
    session,
  }: {
    session: SessionType;
  } = useRoleGuard(['TEACHER', 'ADMIN'], '/course');

  // ─── Create Class Modal State ─────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    teacherId: '',
    roomId: '',
    code: '',
    maxStudents: 50,
    status: 'upcoming' as 'upcoming' | 'active' | 'complete',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ─── Check if user is ADMIN ───────────────────────────────────
  const isAdmin = sessionFromStore?.role === 'ADMIN';

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await getListCourse(
        '/course',
        {},
        {
          userId: sessionFromStore.id,
          role: sessionFromStore.role,
        },
      );
      console.log(data);
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLogin = async () => {
    try {
      await getUserFromStore(session.data?.user.email);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  useEffect(() => {
    if (session.data?.user?.email) fetchUserLogin();
  }, [session.data?.user?.email, session]);

  useEffect(() => {
    if (sessionFromStore?.id && classes.length === 0) fetchClasses();
  }, [sessionFromStore?.id, classes]);

  // ─── Create Class Handlers ────────────────────────────────────
  const handleOpenModal = () => {
    setFormData({
      className: '',
      description: '',
      teacherId: '',
      roomId: '',
      code: '',
      maxStudents: 50,
      status: 'upcoming',
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const filtered =
    filter === 'all' ? classes : classes.filter((c) => c.status === filter);
  const totalStudents = classes.reduce((s, c) => s + c._count.enrollments, 0);
  const activeCount = classes.filter((c) => c.status === 'active').length;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>ห้องเรียนของฉัน</h1>
            <p className={styles.subtitle}>
              จัดการและดูรายละเอียดรายวิชาทั้งหมด
            </p>
          </div>
          {isAdmin && (
            <button
              className={styles.addBtn}
              id="add-class-btn"
              onClick={handleOpenModal}
            >
              <svg
                width="18"
                height="18"
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
              เพิ่มรายวิชา
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {isLoading ? '—' : classes.length}
            </span>
            <span className={styles.statLabel}>รายวิชาทั้งหมด</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {isLoading ? '—' : activeCount}
            </span>
            <span className={styles.statLabel}>กำลังเรียน</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {isLoading ? '—' : totalStudents.toLocaleString()}
            </span>
            <span className={styles.statLabel}>นักศึกษารวม</span>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className={styles.filterRow}>
          {(['all', 'active', 'upcoming', 'complete'] as const).map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'ทั้งหมด' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {/* ── Class Grid ── */}
        {isLoading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div
                  className={styles.skeletonBar}
                  style={{ width: '60%', height: 12 }}
                />
                <div
                  className={styles.skeletonBar}
                  style={{ width: '90%', height: 20, marginTop: 12 }}
                />
                <div
                  className={styles.skeletonBar}
                  style={{ width: '75%', height: 12, marginTop: 8 }}
                />
                <div
                  className={styles.skeletonBar}
                  style={{ width: '50%', height: 12, marginTop: 24 }}
                />
                <div
                  className={styles.skeletonBar}
                  style={{ width: '100%', height: 8, marginTop: 16 }}
                />
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
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <p>ไม่พบรายวิชาในหมวดนี้</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((cls) => (
              <div
                key={cls.id}
                className={styles.card}
                id={`class-card-${cls.id}`}
              >
                {/* Color accent bar */}
                <div
                  className={styles.cardAccent}
                  style={{ background: getClassColor(cls.id) }}
                />

                <div className={styles.cardBody}>
                  {/* Top row */}
                  <div className={styles.cardTop}>
                    <span
                      className={styles.classCode}
                      style={{ color: getClassColor(cls.id) }}
                    >
                      {cls.code || '-'}
                    </span>
                    <span
                      className={`${styles.badge} ${styles[`badge_${cls.status}`]}`}
                    >
                      {STATUS_LABEL[cls.status]}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className={styles.className}>{cls.className}</h2>

                  {/* Instructor */}
                  <p className={styles.instructor}>
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {getInstructor(cls)}
                  </p>

                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      {cls.roomId || 'ไม่ระบุ'}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressLabel}>
                      <span>นักศึกษา</span>
                      <span style={{ color: getClassColor(cls.id) }}>
                        {cls._count.enrollments} / {cls.maxStudents}
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${(cls._count.enrollments / cls.maxStudents) * 100}%`,
                          background: getClassColor(cls.id),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <button
                    className={styles.detailBtn}
                    onClick={() => router.push(`/course/${cls.id}`)}
                    style={
                      {
                        '--accent': getClassColor(cls.id),
                      } as React.CSSProperties
                    }
                  >
                    ดูรายละเอียด
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
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Create Class Modal (Admin Only) ── */}
      {isModalOpen && (
        <CreateClassPopup
          styles={styles}
          setFormData={setFormData}
          setIsModalOpen={setIsModalOpen}
          setFormError={setFormError}
          setFormSuccess={setFormSuccess}
          setIsSubmitting={setIsSubmitting}
          isSubmitting={isSubmitting}
          formData={formData}
          fetchClasses={fetchClasses}
          formError={formError}
          formSuccess={formSuccess}
        />
      )}
    </div>
  );
}
