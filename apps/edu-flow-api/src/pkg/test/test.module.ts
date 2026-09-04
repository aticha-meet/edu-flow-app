import { Router } from 'express';
import { testController } from './test.controller';

export const TestRouter: Router = Router();

// GET /test?courseId=... — รายการ test ของ course
TestRouter.get('/test', (req, res) => testController.getTestsByCourse(req, res));

// GET /test/:id/attempts?studentId=... — ประวัติ attempts ของนักเรียน
TestRouter.get('/test/:id/attempts', (req, res) => testController.getAttempts(req, res));

// GET /test/:id/dashboard — dashboard คะแนนนักเรียน (สำหรับครู/admin)
TestRouter.get('/test/:id/dashboard', (req, res) => testController.getScoreDashboard(req, res));

// POST /test/attempt/:attemptId/submit — ส่งข้อสอบ (วางก่อน /:id เพื่อหลีกเลี่ยง route conflict)
TestRouter.post('/test/attempt/:attemptId/submit', (req, res) =>
  testController.submitAttempt(req, res),
);

// GET /test/:id — ดึง test พร้อม questions+choices
TestRouter.get('/test/:id', (req, res) => testController.getTestById(req, res));

// POST /test — สร้าง test ใหม่พร้อม questions
TestRouter.post('/test', (req, res) => testController.createTest(req, res));

// POST /test/:id/attempt/start — เริ่มทำข้อสอบ (สร้าง Attempt)
TestRouter.post('/test/:id/attempt/start', (req, res) =>
  testController.startAttempt(req, res),
);

// DELETE /test/:id
TestRouter.delete('/test/:id', (req, res) => testController.deleteTest(req, res));

