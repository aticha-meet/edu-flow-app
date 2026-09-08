'use client';

import type { ReactNode } from 'react';
import { CourseSidebar, type MenuKey } from './CourseSidebar';
import type { CourseDetail } from './types';
import styles from './course-page-layout.module.scss';

interface CoursePageLayoutProps {
  courseId: string;
  course: CourseDetail | null;
  isLoading: boolean;
  activeMenu: Extract<MenuKey, 'syllabus' | 'settings'>;
  userRole?: 'TEACHER' | 'ADMIN' | 'STUDENT';
  children: ReactNode;
}

export function CoursePageLayout({
  courseId,
  course,
  isLoading,
  activeMenu,
  userRole,
  children,
}: CoursePageLayoutProps) {
  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${courseId}`;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {isLoading ? (
          <aside className={styles.sidebar} aria-label="Loading course navigation">
            <div className={styles.skeletonBanner} />
          </aside>
        ) : (
          <CourseSidebar
            courseId={courseId}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu={activeMenu}
            userRole={userRole}
          />
        )}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
