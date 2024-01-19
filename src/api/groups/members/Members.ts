import Express from "express";
import { MembersPostRouter } from "./MembersPost";

export const MembersRouter = Express.Router();

MembersRouter.use("/", MembersPostRouter);
