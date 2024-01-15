import Express from "express";
import { checkAuthStatus } from "../functions/checkAuthstatus";
import { validateAuth } from "../functions/validateAuth";

export const APIRouter = Express.Router();

APIRouter.use(validateAuth);
APIRouter.use(checkAuthStatus());
