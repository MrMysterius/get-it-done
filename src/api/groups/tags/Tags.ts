import Express from "express";
import { TagsDeleteRouter } from "./TagsDelete";
import { TagsGetRouter } from "./TagsGet";
import { TagsPostRouter } from "./TagsPost";
import { TagsPutRouter } from "./TagsPut";

export const TagsRouter = Express.Router();

TagsRouter.use("/", TagsGetRouter);
TagsRouter.use("/", TagsPostRouter);
TagsRouter.use("/", TagsPutRouter);
TagsRouter.use("/", TagsDeleteRouter);
