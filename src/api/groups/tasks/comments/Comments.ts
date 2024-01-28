import { CommentsGetRouter } from "./CommentsGet";
import { CommentsPostRouter } from "./CommentsPost";
import Express from "express";

export const CommentsRouter = Express.Router();

CommentsRouter.use("/", CommentsGetRouter);
CommentsRouter.use("/", CommentsPostRouter);
