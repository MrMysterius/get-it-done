import Express from "express";
import { GroupsGetRouter } from "./GroupsGet";
import { GroupsPostRouter } from "./GroupsPost";
import { GroupsPutRouter } from "./GroupsPut";

export const GroupsRouter = Express.Router();

GroupsRouter.use("/", GroupsGetRouter);
GroupsRouter.use("/", GroupsPostRouter);
GroupsRouter.use("/", GroupsPutRouter);
