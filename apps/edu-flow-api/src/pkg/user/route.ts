import { Router } from "express";
import { createUser, getStudent, getTeacher, getUser, getUsers } from "./contoller";

const UserRouter: Router = Router();

UserRouter.get("/users", getUsers);
UserRouter.post("/user/login", getUser);
UserRouter.get("/users/student", getStudent);
UserRouter.get("/users/teacher", getTeacher);
UserRouter.post("/create-user", createUser);

export default UserRouter;