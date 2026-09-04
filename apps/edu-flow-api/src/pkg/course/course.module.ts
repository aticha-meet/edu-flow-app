import { Router } from 'express';
import { courseController } from './course.controller';

export const CourseRouter: Router = Router();

CourseRouter.get('/course', (req, res) =>
  courseController.getListCourse(req, res),
);
CourseRouter.post('/course', (req, res) =>
  courseController.createCourse(req, res),
);
CourseRouter.get('/course/:id', (req, res) =>
  courseController.getCourseById(req, res),
);
CourseRouter.get('/course/:id/students', (req, res) =>
  courseController.getEnrollments(req, res),
);
CourseRouter.post('/course/:id/students', (req, res) =>
  courseController.addEnrollment(req, res),
);

// ─── Syllabus Routes ─────────────────────────────────────────────
CourseRouter.get('/course/:id/syllabus', (req, res) =>
  courseController.getSyllabus(req, res),
);
CourseRouter.put('/course/:id/syllabus/:week', (req, res) =>
  courseController.upsertSyllabus(req, res),
);
CourseRouter.delete('/course/:id/syllabus/:week', (req, res) =>
  courseController.deleteSyllabusWeek(req, res),
);
