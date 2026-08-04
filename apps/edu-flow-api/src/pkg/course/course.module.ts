import { Router } from 'express';
import { classController } from './course.controller';

export const ClassRouter: Router = Router();

ClassRouter.get('/class', (req, res) =>
  classController.getListClasses(req, res),
);
ClassRouter.post('/class', (req, res) => classController.createClass(req, res));
