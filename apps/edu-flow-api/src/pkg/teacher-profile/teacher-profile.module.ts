import { Router } from "express";
import { teacherProfileController } from "./teacher-profile.controller";
import { requireRoles } from '../../middleware/requireRoles';

export const TeacherRouter: Router = Router();

TeacherRouter.get("/teachers", (req, res) => teacherProfileController.getTeacherProfiles(req, res));
TeacherRouter.post("/teacher", requireRoles('ADMIN'), (req, res) => teacherProfileController.createTeacherProfile(req, res));
