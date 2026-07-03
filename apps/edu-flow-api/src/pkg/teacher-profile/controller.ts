import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getTeacherProfiles(req: Request, res: Response) {
    try {
        const teacherProfile = await prisma.teacherProfile.findMany({
            include: {
                user: true,
            }
        });
        return res.status(200).json({ message: "Teacher profiles fetched successfully", data: teacherProfile })
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err })
    }
}

export async function createTeacherProfile(req: Request, res: Response) {
    try {
        const teacherProfile = req.body;
        const createdTeacherProfile = await prisma.teacherProfile.create({
            data: teacherProfile,
        });
        return res.status(201).json({ message: "Teacher profile created successfully", data: createdTeacherProfile })
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err })
    }
}