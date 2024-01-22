import Express from "express";
import { TasksGetRouter } from "./TasksGet";
import { TasksPostRouter } from "./TasksPost";
import { TasksPutRouter } from "./TasksPut";

export const TasksRouter = Express.Router();

TasksRouter.use("/", TasksGetRouter);
TasksRouter.use("/", TasksPostRouter);
TasksRouter.use("/", TasksPutRouter);
