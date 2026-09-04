'use client';

import styles from './course-components.module.scss';
import { useRouter } from 'next/navigation';

export type MenuKey =
  | 'syllabus'
  | 'test'
  | 'test-manage'
  | 'test-dashboard'
  | 'manage-students';

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  hide?: boolean;
}

interface CourseSidebarProps {
  courseId: string;
  courseCode: string;
  courseName: string;
  activeMenu: MenuKey;
  userRole?: 'TEACHER' | 'ADMIN' | 'STUDENT';
  onMenuChange: (key: MenuKey) => void;
}

const MenuIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    assignment: (
      <svg
        width="16"
        height="16"
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
    ),
    syllabus: (
      <svg
        width="16"
        height="16"
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
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    test: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    'test-manage': (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    'test-dashboard': (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    'manage-students': (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
};

export const CourseSidebar = ({
  courseId,
  courseCode,
  courseName,
  activeMenu,
  userRole,
  onMenuChange,
}: CourseSidebarProps) => {
  const router = useRouter();

  console.log(userRole);

  const menuItems: MenuItem[] = [
    {
      key: 'syllabus',
      label: 'Course Syllabus',
      icon: <MenuIcon name="syllabus" />,
    },
    { key: 'test', label: 'Test Practice', icon: <MenuIcon name="test" /> },
    {
      key: 'test-manage',
      label: 'Manage Tests',
      icon: <MenuIcon name="test-manage" />,
      hide: userRole === 'STUDENT',
    },
    {
      key: 'test-dashboard',
      label: 'Dashboard Score',
      icon: <MenuIcon name="test-dashboard" />,
      hide: userRole === 'STUDENT',
    },
    {
      key: 'manage-students',
      label: 'Manage Students',
      icon: <MenuIcon name="manage-students" />,
      hide: userRole === 'STUDENT',
    },
  ];

  return (
    <aside className={styles.sidebar} aria-label="Course navigation">
      {/* Banner */}
      <div className={styles.courseBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerPattern} />
        <div className={styles.bannerContent}>
          <h2 className={styles.courseCode}>{courseCode || '—'}</h2>
          <p className={styles.courseName}>{courseName || 'รายวิชา'}</p>
        </div>
      </div>

      {/* Section Label */}
      <div className={styles.sectionLabel}>เมนูรายวิชา</div>

      {/* Nav Menu */}
      <ul className={styles.navMenu} role="menubar">
        {menuItems
          .filter((item) => !item.hide)
          .map((item, idx) => (
            <li key={item.key} className={styles.navItem} role="none">
              {idx > 0 && <div className={styles.navDivider} />}
              <button
                role="menuitem"
                id={`sidebar-${item.key}`}
                className={`${styles.navBtn} ${activeMenu === item.key ? styles.active : ''}`}
                onClick={() => {
                  if (item.key === 'test') {
                    router.push(`/course/${courseId}/test`);
                    return;
                  }
                  if (item.key === 'test-manage') {
                    router.push(`/course/${courseId}/test/manage`);
                    return;
                  }
                  if (item.key === 'test-dashboard') {
                    router.push(`/course/${courseId}/test/dashboard`);
                    return;
                  }
                  if (item.key === 'manage-students') {
                    router.push(`/course/${courseId}/students`);
                    return;
                  }
                  onMenuChange(item.key);
                }}
                aria-current={activeMenu === item.key ? 'page' : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={styles.navBadge}>{item.badge}</span>
                )}
              </button>
            </li>
          ))}
      </ul>
    </aside>
  );
};

