import Express from "express";
import { StatesPostRouter } from "./StatesPost";

export const StatesRouter = Express.Router();

StatesRouter.use("/", StatesPostRouter);
