import { Router } from "express";
import { createUser, getStudent, getUsers } from "./contoller";

const UserRouter = Router();

UserRouter.get("/users", getUsers);
UserRouter.get("/users/student", getStudent);
UserRouter.post("/create-user", createUser);

export default UserRouter;