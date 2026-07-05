import { Router } from "express";
import UserRouter from "./pkg/user/route";
import { StudentRouter } from "./pkg/student-profile/route";
import { TeacherRouter } from "./pkg/teacher-profile/route";
import { handleRefreshToken } from "./middleware/checkToken";

const AppRouter = Router();

// User routes
AppRouter.use(handleRefreshToken, UserRouter);

// Student routes
AppRouter.use(StudentRouter);

// Teacher routes
AppRouter.use(TeacherRouter);

export default AppRouter;