import Express from "express";
import { InvitesDeleteRouter } from "./InvitesDelete";
import { InvitesGetRouter } from "./InvitesGet";
import { InvitesPostRouter } from "./InvitesPost";
import { InvitesPutRouter } from "./InvitesPut";

export const InvitesRouter = Express.Router();

InvitesRouter.use("/", InvitesGetRouter);
InvitesRouter.use("/", InvitesPostRouter);
InvitesRouter.use("/", InvitesPutRouter);
InvitesRouter.use("/", InvitesDeleteRouter);
