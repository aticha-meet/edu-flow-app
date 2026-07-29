import { Request, Response } from "express";
import { studentProfileService } from "./student-profile.service";

export class StudentProfileController {
    async getStudentProfiles(req: Request, res: Response) {
        try {
            const students = await studentProfileService.findAll();
            return res.status(200).json({ message: "Student profiles fetched successfully", data: students });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }

    async createStudentProfile(req: Request, res: Response) {
        try {
            const studentData = req.body;
            const createdStudent = await studentProfileService.create(studentData);
            return res.status(201).json({ message: "Student profile created successfully", data: createdStudent });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }
}

export const studentProfileController = new StudentProfileController();
