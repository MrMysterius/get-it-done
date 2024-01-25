import Express from "express";
import { TaskTagsDeleteRouter } from "./TagsDelete";
import { TaskTagsPostRouter } from "./TagsPost";

export const TasksTagsRouter = Express.Router();

TasksTagsRouter.use("/", TaskTagsPostRouter);
TasksTagsRouter.use("/", TaskTagsDeleteRouter);
