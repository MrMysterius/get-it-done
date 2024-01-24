import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { tag_types } from "../../../types/types";
import { validateData } from "../../../middlewares/validateData";

export const TagsPutRouter = Express.Router();

TagsPutRouter.put(
  "/:tag_id",

  // REQUEST DATA REQUIREMENTS
  param("tag_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: string, meta) => {
      const req = meta.req as Express.Request;
      const tag = getData<Pick<GIDData.tag, "tag_id" | "tag_creator">>(`SELECT tag_id, tag_creator FROM tags WHERE tag_id = ?`, id);
      if (!tag.data || tag.data.tag_creator != req.extra.params.group_id) throw new Error("Tag with that id doesn't exist");
      return true;
    }),

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
    })
    .optional(),

  body("description").trim().escape().isAscii().isLength({ max: 300 }).optional(),

  body("type")
    .trim()
    .custom((type: string) => {
      if (tag_types.findIndex((v) => v == type) == -1) throw new Error("Invalid Tag Type");
      return true;
    })
    .optional(),

  body("colour_text").trim().notEmpty().isHexColor().optional(),

  body("colour_background").trim().notEmpty().isHexColor().optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const originalTag = getData<GIDData.tag>(`SELECT * FROM tags WHERE tag_id = ?`, req.params.tag_id);

    if (!originalTag.data) throw new Error("Couldn't update Tag");

    const updateTag = createTransactionStatementTyped<Omit<GIDData.tag, "tag_creator">>(
      `UPDATE tags
      SET
        tag_name = @tag_name,
        tag_description = @tag_description,
        tag_type = @tag_type,
        tag_colour_text = @tag_colour_text,
        tag_colour_background = @tag_colour_background
      WHERE
        tag_id = @tag_id`
    );

    const result = updateTag.run({
      tag_id: req.params.tag_id as unknown as number,
      tag_name: req.body.name || originalTag.data.tag_name,
      tag_description: req.body.description || originalTag.data.tag_description,
      tag_type: req.body.type || originalTag.data.tag_type,
      tag_colour_text: req.body.colour_text || originalTag.data.tag_colour_text,
      tag_colour_background: req.body.colour_background || originalTag.data.tag_colour_background,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't update Tag");

    res.status(200);
    res.json({
      tag_id: req.params.tag_id as unknown as number,
      tag_creator: originalTag.data.tag_creator,
      tag_name: req.body.name || originalTag.data.tag_name,
      tag_description: req.body.description || originalTag.data.tag_description,
      tag_type: req.body.type || originalTag.data.tag_type,
      tag_colour_text: req.body.colour_text || originalTag.data.tag_colour_text,
      tag_colour_background: req.body.colour_background || originalTag.data.tag_colour_background,
    });
  }
);
