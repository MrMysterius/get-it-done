import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { tag_types } from "../../../types/types";
import { validateData } from "../../../middlewares/validateData";

export const TagsPostRouter = Express.Router();

TagsPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .isAscii()
    .isLength({ min: 1, max: 30 })
    .custom((name: string, meta) => {
      const req = meta.req as Express.Request;
      const tag = getData<GIDData.tag>(`SELECT tag_id, tag_name FROM tags WHERE tag_creator = @tag_creator AND tag_name = @tag_name`, {
        tag_creator: req.extra.params.group_id,
        tag_name: name,
      });
      if (tag.data) throw new Error("Tag with that name allready exists");
      return true;
    }),

  body("description").trim().default(" ").escape().isAscii().isLength({ max: 300 }),

  body("type")
    .trim()
    .default("other")
    .custom((type: string) => {
      if (tag_types.findIndex((v) => v == type) == -1) throw new Error("Invalid Tag Type");
      return true;
    }),

  body("colour_text").trim().default("#000000").notEmpty().isHexColor(),

  body("colour_background").trim().default("#66A3FF").notEmpty().isHexColor(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const insertTag = createTransactionStatementTyped<Omit<GIDData.tag, "tag_id">>(
      `INSERT INTO tags (tag_creator, tag_name, tag_description, tag_type, tag_colour_text, tag_colour_background)
      VALUES (@tag_creator, @tag_name, @tag_description, @tag_type, @tag_colour_text, @tag_colour_background)`
    );

    const result = insertTag.run({
      tag_creator: req.extra.params.group_id,
      tag_name: req.body.name,
      tag_description: req.body.description,
      tag_type: req.body.type,
      tag_colour_text: req.body.colour_text,
      tag_colour_background: req.body.colour_background,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't create new tag");

    res.status(200);
    res.json({
      tag_id: result.data.lastInsertRowid,
      tag_creator: req.extra.params.group_id,
      tag_name: req.body.name,
      tag_description: req.body.description,
      tag_type: req.body.type,
      tag_colour_text: req.body.colour_text,
      tag_colour_background: req.body.colour_background,
    });
  }
);
