import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { validateData } from "@/middlewares/validateData";

export const TasksAsigneesDeleteRouter = Express.Router();

TasksAsigneesDeleteRouter.delete(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("user_name")
    .trim()
    .notEmpty()
    .isAlphanumeric("en-US", { ignore: "._-" })
    .custom((name: string, meta) => {
      const req = meta.req as Express.Request;
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(
        `SELECT users.user_id, users.user_name FROM group_members LEFT JOIN users ON group_members.user_id = users.user_id WHERE users.user_name = ? AND group_members.group_id = ?`,
        name,
        req.extra.params.group_id
      );
      const group_owner = getData<Pick<GIDData.user, "user_id" | "user_name">>(
        `SELECT users.user_id, users.user_name FROM groups LEFT JOIN users ON groups.group_owner = users.user_id WHERE users.user_name = ? AND groups.group_id = ?`,
        name,
        req.extra.params.group_id
      );
      if (!user.data && !group_owner.data) throw new Error("User isn't part of the Group");

      req.extra.asignee = user.data || group_owner.data;

      return true;
    })
    .custom((_name: string, meta) => {
      const req = meta.req as Express.Request;
      const task_asignee = getData<GIDData.task_asignee>(
        `SELECT * FROM task_asignees WHERE task_id = ? AND user_id = ?`,
        req.extra.params.task_id,
        req.extra.asignee?.user_id
      );
      if (!task_asignee.data) throw new Error("User not asigned to that task");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteTaskAsignee = createTransactionStatementTyped<Pick<GIDData.user, "user_id"> & Pick<GIDData.task, "task_id">>(
      `DELETE FROM task_asignees WHERE task_id = @task_id AND user_id = @user_id`
    );

    const result = deleteTaskAsignee.run({ task_id: req.extra.params.task_id, user_id: req.extra.asignee.user_id });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't remove asignee to task");

    res.status(200);
    res.json({
      task_id: req.extra.params.task_id,
      asignee: {
        name: req.extra.asignee.user_name,
      },
    });
  }
);
