import Express from "express";
import { StatesPostRouter } from "./StatesPost";
import { StatesPutRouter } from "./StatesPut";

export const StatesRouter = Express.Router();

StatesRouter.use("/", StatesPostRouter);
StatesRouter.use("/", StatesPutRouter);
