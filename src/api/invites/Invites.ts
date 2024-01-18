import Express from "express";
import { InvitesPostRouter } from "./InvitesPost";

export const InvitesRouter = Express.Router();

InvitesRouter.use("/", InvitesPostRouter);
