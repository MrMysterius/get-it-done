import Express from "express";
import { InvitesRouter } from "./invites/Invites";
import { UsersRouter } from "./users/Users";
import { checkAuthStatus } from "../middlewares/checkAuthStatus";
import { validateAuth } from "../middlewares/validateAuth";

export const APIRouter = Express.Router();

APIRouter.use(validateAuth);
APIRouter.use(checkAuthStatus());

APIRouter.use("/users", UsersRouter);
APIRouter.use("/invites", InvitesRouter);
