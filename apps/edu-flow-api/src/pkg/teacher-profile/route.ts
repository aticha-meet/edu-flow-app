import { Router } from "express";
import { createTeacherProfile, getTeacherProfiles } from "./controller";

export const TeacherRouter: Router = Router();

TeacherRouter.get("/teachers", getTeacherProfiles);
TeacherRouter.post("/teacher", createTeacherProfile);