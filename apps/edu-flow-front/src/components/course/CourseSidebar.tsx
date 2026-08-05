'use client';

import styles from './course-components.module.scss';


type MenuKey = 'assignment' | 'syllabus';

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface CourseSidebarProps {
  courseCode: string;
  courseName: string;
  activeMenu: MenuKey;
  onMenuChange: (key: MenuKey) => void;
}

const MenuIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    assignment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
      </svg>
    ),
    syllabus: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
};

export const CourseSidebar = ({
  courseCode,
  courseName,
  activeMenu,
  onMenuChange,
}: CourseSidebarProps) => {
  const menuItems: MenuItem[] = [
    { key: 'assignment', label: 'Assignment', icon: <MenuIcon name="assignment" /> },
    { key: 'syllabus',   label: 'Course Syllabus', icon: <MenuIcon name="syllabus" /> },
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
        {menuItems.map((item, idx) => (
          <li key={item.key} className={styles.navItem} role="none">
            {idx > 0 && item.key === 'syllabus' && (
              <div className={styles.navDivider} />
            )}
            <button
              role="menuitem"
              id={`sidebar-${item.key}`}
              className={`${styles.navBtn} ${activeMenu === item.key ? styles.active : ''}`}
              onClick={() => onMenuChange(item.key)}
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
