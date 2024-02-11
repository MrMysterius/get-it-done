import Express from "express";
import { TasksStateGetRouter } from "./StateGet";
import { TasksStatePostRouter } from "./StatePost";

export const TasksStateRouter = Express.Router();

TasksStateRouter.use("/", TasksStateGetRouter);
TasksStateRouter.use("/", TasksStatePostRouter);
