import Express from "express";
import { TasksPostRouter } from "./TasksPost";

export const TasksRouter = Express.Router();

TasksRouter.use("/", TasksPostRouter);
