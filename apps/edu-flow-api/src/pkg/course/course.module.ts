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
