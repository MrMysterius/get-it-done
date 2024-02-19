import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { generateErrorWithStatus } from "@/functions/generateErrorWithStatus";
import { validateData } from "@/middlewares/validateData";

export const TaskTagsDeleteRouter = Express.Router();

TaskTagsDeleteRouter.delete(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("tags")
    .notEmpty()
    .customSanitizer((input) => {
      if (typeof input == "string" || typeof input == "number") {
        return [input];
      }
      return input;
    })
    .customSanitizer((input: Array<string | number>, meta) => {
      if (!(input as Array<string | number>)?.map)
        throw generateErrorWithStatus(`Provided an Object instead of String, Number or Array of String and Numbers`, 400);
      input = input.filter((v: any) => typeof v == "number" || typeof v == "string");
      const req = meta.req as Express.Request;
      const tags = input
        .map((id: string | number) => {
          if (typeof id == "number")
            return getData<Pick<GIDData.tag, "tag_id" | "tag_name">>(
              `SELECT tag_id, tag_name FROM tags WHERE tag_id = ? AND tag_creator = ?`,
              id,
              req.extra.params.group_id
            );
          if (typeof id == "string")
            return getData<Pick<GIDData.tag, "tag_id" | "tag_name">>(
              `SELECT tag_id, tag_name FROM tags WHERE tag_name = ? AND tag_creator = ?`,
              escape(id),
              req.extra.params.group_id
            );
        })
        .filter((tag) => tag.data)
        .filter((tag) => {
          const task_tag = getData<GIDData.task_tag>(`SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?`, req.extra.params.task_id, tag.data.tag_id);
          if (!task_tag.data) return false;
          return true;
        });

      return tags;
    })
    .custom((tags: Array<{ data: GIDData.tag }>) => {
      if (tags.length == 0) throw new Error(`No valid existing tags provided`);
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const tags = req.body.tags as Array<{ data: Pick<GIDData.tag, "tag_id" | "tag_name"> }>;

    const deleteTaskTag = createTransactionStatementTyped<GIDData.task_tag>(`DELETE FROM task_tags WHERE task_id = @task_id AND tag_id = @tag_id`);

    const resultTags = tags.map((tag) => {
      const result = deleteTaskTag.run({ task_id: req.extra.params.task_id, tag_id: tag.data.tag_id });
      if (!result.data || !result.isSuccessful) throw new Error(`Couldn't add Tag to Task - ${tag.data.tag_id}#${tag.data.tag_name}`);
      return { tag, result };
    });

    res.status(200);
    res.json(resultTags.filter((data) => data.result.data && data.result.isSuccessful).map((data) => data.tag.data));
  }
);
