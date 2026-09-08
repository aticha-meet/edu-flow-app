'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import { CourseCatalog } from '@/components/course/catalog/CourseCatalog';
import type { CourseStatus, CourseSummary } from '@/components/course/catalog/types';
import { CreateClassPopup } from '@/components/course/CreateClassPopup';
import { useRoleGuard } from '@/utils/useRoleGuard';
import styles from './course.module.scss';

type CourseForm = {
  className: string;
  description: string;
  teacherId: string;
  roomId: string;
  code: string;
  maxStudents: number;
  status: CourseStatus;
};

const emptyCourseForm = (teacherId = ''): CourseForm => ({
  className: '',
  description: '',
  teacherId,
  roomId: '',
  code: '',
  maxStudents: 50,
  status: 'upcoming',
});

export default function ClassPage() {
  const router = useRouter();
  const { session } = useRoleGuard(['TEACHER', 'ADMIN', 'STUDENT'], '/login');
  const user = session?.user as any;
  const canCreateCourse = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'all' | CourseStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CourseForm>(() => emptyCourseForm());
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getListCourse('/course', {}, {});
      setCourses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void fetchCourses(); }, [fetchCourses]);

  const openCreateModal = () => {
    setFormData(emptyCourseForm(user?.id));
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const activeCount = courses.filter((course) => course.status === 'active').length;
  const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>ห้องเรียนของฉัน</h1>
            <p className={styles.subtitle}>จัดการและดูรายละเอียดรายวิชาทั้งหมด</p>
          </div>
          {canCreateCourse && <button className={styles.addBtn} id="add-class-btn" onClick={openCreateModal}>เพิ่มรายวิชา</button>}
        </header>

        <section className={styles.statsRow} aria-label="สรุปรายวิชา">
          <Stat label="รายวิชาทั้งหมด" value={isLoading ? '—' : courses.length} />
          <Stat label="กำลังเรียน" value={isLoading ? '—' : activeCount} />
          <Stat label="นักศึกษารวม" value={isLoading ? '—' : totalStudents.toLocaleString()} />
        </section>

        <CourseCatalog
          courses={courses}
          status={status}
          isLoading={isLoading}
          onStatusChange={setStatus}
          onOpenCourse={(courseId) => router.push(`/course/${courseId}`)}
        />
      </main>

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
          fetchClasses={fetchCourses}
          formError={formError}
          formSuccess={formSuccess}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className={styles.statCard}><span className={styles.statValue}>{value}</span><span className={styles.statLabel}>{label}</span></div>;
}
