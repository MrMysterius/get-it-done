import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { escape } from "validator";
import { generateErrorWithStatus } from "@/functions/generateErrorWithStatus";
import { validateData } from "@/middlewares/validateData";

export const FiltersPutRouter = Express.Router();

FiltersPutRouter.put(
  "/:filter_id",

  (req, res, next) => {
    if (parseInt(req.headers["content-length"]) > 10240) throw generateErrorWithStatus("Content too Large", 400, `${req.headers["content-length"]} > 10240`);
    next();
  },

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

  body("name").trim().escape().notEmpty().isLength({ max: 300 }).optional(),

  body("filter")
    .notEmpty()
    .isObject()
    .customSanitizer((obj: any) => {
      return { tags: obj?.tags || [] };
    })
    .customSanitizer((obj: any) => {
      obj.tags = obj.tags.map((tag) => escape(tag));
      return obj;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const updateFilter = createTransactionStatementTyped<Omit<GIDData.filter, "filter_creator">>(
      `UPDATE filters
      SET
        filter_name = @filter_name,
        filter_data = @filter_data
      WHERE filter_id = @filter_id`
    );

    const result = updateFilter.run({
      filter_id: req.params.filter_id,
      filter_name: req.body.name || req.extra.filter.filter_name,
      filter_data: JSON.stringify(req.body.filter || JSON.parse(req.extra.filter.filter_data)),
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't update filter");

    res.status(200);
    res.json({
      filter_id: req.params.filter_id,
      filter_name: req.body.name || req.extra.filter.filter_name,
      filter_data: req.body.filter || JSON.parse(req.extra.filter.filter_data),
    });
  }
);
