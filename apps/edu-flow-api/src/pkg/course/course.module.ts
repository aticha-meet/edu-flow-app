import { Router } from 'express';
import { courseController } from './course.controller';
import { requireRoles } from '../../middleware/requireRoles';

export const CourseRouter: Router = Router();

CourseRouter.get('/course', (req, res) =>
  courseController.getListCourse(req, res),
);
CourseRouter.post('/course', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.createCourse(req, res),
);
CourseRouter.get('/course/:id', (req, res) =>
  courseController.getCourseById(req, res),
);
CourseRouter.patch('/course/:id', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.updateCourse(req, res),
);
CourseRouter.delete('/course/:id', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.deleteCourse(req, res),
);
CourseRouter.get('/course/:id/students', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.getEnrollments(req, res),
);
CourseRouter.post('/course/:id/students/bulk', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.addEnrollments(req, res),
);
CourseRouter.post('/course/:id/students/import-csv', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.importStudentsCSV(req, res),
);
CourseRouter.post('/course/:id/students', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.addEnrollment(req, res),
);
CourseRouter.delete('/course/:id/students/:studentId', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.removeEnrollment(req, res),
);

// ─── Syllabus Routes ─────────────────────────────────────────────
CourseRouter.get('/course/:id/syllabus', (req, res) =>
  courseController.getSyllabus(req, res),
);
CourseRouter.put('/course/:id/syllabus/:week', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.upsertSyllabus(req, res),
);
CourseRouter.delete('/course/:id/syllabus/:week', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  courseController.deleteSyllabusWeek(req, res),
);

