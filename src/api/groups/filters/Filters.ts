import Express from "express";
import { FiltersPostRouter } from "./FiltersPost";

export const FiltersRouter = Express.Router();

FiltersRouter.use("/", FiltersPostRouter);
