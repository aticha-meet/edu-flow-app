import { Router } from "express";
import { studentProfileController } from "./student-profile.controller";

export const StudentRouter: Router = Router();

StudentRouter.get("/students", (req, res) => studentProfileController.getStudentProfiles(req, res));
StudentRouter.post("/student", (req, res) => studentProfileController.createStudentProfile(req, res));
