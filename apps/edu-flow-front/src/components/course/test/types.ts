export interface CourseTestDetail {
  id: string;
  code: string | null;
  className: string;
}

export type CourseUserRole = 'TEACHER' | 'ADMIN' | 'STUDENT' | undefined;
