import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const StatesDeleteRouter = Express.Router();

StatesDeleteRouter.delete(
  "/:state_id",

  // REQUEST DATA REQUIREMENTS
  param("state_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const state = getData<Pick<GIDData.state, "state_id" | "state_creator">>(`SELECT state_id, state_creator FROM states WHERE state_id = ?`, id);
      if (!state.data || state.data.state_creator != req.extra.params.group_id) throw new Error("This state id does not exist");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteState = createTransactionStatementTyped<Pick<GIDData.state, "state_id">>(`DELETE FROM states WHERE state_id = @state_id`);

    const result = deleteState.run({ state_id: parseInt(req.params.state_id) });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't delete state");

    res.status(200);
    res.json({
      state_id: req.params.state_id,
    });
  }
);
