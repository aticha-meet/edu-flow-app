import { Router } from "express";
import UserRouter from "./pkg/user/route";
import { StudentRouter } from "./pkg/student-profile/route";
import { TeacherRouter } from "./pkg/teacher-profile/route";
import { handleRefreshToken } from "./middleware/checkToken";
import { ClassRouter } from "./pkg/class/route";

const AppRouter: Router = Router();

// User routes
AppRouter.use(handleRefreshToken, UserRouter);

// Student routes
AppRouter.use(handleRefreshToken, StudentRouter);

// Teacher routes
AppRouter.use(handleRefreshToken, TeacherRouter);
AppRouter.use(handleRefreshToken, ClassRouter);

export default AppRouter;