import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { validateData } from "@/middlewares/validateData";

export const InboxRouter = Express.Router();

InboxRouter.post(
  "/:inbox_code",

  param("inbox_code")
    .trim()
    .notEmpty()
    .isAlphanumeric()
    .custom((code: string, meta) => {
      const req = meta.req as Express.Request;
      const inbox_code = getData<GIDData.inbox_code>(`SELECT * FROM inbox_codes WHERE inbox_code = ?`, code);
      if (!inbox_code.data) throw new Error("Invalid Inbox Code");

      req.extra.inbox = inbox_code.data;

      return true;
    }),

  body("task").trim().escape().notEmpty().isLength({ max: 1000 }),

  validateData,

  (req, res) => {
    const inbox_code = req.extra.inbox as GIDData.inbox_code;

    const insertTask = createTransactionStatementTyped<Omit<GIDData.task, "task_id" | "task_archived" | "task_last_edit_timestamp">>(
      `INSERT INTO tasks (task_creator, task_title, task_description, task_date_start, task_date_due, task_time_estimate, task_time_needed, task_creation_timestamp)
      VALUES (@task_creator, @task_title, @task_description, @task_date_start, @task_date_due, @task_time_estimate, @task_time_needed, @task_creation_timestamp)`
    );

    const creation_timestamp = Date.now().toString();

    const resultTask = insertTask.run({
      task_creator: inbox_code.inbox_owner,
      task_title: req.body.task,
      task_description: "",
      task_date_start: null,
      task_date_due: null,
      task_time_estimate: 0,
      task_time_needed: 0,
      task_creation_timestamp: creation_timestamp,
    });

    if (!resultTask.data || !resultTask.isSuccessful) throw new Error("Couldn't create task");

    const tags: Array<Responses.Database<GIDData.tag>> =
      JSON.parse(inbox_code.inbox_extras)?.tags?.map((tag: string) => {
        return getData<GIDData.tag>(`SELECT * FROM tags WHERE tag_creator = ? AND tag_name = ?`, inbox_code.inbox_owner, tag);
      }) || [];

    const insertTaskTag = createTransactionStatementTyped<GIDData.task_tag>(
      `INSERT INTO task_tags (task_id, tag_id)
      VALUES (@task_id, @tag_id)`
    );

    const resultTags = tags
      .map((tag) => {
        if (!tag.data) return null;
        const result = insertTaskTag.run({ task_id: resultTask.data.lastInsertRowid as number, tag_id: tag.data.tag_id });
        return { tag, result };
      })
      .filter((data) => data != null);

    res.status(200);
    res.json({
      task: req.body.task,
      tags: resultTags.map((data) => {
        return data.tag.data.tag_name;
      }),
    });
  }
);
