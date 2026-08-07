export interface SessionType {
  id: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  email: string;
  name: string;
}
