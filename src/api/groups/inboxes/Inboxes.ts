import Express from "express";
import { InboxesGetRouter } from "./InboxesGet";
import { InboxesPostRouter } from "./InboxesPost";
import { InboxesPutRouter } from "./InboxesPut";

export const InboxesRouter = Express.Router();

InboxesRouter.use("/", InboxesGetRouter);
InboxesRouter.use("/", InboxesPostRouter);
InboxesRouter.use("/", InboxesPutRouter);
