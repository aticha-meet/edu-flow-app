'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import {
  CourseAssignment,
  type Assignment,
} from '@/components/course/CourseAssignment';
import { CourseSyllabus } from '@/components/course/CourseSyllabus';
import { getListCourse } from '@/api/course/controller';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './course-detail.module.scss';

// ─── Types ────────────────────────────────────────────────────
type MenuKey = 'assignment' | 'syllabus' | 'test-manage' | 'manage-students';

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

// ─── Mock Data (ใช้ไว้ก่อนจนกว่า API จะพร้อม) ─────────────────
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: 'งานที่ 1 — แนะนำตัวเอง',
    dueDate: '10 ส.ค. 2569',
    status: 'open',
    color: '#6366f1',
  },
  {
    id: 2,
    title: 'งานที่ 2 — สรุปเนื้อหาบทที่ 1',
    dueDate: '17 ส.ค. 2569',
    status: 'pending',
    color: '#f59e0b',
  },
  {
    id: 3,
    title: 'งานที่ 3 — แบบฝึกหัดท้ายบท',
    dueDate: '5 ก.ค. 2569',
    status: 'closed',
    color: '#ef4444',
  },
];

const MOCK_SYLLABUS = [
  {
    week: 1,
    title: 'บทนำ & ภาพรวมรายวิชา',
    description: 'แนะนำเนื้อหาและข้อตกลงในชั้นเรียน',
    topics: [
      'แนะนำตัวผู้สอน',
      'เป้าหมายการเรียนรู้',
      'เกณฑ์การวัดผล',
      'ข้อตกลงชั้นเรียน',
    ],
  },
  {
    week: 2,
    title: 'บทที่ 1 — แนวคิดพื้นฐาน',
    description: 'ทฤษฎีและแนวคิดหลักของรายวิชา',
    topics: ['ความหมายและความสำคัญ', 'ประวัติและพัฒนาการ', 'องค์ประกอบสำคัญ'],
  },
  {
    week: 3,
    title: 'บทที่ 2 — เครื่องมือและเทคนิค',
    description: 'การประยุกต์ใช้เครื่องมือในการทำงาน',
    topics: [
      'การเลือกเครื่องมือที่เหมาะสม',
      'Workshop ฝึกปฏิบัติ',
      'Case Study จากของจริง',
    ],
  },
  {
    week: 4,
    title: 'บทที่ 3 — การวิเคราะห์และออกแบบ',
    description: 'กระบวนการคิดและวิเคราะห์เชิงระบบ',
    topics: ['กระบวนการวิเคราะห์', 'การออกแบบ Solution', 'Prototype & Testing'],
  },
  {
    week: 5,
    title: 'สอบกลางภาค',
    description: 'ประเมินผลการเรียนรู้ครึ่งภาค',
    topics: ['ทบทวนเนื้อหาทั้งหมด', 'สอบข้อเขียน / ปฏิบัติ'],
  },
];

// ─── Panel Header Helper ─────────────────────────────────────
interface PanelHeaderProps {
  iconPath: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor?: string;
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

  const [activeMenu, setActiveMenu] = useState<MenuKey>('assignment');
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));

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

  const handleToggleWeek = (week: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const courseCode = course?.code ?? `COURSE-${id}`;
  const courseName = course?.className ?? 'รายวิชา';

  // ─── Render Content ────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case 'assignment':
        return (
          <div className={styles.panel} id="assignment-panel">
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
                  <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
                </svg>
              }
              title="Assignment"
              subtitle={`งานทั้งหมด ${MOCK_ASSIGNMENTS.length} ชิ้น`}
            />
            <div className={styles.panelBody}>
              <CourseAssignment assignments={MOCK_ASSIGNMENTS} />
            </div>
          </div>
        );

      case 'syllabus':
        return (
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
              subtitle={`เนื้อหา ${MOCK_SYLLABUS.length} สัปดาห์`}
            />
            <div className={styles.panelBody}>
              <CourseSyllabus
                weeks={MOCK_SYLLABUS}
                openWeeks={openWeeks}
                onToggleWeek={handleToggleWeek}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <h1 className={styles.contentTitle}>
                {activeMenu === 'assignment' ? 'Assignment' : 'Course Syllabus'}
              </h1>
              <p className={styles.contentSubtitle}>
                {activeMenu === 'assignment'
                  ? 'รายการงานที่ได้รับมอบหมายในรายวิชานี้'
                  : 'เนื้อหาและแผนการสอนตลอดภาคการศึกษา'}
              </p>
            </div>
          </div>

          {/* Panel */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
