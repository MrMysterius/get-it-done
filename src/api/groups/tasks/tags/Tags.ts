import Express from "express";
import { TaskTagsPostRouter } from "./TagsPost";

export const TasksTagsRouter = Express.Router();

TasksTagsRouter.use("/", TaskTagsPostRouter);
