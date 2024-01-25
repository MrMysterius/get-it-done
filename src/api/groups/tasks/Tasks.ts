import Express from "express";
import { TasksAsigneesRouter } from "./asignees/Asignees";
import { TasksDeleteRouter } from "./TasksDelete";
import { TasksGetRouter } from "./TasksGet";
import { TasksPostRouter } from "./TasksPost";
import { TasksPutRouter } from "./TasksPut";
import { TasksStateRouter } from "./state/State";
import { TasksTagsRouter } from "./tags/Tags";
import { getData } from "@/functions/databaseFunctions";
import { param } from "express-validator";

export const TasksRouter = Express.Router();

TasksRouter.use("/", TasksGetRouter);
TasksRouter.use("/", TasksPostRouter);
TasksRouter.use("/", TasksPutRouter);
TasksRouter.use("/", TasksDeleteRouter);

export const TasksSubRouter = Express.Router();

TasksRouter.use(
  "/:task_id",
  param("task_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: string, meta) => {
      const req = meta.req as Express.Request;
      const task = getData<GIDData.task>(`SELECT * FROM tasks WHERE task_id = ?`, id);
      if (!task.data || task.data.task_creator != req.extra.params.group_id) throw new Error("Task with that id doesn't exist");

      req.extra.params.task_id = task.data.task_id;
      req.extra.task = task.data;

      return true;
    }),
  TasksSubRouter
);

TasksSubRouter.use("/tags", TasksTagsRouter);
TasksSubRouter.use("/state", TasksStateRouter);
TasksSubRouter.use("/asignees", TasksAsigneesRouter);
