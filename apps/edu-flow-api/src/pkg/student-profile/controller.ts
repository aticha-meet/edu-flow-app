import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getStudentProfiles(req: Request, res: Response) {
    try {
        const students = await prisma.studentProfile.findMany({
            include:{
                user : true,
            }
        });
        return res.status(200).json({ message: "Student profiles fetched successfully", data: students });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}

export async function createStudentProfile(req: Request, res: Response) {
    try {
        const studentData = req.body;
        const createdStudent = await prisma.studentProfile.create({
            data: studentData,
        });
        return res.status(201).json({ message: "Student profile created successfully", data: createdStudent });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}