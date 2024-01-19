import Express from "express";
import { StatesGetRouter } from "./StatesGet";
import { StatesPostRouter } from "./StatesPost";
import { StatesPutRouter } from "./StatesPut";

export const StatesRouter = Express.Router();

StatesRouter.use("/", StatesGetRouter);
StatesRouter.use("/", StatesPostRouter);
StatesRouter.use("/", StatesPutRouter);
