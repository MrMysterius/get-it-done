import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TagsDeleteRouter = Express.Router();

TagsDeleteRouter.delete(
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

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteTag = createTransactionStatementTyped<Pick<GIDData.tag, "tag_id">>(`DELETE FROM tags WHERE tag_id = @tag_id`);

    const result = deleteTag.run({ tag_id: parseInt(req.params.tag_id) });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't delete tag");

    res.status(200);
    res.json({
      tag_id: req.params.tag_id,
    });
  }
);
