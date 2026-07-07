import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getListClasses(req: Request, res: Response) {
    try {
        console.log(req)
        const { userId, role } = req.query as { userId: string, role: 'ADMIN' | 'TEACHER' | 'STUDENT' }
        console.log(userId, role)

        if (role === 'ADMIN') {
            const classData = await prisma.class.findMany({});
            return res.status(200).json({ message: "Successfully get class admin", data: classData })
        }

        if (role === 'TEACHER') {
            const classData = await prisma.class.findMany({
                where: {
                    teacherId: userId
                }
            });
            return res.status(200).json({ message: "Successfully get class teacher", data: classData })
        }

        const classData = await prisma.enrollment.findMany({
            where: {
                studentId: userId,
            },
            include: {
                class: true
            }
        })

        return res.status(200).json({ message: "Successfully get class student", data: classData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", error: err })
    }
}

export async function createClass(req: Request, res: Response) {
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
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { id: true, role: true, name: true }
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        if (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN') {
            return res.status(400).json({ message: "The specified user is not a teacher" });
        }

        const data = {
            className,
            description: description || null,
            teacherId,
            roomId: roomId || null
        }

        const newClass = await prisma.class.create({
            data: data,
            include: {
                teacher: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return res.status(201).json({ message: "Class created successfully", data: newClass });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", error: err })
    }
}