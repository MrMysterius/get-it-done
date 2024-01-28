import Express from "express";
import { InboxesGetRouter } from "./InboxesGet";
import { InboxesPostRouter } from "./InboxesPost";

export const InboxesRouter = Express.Router();

InboxesRouter.use("/", InboxesGetRouter);
InboxesRouter.use("/", InboxesPostRouter);
