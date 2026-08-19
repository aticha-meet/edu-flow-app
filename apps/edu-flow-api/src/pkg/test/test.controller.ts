import { Request, Response } from 'express';
import { testService } from './test.service';

export class TestController {
  /**
   * GET /test?courseId=...
   * ดึงรายการ Test ทั้งหมดของ course
   */
  async getTestsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.query as { courseId: string };

      if (!courseId) {
        return res.status(400).json({ message: 'courseId is required' });
      }

      const tests = await testService.findByCourse(courseId);
      return res.status(200).json({
        message: 'Successfully fetched tests',
        data: tests,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  /**
   * GET /test/:id
   * ดึง Test พร้อม Questions + Choices สำหรับหน้าสอบ
   */
  async getTestById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Test ID is required' });
      }

      const test = await testService.findById(id);

      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      return res.status(200).json({
        message: 'Successfully fetched test',
        data: test,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  /**
   * POST /test
   * สร้าง Test พร้อม Questions และ Choices
   */
  async createTest(req: Request, res: Response) {
    try {
      const { title, courseId, createdById, durationMinutes, questions } = req.body as {
        title: string;
        courseId: string;
        createdById: string;
        durationMinutes?: number;
        questions: Array<{
          questionText: string;
          order: number;
          choices: Array<{
            value: string;
            isCorrect: boolean;
            order: number;
          }>;
        }>;
      };

      // Validate required fields
      if (!title || !courseId || !createdById) {
        return res.status(400).json({
          message: 'title, courseId, and createdById are required',
        });
      }

      if (!questions || questions.length === 0) {
        return res.status(400).json({
          message: 'At least one question is required',
        });
      }

      // Validate each question has at least one correct choice
      for (const q of questions) {
        if (!q.choices || q.choices.length < 2) {
          return res.status(400).json({
            message: 'Each question must have at least 2 choices',
          });
        }
        const hasCorrect = q.choices.some((c) => c.isCorrect);
        if (!hasCorrect) {
          return res.status(400).json({
            message: `Question "${q.questionText}" must have at least one correct choice`,
          });
        }
      }

      // Validate durationMinutes
      const duration = durationMinutes !== undefined ? Number(durationMinutes) : 45;
      if (isNaN(duration) || duration < 1 || duration > 300) {
        return res.status(400).json({
          message: 'durationMinutes must be between 1 and 300',
        });
      }

      const test = await testService.create({
        title,
        courseId,
        createdById,
        durationMinutes: duration,
        questions,
      });

      return res.status(201).json({
        message: 'Test created successfully',
        data: test,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  /**
   * DELETE /test/:id
   */
  async deleteTest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await testService.delete(id);
      return res.status(200).json({ message: 'Test deleted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }
}

export const testController = new TestController();
