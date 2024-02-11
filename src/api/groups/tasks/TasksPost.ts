import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TasksPostRouter = Express.Router();

TasksPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("title").trim().escape().notEmpty().isLength({ max: 1000 }),

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

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const insertTask = createTransactionStatementTyped<Omit<GIDData.task, "task_id" | "task_archived">>(
      `INSERT INTO tasks (task_creator, task_title, task_description, task_date_start, task_date_due, task_time_estimate, task_time_needed)
      VALUES (@task_creator, @task_title, @task_description, @task_date_start, @task_date_due, @task_time_estimate, @task_time_needed)`
    );

    const result = insertTask.run({
      task_creator: req.extra.params.group_id,
      task_title: req.body.title,
      task_description: req.body.description || null,
      task_date_start: req.body.date_start || null,
      task_date_due: req.body.date_due || null,
      task_time_estimate: req.body.time_estimate || 0,
      task_time_needed: req.body.time_needed || 0,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Cound't create new task");

    res.status(200);
    res.json({
      task_id: result.data.lastInsertRowid,
      task_creator: req.extra.params.group_id,
      task_title: req.body.title,
      task_description: req.body.description || null,
      task_date_start: req.body.date_start || null,
      task_date_due: req.body.date_due || null,
      task_time_estimate: req.body.time_estimate || 0,
      task_time_needed: req.body.time_needed || 0,
    });
  }
);
