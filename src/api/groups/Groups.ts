import Express from "express";
import { GroupsPostRouter } from "./GroupsPost";
import { GroupsPutRouter } from "./GroupsPut";

export const GroupsRouter = Express.Router();

GroupsRouter.use("/", GroupsPostRouter);
GroupsRouter.use("/", GroupsPutRouter);
