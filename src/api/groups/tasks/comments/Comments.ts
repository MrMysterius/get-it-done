import { CommentsDeleteRouter } from "./CommentsDelete";
import { CommentsGetRouter } from "./CommentsGet";
import { CommentsPostRouter } from "./CommentsPost";
import { CommentsPutRouter } from "./CommentsPut";
import Express from "express";

export const CommentsRouter = Express.Router();

CommentsRouter.use("/", CommentsGetRouter);
CommentsRouter.use("/", CommentsPostRouter);
CommentsRouter.use("/", CommentsPutRouter);
CommentsRouter.use("/", CommentsDeleteRouter);
