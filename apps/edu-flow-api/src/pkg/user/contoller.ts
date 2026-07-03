import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUsers(req: Request, res: Response) {
    try {
        // Fetch users from the database or any other source
        const users = await prisma.user.findMany();
        return res.status(200).json({ message: "Users fetched successfully", data: users });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}

export async function getStudent(req: Request, res: Response) {
    try {
        // Fetch students from the database or any other source
        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT"
            },
            include: {
                studentProfile: true
            }
        });
        return res.status(200).json({ message: "Students fetched successfully", data: students });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}

export async function createUser(req: Request, res: Response) {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.create({
            data: {
                name,
                email
            }
        });
        return res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}