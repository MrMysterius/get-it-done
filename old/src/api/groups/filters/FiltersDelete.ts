import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { validateData } from "@/middlewares/validateData";

export const FiltersDeleteRouter = Express.Router();

FiltersDeleteRouter.delete(
  "/:filter_id",

  // REQUEST DATA REQUIREMENTS
  param("filter_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const filter = getData<GIDData.filter>(`SELECT * FROM filters WHERE filter_id = ? AND filter_creator = ?`, id, req.extra.params.group_id);
      if (!filter.data) throw new Error("Filter with that id doesn't exist");

      req.extra.filter = filter.data;

      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteFilter = createTransactionStatementTyped<Pick<GIDData.filter, "filter_id">>(`DELETE FROM filters WHERE filter_id = @filter_id`);

    const result = deleteFilter.run({
      filter_id: req.params.filter_id,
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't delete filter");

    res.status(200);
    res.json({
      filter_id: req.params.filter_id,
      filter_name: req.extra.filter.filter_name,
    });
  }
);
