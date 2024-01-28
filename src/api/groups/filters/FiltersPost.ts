import Express from "express";
import { body } from "express-validator";
import { createTransactionStatementTyped } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const FiltersPostRouter = Express.Router();

FiltersPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("name").trim().escape().notEmpty().isLength({ max: 300 }),

  body("filter")
    .default({})
    .notEmpty()
    .isObject()
    .customSanitizer((obj: any) => {
      return { tags: obj?.tags || [] };
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const insertFilter = createTransactionStatementTyped<Omit<GIDData.filter, "filter_id">>(
      `INSERT INTO filters (filter_creator, filter_name, filter_data)
      VALUES (@filter_creator, @filter_name, @filter_data)`
    );

    const result = insertFilter.run({
      filter_creator: req.extra.params.group_id,
      filter_name: req.body.name,
      filter_data: JSON.stringify(req.body.filter),
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't create filter");

    res.status(200);
    res.json({
      filter_id: result.data.lastInsertRowid,
      filter_name: req.body.name,
      filter_data: req.body.filter,
    });
  }
);
