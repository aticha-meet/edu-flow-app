import { Router } from "express";
import { teacherProfileController } from "./teacher-profile.controller";

export const TeacherRouter: Router = Router();

TeacherRouter.get("/teachers", (req, res) => teacherProfileController.getTeacherProfiles(req, res));
TeacherRouter.post("/teacher", (req, res) => teacherProfileController.createTeacherProfile(req, res));
