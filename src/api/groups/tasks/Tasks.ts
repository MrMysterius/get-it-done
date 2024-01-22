import Express from "express";
import { TasksPostRouter } from "./TasksPost";
import { TasksPutRouter } from "./TasksPut";

export const TasksRouter = Express.Router();

TasksRouter.use("/", TasksPostRouter);
TasksRouter.use("/", TasksPutRouter);
