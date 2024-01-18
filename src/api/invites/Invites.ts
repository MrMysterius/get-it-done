import Express from "express";
import { InvitesGetRouter } from "./InvitesGet";
import { InvitesPostRouter } from "./InvitesPost";

export const InvitesRouter = Express.Router();

InvitesRouter.use("/", InvitesGetRouter);
InvitesRouter.use("/", InvitesPostRouter);
