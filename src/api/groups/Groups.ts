import Express from "express";
import { GroupsPostRouter } from "./GroupsPost";

export const GroupsRouter = Express.Router();

GroupsRouter.use("/", GroupsPostRouter);
