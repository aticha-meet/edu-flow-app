import { Router } from 'express';
import { userController } from './user.controller';
import { requireRoles } from '../../middleware/requireRoles';

const UserRouter: Router = Router();

UserRouter.get('/users', requireRoles('ADMIN', 'TEACHER'), (req, res) => userController.getListUsers(req, res));
UserRouter.post('/user/login', (req, res) => userController.getUser(req, res));
// UserRouter.post('/auth/google-sync', (req, res) => userController.googleSync(req, res));
UserRouter.get('/users/student', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  userController.getStudent(req, res),
);
UserRouter.get('/users/student/classrooms', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  userController.getStudentClassrooms(req, res),
);
UserRouter.get('/users/teacher', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  userController.getTeacher(req, res),
);
UserRouter.post('/create-user', requireRoles('ADMIN', 'TEACHER'), (req, res) =>
  userController.createUser(req, res),
);

export default UserRouter;
