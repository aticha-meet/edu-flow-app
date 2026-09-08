export interface CourseDetail {
  id: string;
  code: string | null;
  className: string;
  description: string | null;
  roomId: string | null;
  maxStudents: number;
  status: 'active' | 'upcoming' | 'complete';
  teacher?: { name: string | null; sureName: string | null };
  _count?: { enrollments: number };
}
