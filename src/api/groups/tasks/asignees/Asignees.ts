import Express from "express";
import { TasksAsigneesDeleteRouter } from "./AsigneesDelete";
import { TasksAsigneesPostRouter } from "./AsigneesPost";

export const TasksAsigneesRouter = Express.Router();

TasksAsigneesRouter.use("/", TasksAsigneesPostRouter);
TasksAsigneesRouter.use("/", TasksAsigneesDeleteRouter);
