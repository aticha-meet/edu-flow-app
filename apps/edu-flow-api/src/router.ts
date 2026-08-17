import { Router } from 'express';
import UserRouter from './pkg/user/user.module';
import { StudentRouter } from './pkg/student-profile/student-profile.module';
import { TeacherRouter } from './pkg/teacher-profile/teacher-profile.module';
import { handleRefreshToken } from './middleware/checkToken';
import { CourseRouter } from './pkg/course/course.module';
import { TestRouter } from './pkg/test/test.module';
import { userController } from './pkg/user/user.controller';

const AppRouter: Router = Router();

// User routes
AppRouter.post('/auth/google-sync', (req, res) =>
  userController.googleSync(req, res),
);

AppRouter.use(handleRefreshToken, UserRouter);

// Student routes
AppRouter.use(handleRefreshToken, StudentRouter);

// Teacher routes
AppRouter.use(handleRefreshToken, TeacherRouter);
AppRouter.use(handleRefreshToken, CourseRouter);
AppRouter.use(handleRefreshToken, TestRouter);

export default AppRouter;
