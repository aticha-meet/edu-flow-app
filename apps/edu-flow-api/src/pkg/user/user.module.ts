import { Router } from 'express';
import { userController } from './user.controller';

const UserRouter: Router = Router();

UserRouter.get('/users', (req, res) => userController.getListUsers(req, res));
UserRouter.post('/user/login', (req, res) => userController.getUser(req, res));
// UserRouter.post('/auth/google-sync', (req, res) => userController.googleSync(req, res));
UserRouter.get('/users/student', (req, res) =>
  userController.getStudent(req, res),
);
UserRouter.get('/users/teacher', (req, res) =>
  userController.getTeacher(req, res),
);
UserRouter.post('/create-user', (req, res) =>
  userController.createUser(req, res),
);

export default UserRouter;
