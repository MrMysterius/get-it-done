import Express from "express";
import { getData } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const TasksStateGetRouter = Express.Router();

TasksStateGetRouter.get(
  "/",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const state = getData<GIDData.state & GIDData.task_state>(
      `SELECT * FROM task_state LEFT JOIN states ON task_state.state_id = states.state_id WHERE task_state.task_id = ?`,
      req.extra.params.task_id
    );

    res.status(200);
    res.json({
      task_id: req.extra.params.task_id,
      state: state.data
        ? {
            id: state.data.state_id,
            name: state.data.state_name,
          }
        : null,
    });
  }
);
