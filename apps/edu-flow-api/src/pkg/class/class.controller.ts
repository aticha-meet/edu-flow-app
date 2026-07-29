import { Request, Response } from "express";
import { classService } from "./class.service";

export class ClassController {
    async getListClasses(req: Request, res: Response) {
        try {
            const { userId, role } = req.query as { userId: string, role: 'ADMIN' | 'TEACHER' | 'STUDENT' };

            if (role === 'ADMIN') {
                const classData = await classService.findAllAdmin();
                return res.status(200).json({ message: "Successfully get class admin", data: classData });
            }

            if (role === 'TEACHER' || role === 'STUDENT') {
                const classData = await classService.findByTeacher(userId);
                return res.status(200).json({ message: "Successfully get class teacher", data: classData });
            }

            const classData = await classService.findByStudent(userId);
            return res.status(200).json({ message: "Successfully get class student", data: classData });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error", error: err });
        }
    }

    async createClass(req: Request, res: Response) {
        try {
            const { className, description, teacherId, role, roomId } = req.body;

            // ตรวจสอบสิทธิ์: เฉพาะ ADMIN เท่านั้นที่สร้าง Class ได้
            if (role !== 'ADMIN') {
                return res.status(403).json({ message: "Access denied: Only ADMIN can create classes" });
            }

            // Validate required fields
            if (!className || !teacherId) {
                return res.status(400).json({ message: "className and teacherId are required" });
            }

            // ตรวจสอบว่า teacherId มีตัวตนจริงและเป็น TEACHER หรือ ADMIN
            const teacher = await classService.findTeacher(teacherId);

            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }

            if (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN') {
                return res.status(400).json({ message: "The specified user is not a teacher" });
            }

            const newClass = await classService.create({ className, description, teacherId, roomId });
            return res.status(201).json({ message: "Class created successfully", data: newClass });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error", error: err });
        }
    }
}

export const classController = new ClassController();
