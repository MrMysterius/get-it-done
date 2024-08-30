import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "@/middlewares/validateData";

export const TasksStatePostRouter = Express.Router();

TasksStatePostRouter.post(
  "/:state_id",

  // REQUEST DATA REQUIREMENTS
  param("state_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((state_id: number, meta) => {
      const req = meta.req as Express.Request;
      const state = getData<Pick<GIDData.state, "state_id" | "state_creator" | "state_name">>(
        `SELECT state_id, state_creator, state_name FROM states WHERE state_id = ? AND state_creator = ?`,
        state_id,
        req.extra.params.group_id
      );
      if (!state.data) throw new Error(`This state id doesn't exist`);
      req.extra.state = state;
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const setState = getData<GIDData.task_state>(`SELECT * FROM task_state WHERE task_id = ?`, req.extra.params.task_id);

    if (setState.data) {
      const updateTaskState = createTransactionStatementTyped<GIDData.task_state>(
        `UPDATE task_state
        SET
          state_id = @state_id
        WHERE task_id = @task_id`
      );

      const result = updateTaskState.run({ task_id: req.extra.params.task_id, state_id: req.params.state_id });

      if (!result.data || !result.isSuccessful) throw new Error(`Couldn't update task state`);
    } else {
      const insertTaskState = createTransactionStatementTyped<GIDData.task_state>(
        `INSERT INTO task_state (task_id, state_id)
        VALUES (@task_id, @state_id)`
      );

      const result = insertTaskState.run({ task_id: req.extra.params.task_id, state_id: req.params.state_id });

      if (!result.data || !result.isSuccessful) throw new Error(`Couldn't set task state`);
    }

    res.status(200);
    res.json({
      task_id: req.extra.params.task_id,
      state: {
        id: req.params.state_id,
        name: req.extra.state.data.state_name,
      },
    });
  }
);
