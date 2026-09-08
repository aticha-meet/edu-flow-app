export interface StudentProfile {
  studentId: string;
  section: string | null;
  room: number | null;
}

export interface StudentItem {
  id: number;
  enrolledAt: string;
  student: {
    id: string;
    name: string | null;
    sureName: string | null;
    email: string;
    studentProfile?: StudentProfile | null;
  };
}

export interface StudentEditForm {
  name: string;
  sureName: string;
  email: string;
  studentId: string;
  section: string;
  room: string;
}
