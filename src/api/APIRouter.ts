import Express from "express";
import { validateAuth } from "../functions/validateAuth";

export const APIRouter = Express.Router();

APIRouter.use(validateAuth);
