import { ChangelogGetRouter } from "./ChangelogGet";
import Express from "express";
import { GroupsRouter } from "./groups/Groups";
import { InvitesRouter } from "./invites/Invites";
import { MeGetRouter } from "./MeGet";
import { UsersRouter } from "./users/Users";
import { checkAuthStatus } from "../middlewares/checkAuthStatus";
import { validateAuth } from "../middlewares/validateAuth";

export const APIRouter = Express.Router();

APIRouter.use(validateAuth);
APIRouter.use(checkAuthStatus());

APIRouter.use("/me", MeGetRouter);
APIRouter.use("/groups", GroupsRouter);
APIRouter.use("/invites", InvitesRouter);
APIRouter.use("/users", UsersRouter);
APIRouter.use("/changelog", ChangelogGetRouter);
