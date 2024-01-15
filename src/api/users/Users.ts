import Express from "express";
import { UsersGetRouter } from "./UsersGet";
import { UsersPostRouter } from "./UsersPost";

export const UsersRouter = Express.Router();

UsersRouter.use("/", UsersGetRouter);
UsersRouter.use("/", UsersPostRouter);
