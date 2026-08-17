import { Request, Response } from 'express';
import { courseService } from './course.service';

export class CourseController {
  async getListCourse(req: Request, res: Response) {
    try {
      const { userId, role } = req.query as {
        userId: string;
        role: 'ADMIN' | 'TEACHER' | 'STUDENT';
      };

      if (role === 'ADMIN') {
        const classData = await courseService.findAllAdmin();
        return res
          .status(200)
          .json({ message: 'Successfully get class admin', data: classData });
      }

      const classData =
        role === 'TEACHER'
          ? await courseService.findByTeacher(userId)
          : await courseService.findByStudent(userId);

      const data =
        role === 'STUDENT'
          ? classData.map((item: any) => item.course)
          : classData;

      return role === 'TEACHER'
        ? res.status(200).json({
            message: 'Successfully get class teacher',
            data: data,
          })
        : res.status(200).json({
            message: 'Successfully get class student',
            data: data,
          });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: err });
    }
  }

  async getCourseById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }

      const courseData = await courseService.findById(id);
      if (!courseData) {
        return res.status(404).json({ message: 'course not found' });
      }

      return res
        .status(200)
        .json({ message: 'Successfully get course detail', data: courseData });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: err });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const {
        className,
        description,
        teacherId,
        role,
        roomId,
        code,
        maxStudents,
      } = req.body;

      // ตรวจสอบสิทธิ์: ADMIN หรือ TEACHER เท่านั้นที่สร้าง Class ได้
      if (role !== 'ADMIN' && role !== 'TEACHER') {
        return res
          .status(403)
          .json({ message: 'Access denied: Only ADMIN or TEACHER can create classes' });
      }

      // Validate required fields
      if (!className || !teacherId) {
        return res
          .status(400)
          .json({ message: 'className and teacherId are required' });
      }

      // ตรวจสอบว่า teacherId มีตัวตนจริงและเป็น TEACHER หรือ ADMIN
      const teacher = await courseService.findTeacher(teacherId);

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      if (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN') {
        return res
          .status(400)
          .json({ message: 'The specified user is not a teacher' });
      }

      const newClass = await courseService.create({
        className,
        description,
        teacherId,
        roomId,
        code,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
      });
      return res
        .status(201)
        .json({ message: 'Class created successfully', data: newClass });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: err });
    }
  }
  async getEnrollments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enrollments = await courseService.getEnrollments(id);
      return res.status(200).json({
        message: 'Enrollments fetched successfully',
        data: enrollments,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  async addEnrollment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }
      const enrollment = await courseService.addEnrollment(id, studentId);
      return res.status(201).json({
        message: 'Student enrolled successfully',
        data: enrollment,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ message: 'Student is already enrolled in this course' });
      }
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }
}

export const courseController = new CourseController();
