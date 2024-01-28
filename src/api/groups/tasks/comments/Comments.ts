import { CommentsPostRouter } from "./CommentsPost";
import Express from "express";

export const CommentsRouter = Express.Router();

CommentsRouter.use("/", CommentsPostRouter);
