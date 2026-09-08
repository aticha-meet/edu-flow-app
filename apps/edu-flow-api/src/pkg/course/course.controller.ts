import { Request, Response } from 'express';
import { courseService } from './course.service';
import { parseCSV } from '../student-profile/student-profile.controller';
import { studentProfileService } from '../student-profile/student-profile.service';

export class CourseController {
  async getListCourse(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { id: userId, role } = authUser;

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
      const { className, description, teacherId, roomId, code, maxStudents, status } = req.body;
      const authUser = req.authUser!;

      if (authUser.role === 'TEACHER' && teacherId !== authUser.id) {
        return res.status(403).json({ message: 'TEACHER can only create classes for themselves' });
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
        status: status || 'upcoming',
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
      const { search, section } = req.query;
      if ((search !== undefined && typeof search !== 'string') ||
          (section !== undefined && typeof section !== 'string')) {
        return res.status(400).json({ message: 'search and section must be strings' });
      }
      const enrollments = await courseService.getEnrollments(id, { search, section });
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

  async removeEnrollment(req: Request, res: Response) {
    try {
      const { id, studentId } = req.params;
      if (!id || !studentId) {
        return res.status(400).json({ message: 'course ID and student ID are required' });
      }

      const removed = await courseService.removeEnrollment(id, studentId);
      if (!removed) {
        return res.status(404).json({ message: 'Student is not enrolled in this course' });
      }
      return res.status(200).json({ message: 'Student removed from course successfully' });
    } catch (err) {
      console.error('Remove enrollment error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async addEnrollments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      if (!Array.isArray(studentIds)) {
        return res.status(400).json({ message: 'studentIds must be an array' });
      }

      const result = await courseService.addEnrollments(id, studentIds);
      return res.status(200).json({
        message: 'Students enrolled successfully',
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  async importStudentsCSV(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { csv } = req.body;
      if (!csv || typeof csv !== 'string') {
        return res.status(400).json({ message: 'csv field (string) is required' });
      }

      const rows = parseCSV(csv);
      if (rows.length === 0) {
        return res.status(400).json({ message: 'ไม่พบข้อมูลใน CSV หรือ format ไม่ถูกต้อง' });
      }

      const profileResult = await studentProfileService.importFromCSV(rows);
      const enrollmentResult = await courseService.addEnrollments(id, profileResult.userIds);

      return res.status(200).json({
        message: 'Import students into course successfully',
        data: {
          imported: profileResult.imported,
          skipped: profileResult.skipped,
          errors: profileResult.errors,
          enrolled: enrollmentResult.added,
          alreadyEnrolled: enrollmentResult.skipped,
          missing: enrollmentResult.missing,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  // ─── Syllabus ────────────────────────────────────────────────────

  async getSyllabus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const syllabus = await courseService.getSyllabus(id);
      return res.status(200).json({ message: 'Syllabus fetched successfully', data: syllabus });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  async upsertSyllabus(req: Request, res: Response) {
    try {
      const { id, week } = req.params;
      const weekNum = parseInt(week, 10);
      if (isNaN(weekNum) || weekNum < 1) {
        return res.status(400).json({ message: 'week must be a positive integer' });
      }
      const { title, description, topics } = req.body;
      if (!title) {
        return res.status(400).json({ message: 'title is required' });
      }
      const result = await courseService.upsertSyllabus(id, weekNum, {
        title,
        description,
        topics: Array.isArray(topics) ? topics : [],
      });
      return res.status(200).json({ message: 'Syllabus updated successfully', data: result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  async deleteSyllabusWeek(req: Request, res: Response) {
    try {
      const { id, week } = req.params;
      const weekNum = parseInt(week, 10);
      if (isNaN(weekNum) || weekNum < 1) {
        return res.status(400).json({ message: 'week must be a positive integer' });
      }
      await courseService.deleteSyllabusWeek(id, weekNum);
      return res.status(200).json({ message: 'Syllabus week deleted successfully' });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ message: 'Syllabus week not found' });
      }
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  // ─── Course Settings ──────────────────────────────────────────────

  async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { className, description, roomId, code, maxStudents, status } = req.body;
      const authUser = req.authUser!;

      if (!id) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }

      // TEACHER ต้องเป็นเจ้าของ course
      if (authUser.role === 'TEACHER') {
        const course = await courseService.findCourseOwner(id);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        if (course.teacherId !== authUser.id) {
          return res.status(403).json({ message: 'Access denied: You can only update your own courses' });
        }
      }

      const updated = await courseService.updateCourse(id, {
        className,
        description,
        roomId,
        code,
        maxStudents: maxStudents !== undefined ? parseInt(maxStudents) : undefined,
        status,
      });

      return res.status(200).json({ message: 'Course updated successfully', data: updated });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ message: 'Course code already exists' });
      }
      if (err?.code === 'P2025') {
        return res.status(404).json({ message: 'Course not found' });
      }
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authUser = req.authUser!;

      if (!id) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }

      const course = await courseService.findCourseOwner(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // TEACHER ต้องเป็นเจ้าของ course
      if (authUser.role === 'TEACHER' && course.teacherId !== authUser.id) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own courses' });
      }

      await courseService.deleteCourse(id);
      return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ message: 'Course not found' });
      }
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
  }
}

export const courseController = new CourseController();

