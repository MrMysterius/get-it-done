import Express from "express";
import { UsersGetRouter } from "./UsersGet";

export const UsersRouter = Express.Router();

UsersRouter.use("/", UsersGetRouter);
