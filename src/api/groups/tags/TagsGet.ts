import { getAllData, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TagsGetRouter = Express.Router();

TagsGetRouter.get(
  "/",

  (req, res) => {
    const tags = getAllData<GIDData.tag>(`SELECT * FROM tags WHERE tag_creator = ?`, req.extra.params.group_id);

    if (!tags.data) throw new Error("Couldn't get tags");

    res.status(200);
    res.json(
      tags.data.map((tag) => {
        return {
          id: tag.tag_id,
          name: tag.tag_name,
          description: tag.tag_description,
          type: tag.tag_type,
          colour_text: tag.tag_colour_text,
          colour_background: tag.tag_colour_background,
        };
      })
    );
  }
);

TagsGetRouter.get(
  "/:tag_id",

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

  validateData,

  (req, res) => {
    const tag = getData<GIDData.tag>(`SELECT * FROM tags WHERE tag_id = ?`, req.params.tag_id);

    if (!tag.data) throw new Error("Couldn't get tag");

    res.status(200);
    res.json({
      id: tag.data.tag_id,
      name: tag.data.tag_name,
      description: tag.data.tag_description,
      type: tag.data.tag_type,
      colour_text: tag.data.tag_colour_text,
      colour_background: tag.data.tag_colour_background,
    });
  }
);
