'use client';

import type { ReactNode } from 'react';
import { CourseSidebar, type MenuKey } from '@/components/course/CourseSidebar';
import type { CourseTestDetail, CourseUserRole } from './types';
import styles from './course-test-frame.module.scss';

interface CourseTestFrameProps {
  courseId: string;
  course: CourseTestDetail | null;
  isLoading: boolean;
  activeMenu: Extract<MenuKey, 'test' | 'test-manage' | 'test-dashboard'>;
  userRole: CourseUserRole;
  children: ReactNode;
}

export function CourseTestFrame({
  courseId,
  course,
  isLoading,
  activeMenu,
  userRole,
  children,
}: CourseTestFrameProps) {
  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${courseId}`;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {isLoading ? (
          <aside className={styles.sidebar} aria-label="Loading course navigation" />
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
