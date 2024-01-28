import Express from "express";
import { InboxesPostRouter } from "./InboxesPost";

export const InboxesRouter = Express.Router();

InboxesRouter.use("/", InboxesPostRouter);
