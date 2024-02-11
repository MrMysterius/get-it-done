import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { validateData } from "../../../middlewares/validateData";

export const TasksPutRouter = Express.Router();

TasksPutRouter.put(
  "/:task_id",

  // REQUEST DATA REQUIREMENTS
  param("task_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: string, meta) => {
      const req = meta.req as Express.Request;
      const tag = getData<Pick<GIDData.task, "task_id" | "task_creator">>(`SELECT task_id, task_creator FROM tasks WHERE task_id = ?`, id);
      if (!tag.data || tag.data.task_creator != req.extra.params.group_id) throw new Error("Tag with that id doesn't exist");
      return true;
    }),

  body("title").trim().escape().notEmpty().isLength({ max: 1000 }).optional(),

  body("description").trim().escape().isLength({ max: 3000 }).optional(),

  body("date_start")
    .trim()
    .notEmpty()
    .custom((date: string) => {
      const match = date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      if (!match) throw new Error("Invalid Date Format use yyyy-MM-dd HH:mm:ss");
      return true;
    })
    .optional(),

  body("date_due")
    .trim()
    .notEmpty()
    .custom((date: string) => {
      const match = date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      if (!match) throw new Error("Invalid Date Format use yyyy-MM-dd HH:mm:ss");
      return true;
    })
    .optional(),

  body("time_estimate").trim().notEmpty().isNumeric().toInt().optional(),

  body("time_needed").trim().notEmpty().isNumeric().toInt().optional(),

  body("isArchived").trim().notEmpty().isIn([0, 1]).toInt().optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const originalTask = getData<GIDData.task>(`SELECT * FROM tasks WHERE task_id = ?`, req.params.task_id);

    if (!originalTask.data) throw new Error("Couldn't update task");

    const updateStatement = createTransactionStatementTyped<Omit<GIDData.task, "task_creator">>(
      `UPDATE tasks
      SET
        task_title = @task_title,
        task_description = @task_description,
        task_date_start = @task_date_start,
        task_date_due = @task_date_due,
        task_time_estimate = @task_time_estimate,
        task_time_needed = @task_time_needed,
        task_archived = @task_archived
      WHERE task_id = @task_id`
    );

    const result = updateStatement.run({
      task_id: req.params.task_id as unknown as number,
      task_title: req.body.task_title || originalTask.data.task_title,
      task_description: req.body.task_description || originalTask.data.task_description,
      task_date_start: req.body.date_start || originalTask.data.task_date_start,
      task_date_due: req.body.date_due || originalTask.data.task_date_due,
      task_time_estimate: req.body.time_estimate || originalTask.data.task_time_estimate,
      task_time_needed: req.body.time_needed || originalTask.data.task_time_needed,
      task_archived: req.body.isArchived != undefined ? req.body.isArchived : originalTask.data.task_archived,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't update task");

    res.status(200);
    res.json({
      task_id: req.params.task_id as unknown as number,
      task_creator: originalTask.data.task_creator,
      task_title: req.body.task_title || originalTask.data.task_title,
      task_description: req.body.task_description || originalTask.data.task_description,
      task_date_start: req.body.date_start || originalTask.data.task_date_start,
      task_date_due: req.body.date_due || originalTask.data.task_date_due,
      task_time_estimate: req.body.time_estimate || originalTask.data.task_time_estimate,
      task_time_needed: req.body.time_needed || originalTask.data.task_time_needed,
      task_archived: req.body.isArchived != undefined ? req.body.isArchived : originalTask.data.task_archived,
    });
  }
);
