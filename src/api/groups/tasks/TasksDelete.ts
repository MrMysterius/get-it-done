import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TasksDeleteRouter = Express.Router();

TasksDeleteRouter.delete(
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

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteTask = createTransactionStatementTyped<Pick<GIDData.task, "task_id">>(`DELETE FROM tasks WHERE task_id = @task_id`);

    const result = deleteTask.run({ task_id: parseInt(req.params.task_id) });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't delete task");

    res.status(200);
    res.json({
      task_id: req.params.task_id,
    });
  }
);
