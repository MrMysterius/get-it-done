import Express from "express";
import { UsersDeleteRouter } from "./UsersDelete";
import { UsersGetRouter } from "./UsersGet";
import { UsersPostRouter } from "./UsersPost";
import { UsersPutRouter } from "./UsersPut";

export const UsersRouter = Express.Router();

UsersRouter.use("/", UsersGetRouter);
UsersRouter.use("/", UsersPostRouter);
UsersRouter.use("/", UsersPutRouter);
UsersRouter.use("/", UsersDeleteRouter);
