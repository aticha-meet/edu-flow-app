export type CourseStatus = 'active' | 'upcoming' | 'complete';

export interface CourseSummary {
  id: string;
  code: string | null;
  className: string;
  description: string | null;
  teacherId: string;
  roomId: string | null;
  maxStudents: number;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  teacher: { name: string | null; sureName: string | null };
  _count: { enrollments: number };
}
