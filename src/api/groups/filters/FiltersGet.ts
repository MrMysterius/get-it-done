import Express from "express";
import { getAllData } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const FiltersGetRouter = Express.Router();

FiltersGetRouter.get(
  "/",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const filters = getAllData<GIDData.filter>(`SELECT * FROM filters WHERE filter_creator = ?`, req.extra.params.group_id);

    if (!filters.data) throw new Error("Couldn't get filters");

    res.status(200);
    res.json(
      filters.data.map((filter) => {
        return {
          id: filter.filter_id,
          name: filter.filter_name,
          filter_data: JSON.parse(filter.filter_data),
        };
      })
    );
  }
);
