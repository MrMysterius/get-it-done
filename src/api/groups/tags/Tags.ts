import Express from "express";
import { TagsPostRouter } from "./TagsPost";
import { TagsPutRouter } from "./TagsPut";

export const TagsRouter = Express.Router();

TagsRouter.use("/", TagsPostRouter);
