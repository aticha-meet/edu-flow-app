import { Request, Response } from "express";
import { teacherProfileService } from "./teacher-profile.service";

export class TeacherProfileController {
    async getTeacherProfiles(req: Request, res: Response) {
        try {
            const teacherProfile = await teacherProfileService.findAll();
            return res.status(200).json({ message: "Teacher profiles fetched successfully", data: teacherProfile });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error", error: err });
        }
    }

    async createTeacherProfile(req: Request, res: Response) {
        try {
            const teacherProfile = req.body;
            const createdTeacherProfile = await teacherProfileService.create(teacherProfile);
            return res.status(201).json({ message: "Teacher profile created successfully", data: createdTeacherProfile });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error", error: err });
        }
    }
}

export const teacherProfileController = new TeacherProfileController();
