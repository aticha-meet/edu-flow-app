'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import { CoursePageLayout } from '@/components/course/CoursePageLayout';
import { CourseSettings } from '@/components/course/CourseSettings';
import type { CourseDetail } from '@/components/course/types';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from '../course-detail.module.scss';

export default function CourseSettingsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { session, isAllowed } = useRoleGuard(
    ['TEACHER', 'ADMIN'],
    `/course/${courseId}`,
  );
  const user = session?.user as { id?: string; role?: 'TEACHER' | 'ADMIN' };

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !isAllowed) return;

    setIsLoading(true);
    try {
      setCourse(await getListCourse(`/course/${courseId}`, {}, {}));
    } catch (error) {
      console.error('Failed to fetch course settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, isAllowed]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (!isAllowed) return null;

  const courseName = course?.className ?? 'รายวิชา';

  return (
    <CoursePageLayout
      courseId={courseId}
      course={course}
      isLoading={isLoading}
      activeMenu="settings"
      userRole={user?.role}
    >
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/course">ห้องเรียน</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <Link href={`/course/${courseId}`}>{isLoading ? '...' : courseName}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Course Settings</span>
      </nav>

      <div className={styles.contentTitleRow}>
        <div>
          <h1 className={styles.contentTitle}>Course Settings</h1>
          <p className={styles.contentSubtitle}>
            จัดการข้อมูลและการตั้งค่าของรายวิชา
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.settingsLoading} aria-label="กำลังโหลดการตั้งค่ารายวิชา">
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.skeletonLine} />
          ))}
        </div>
      ) : (
        course && (
          <CourseSettings
            course={{
              id: course.id,
              className: course.className,
              description: course.description,
              code: course.code,
              roomId: course.roomId,
              maxStudents: course.maxStudents,
              status: course.status,
            }}
            userRole={user?.role ?? 'TEACHER'}
            userId={user?.id ?? ''}
            onCourseUpdated={(updated) =>
              setCourse((currentCourse) =>
                currentCourse ? { ...currentCourse, ...updated } : currentCourse,
              )
            }
          />
        )
      )}
    </CoursePageLayout>
  );
}
