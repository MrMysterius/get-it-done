import Express from "express";
import { FiltersPostRouter } from "./FiltersPost";
import { FiltersPutRouter } from "./FiltersPut";

export const FiltersRouter = Express.Router();

FiltersRouter.use("/", FiltersPostRouter);
FiltersRouter.use("/", FiltersPutRouter);
