import Express from "express";
import { InvitesDeleteRouter } from "./InvitesDelete";
import { InvitesGetRouter } from "./InvitesGet";
import { InvitesPostRouter } from "./InvitesPost";

export const InvitesRouter = Express.Router();

InvitesRouter.use("/", InvitesGetRouter);
InvitesRouter.use("/", InvitesPostRouter);
InvitesRouter.use("/", InvitesDeleteRouter);
