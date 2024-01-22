import { getAllData, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TasksGetRouter = Express.Router();

TasksGetRouter.get(
  "/",

  (req, res) => {
    const tasks = getAllData<GIDData.task>(`SELECT * FROM tasks WHERE task_creator = ?`, req.extra.params.group_id);

    if (!tasks.data) throw new Error("Couldn't get tasks");

    res.status(200);
    res.json(
      tasks.data.map((task) => {
        return {
          id: task.task_id,
          title: task.task_title,
          description: task.task_description,
          date_start: task.task_date_start,
          date_due: task.task_date_due,
          time_estimate: task.task_time_estimate,
          time_needed: task.task_time_needed,
          isArchived: task.task_archived,
        };
      })
    );
  }
);

TasksGetRouter.get(
  "/:task_id",

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

  validateData,

  (req, res) => {
    const task = getData<GIDData.task>(`SELECT * FROM tasks WHERE task_id = ?`, req.params.task_id);

    if (!task.data) throw new Error("Couldn't get task");

    res.status(200);
    res.json({
      id: task.data.task_id,
      title: task.data.task_title,
      description: task.data.task_description,
      date_start: task.data.task_date_start,
      date_due: task.data.task_date_due,
      time_estimate: task.data.task_time_estimate,
      time_needed: task.data.task_time_needed,
      isArchived: task.data.task_archived,
    });
  }
);
