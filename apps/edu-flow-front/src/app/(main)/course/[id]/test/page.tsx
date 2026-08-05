'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getListCourse } from '@/api/course/controller';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { CreateTestModal } from '@/components/course/test/CreateTestModal';
import { TestList } from '@/components/course/test/TestList';
import styles from './test.module.scss';

interface CourseTest {
  id: string;
  courseId: string;
  testName: string;
  testDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
}

const createMockTests = (courseId: string): CourseTest[] => [
  {
    id: 'test-practice-01',
    courseId,
    testName: 'แบบทดสอบบทที่ 1: แนวคิดพื้นฐาน',
    testDate: new Date('2026-08-12T09:00:00+07:00'),
    createdAt: new Date('2026-08-01T09:00:00+07:00'),
    updatedAt: new Date('2026-08-01T09:00:00+07:00'),
  },
  {
    id: 'test-practice-02',
    courseId,
    testName: 'แบบทดสอบบทที่ 2: เครื่องมือและเทคนิค',
    testDate: new Date('2026-08-19T09:00:00+07:00'),
    createdAt: new Date('2026-08-03T09:00:00+07:00'),
    updatedAt: new Date('2026-08-03T09:00:00+07:00'),
  },
  {
    id: 'test-practice-03',
    courseId,
    testName: 'แบบทดสอบทบทวนก่อนกลางภาค',
    testDate: new Date('2026-08-26T13:00:00+07:00'),
    createdAt: new Date('2026-08-05T09:00:00+07:00'),
    updatedAt: new Date('2026-08-05T09:00:00+07:00'),
  },
];

export default function TestPracticePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tests, setTests] = useState<CourseTest[]>(() => createMockTests(id));

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setCourse(await getListCourse(`/course/${id}`, {}, {}));
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  const courseName = course?.className ?? 'รายวิชา';
  const courseCode = course?.code ?? `COURSE-${id}`;

  const handleCreateTest = (testName: string, testDate: Date) => {
    const now = new Date();
    setTests((currentTests) => [
      ...currentTests,
      {
        id: crypto.randomUUID(),
        courseId: id,
        testName,
        testDate,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {isLoading ? (
          <aside
            className={styles.sidebar}
            aria-label="Loading course navigation"
          />
        ) : (
          <CourseSidebar
            courseId={id}
            courseCode={courseCode}
            courseName={courseName}
            activeMenu="test"
            onMenuChange={(menu) => {
              if (menu !== 'test') router.push(`/course/${id}`);
            }}
          />
        )}

        <main className={styles.content}>
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/course">ห้องเรียน</Link>
            <span>/</span>
            <Link href={`/course/${id}`}>{isLoading ? '...' : courseName}</Link>
            <span>/</span>
            <span>Test Practice</span>
          </nav>

          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>COURSE TESTS</span>
              <h1>Test Practice</h1>
              <p>
                แบบทดสอบทั้งหมดสำหรับรายวิชานี้
                เลือกแบบทดสอบที่ต้องการเพื่อเริ่มทำข้อสอบ
              </p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.count}>{tests.length} แบบทดสอบ</div>
              <button
                className={styles.addButton}
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="เพิ่มแบบทดสอบ"
              >
                +
              </button>
            </div>
          </header>

          <TestList tests={tests} onStart={() => router.push('/exam')} />
        </main>
      </div>
      {isCreateModalOpen && (
        <CreateTestModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTest}
        />
      )}
    </div>
  );
}
