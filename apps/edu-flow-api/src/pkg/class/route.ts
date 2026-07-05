import { Router } from "express";
import { getListClasses } from "./controller";

export const ClassRouter = Router();

ClassRouter.get("/class", getListClasses);