import Express from "express";
import { TasksDeleteRouter } from "./TasksDelete";
import { TasksGetRouter } from "./TasksGet";
import { TasksPostRouter } from "./TasksPost";
import { TasksPutRouter } from "./TasksPut";

export const TasksRouter = Express.Router();

TasksRouter.use("/", TasksGetRouter);
TasksRouter.use("/", TasksPostRouter);
TasksRouter.use("/", TasksPutRouter);
TasksRouter.use("/", TasksDeleteRouter);
