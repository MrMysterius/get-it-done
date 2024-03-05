import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { logger } from "@/main";
import { validateData } from "@/middlewares/validateData";

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
    const defaultState = getData<GIDData.state>(`SELECT * FROM states WHERE is_default = 1 AND state_creator = ?`, req.extra.params.group_id);

    const insertTask = createTransactionStatementTyped<Omit<GIDData.task, "task_id" | "task_archived" | "task_last_edit_timestamp">>(
      `INSERT INTO tasks (task_creator, task_title, task_description, task_date_start, task_date_due, task_time_estimate, task_time_needed, task_creation_timestamp)
      VALUES (@task_creator, @task_title, @task_description, @task_date_start, @task_date_due, @task_time_estimate, @task_time_needed, @task_creation_timestamp)`
    );

    const creation_timestamp = Date.now().toString();

    const result = insertTask.run({
      task_creator: req.extra.params.group_id,
      task_title: req.body.title,
      task_description: req.body.description || null,
      task_date_start: req.body.date_start || null,
      task_date_due: req.body.date_due || null,
      task_time_estimate: req.body.time_estimate || 0,
      task_time_needed: req.body.time_needed || 0,
      task_creation_timestamp: creation_timestamp,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Cound't create new task");

    if (defaultState.data) {
      const stateUpdate = createTransactionStatementTyped<GIDData.task_state>(
        `INSERT INTO task_state (task_id, state_id)
        VALUES (@task_id, @state_id)`
      );

      const stateRes = stateUpdate.run({ task_id: result.data.lastInsertRowid as number, state_id: defaultState.data.state_id });
      if (!stateRes.isSuccessful) logger.error("Couldn't set default state");
    }

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
      task_creation_timestamp: creation_timestamp,
    });
  }
);
