import { Router } from "express";
import { createStudentProfile, getStudentProfiles } from "./controller";

export const StudentRouter: Router = Router();

StudentRouter.get("/students", getStudentProfiles)
StudentRouter.post("/student", createStudentProfile)