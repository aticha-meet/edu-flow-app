import { Router } from 'express';
import { testController } from './test.controller';

export const TestRouter: Router = Router();

// GET /test?courseId=... — รายการ test ของ course
TestRouter.get('/test', (req, res) => testController.getTestsByCourse(req, res));

// GET /test/:id — ดึง test พร้อม questions+choices
TestRouter.get('/test/:id', (req, res) => testController.getTestById(req, res));

// POST /test — สร้าง test ใหม่พร้อม questions
TestRouter.post('/test', (req, res) => testController.createTest(req, res));

// DELETE /test/:id
TestRouter.delete('/test/:id', (req, res) => testController.deleteTest(req, res));
