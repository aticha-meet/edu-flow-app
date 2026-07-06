import { Router } from "express";
import { getListClasses, createClass } from "./controller";

export const ClassRouter: Router = Router();

ClassRouter.get("/class", getListClasses);
ClassRouter.post("/class", createClass);