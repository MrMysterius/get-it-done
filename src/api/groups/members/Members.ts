import Express from "express";
import { MembersDeleteRouter } from "./MembersDelete";
import { MembersGetRouter } from "./MembersGet";
import { MembersPostRouter } from "./MembersPost";

export const MembersRouter = Express.Router();

MembersRouter.use("/", MembersGetRouter);
MembersRouter.use("/", MembersPostRouter);
MembersRouter.use("/", MembersDeleteRouter);
