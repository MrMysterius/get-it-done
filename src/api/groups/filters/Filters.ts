import Express from "express";
import { FiltersDeleteRouter } from "./FiltersDelete";
import { FiltersGetRouter } from "./FiltersGet";
import { FiltersPostRouter } from "./FiltersPost";
import { FiltersPutRouter } from "./FiltersPut";

export const FiltersRouter = Express.Router();

FiltersRouter.use("/", FiltersGetRouter);
FiltersRouter.use("/", FiltersPostRouter);
FiltersRouter.use("/", FiltersPutRouter);
FiltersRouter.use("/", FiltersDeleteRouter);
