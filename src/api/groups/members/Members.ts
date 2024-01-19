import Express from "express";
import { MembersGetRouter } from "./MembersGet";
import { MembersPostRouter } from "./MembersPost";

export const MembersRouter = Express.Router();

MembersRouter.use("/", MembersGetRouter);
MembersRouter.use("/", MembersPostRouter);
