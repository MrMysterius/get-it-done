import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { validateData } from "../../../middlewares/validateData";

export const StatesPutRouter = Express.Router();

StatesPutRouter.put(
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

  body("name")
    .trim()
    .escape()
    .notEmpty()
    .isAscii()
    .isLength({ min: 1, max: 100 })
    .custom((name: string, meta) => {
      const req = meta.req as Express.Request;
      const state = getData<Pick<GIDData.state, "state_id" | "state_name">>(
        `SELECT state_id, state_name FROM states WHERE state_creator = @group_id AND state_name = @state_name`,
        { group_id: req.extra.params.group_id, state_name: name }
      );
      if (state.data) throw new Error("State with that name allready exists");
      return true;
    })
    .optional(),

  body("description").trim().escape().isAscii().isLength({ max: 300 }).optional(),

  body("colour_text").trim().notEmpty().isHexColor().optional(),

  body("colour_background").trim().notEmpty().isHexColor().optional(),

  body("is_default").trim().isIn([0, 1]).toInt().optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (req.body.is_default) {
      const updateStates = createTransactionStatementTyped<Pick<GIDData.state, "state_creator">>(
        `UPDATE states
        SET
          is_default = 0
        WHERE state_creator = @state_creator`
      );

      const updateResult = updateStates.run({ state_creator: req.extra.params.group_id });
      if (!updateResult.isSuccessful) throw new Error("Couldn't Update States");
    }

    const originalState = getData<GIDData.state>(`SELECT * FROM states WHERE state_id = ?`, req.params.state_id);

    if (!originalState.data) throw new Error();

    const updateState = createTransactionStatementTyped<Omit<GIDData.state, "state_creator">>(
      `UPDATE states
      SET
        state_name = @state_name,
        state_description = @state_description,
        state_colour_text = @state_colour_text,
        state_colour_background = @state_colour_background,
        is_default = @is_default
      WHERE state_id = @state_id`
    );

    const result = updateState.run({
      state_id: originalState.data.state_id,
      state_name: req.body.name || originalState.data.state_name,
      state_description: req.body.description || originalState.data.state_description,
      state_colour_text: req.body.colour_text || originalState.data.state_colour_text,
      state_colour_background: req.body.colour_background || originalState.data.state_colour_background,
      is_default: req.body.is_default != undefined ? req.body.is_default : originalState.data.is_default,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't update state");

    res.status(200);
    res.json({
      state_id: originalState.data.state_id,
      state_name: req.body.name || originalState.data.state_name,
      state_description: req.body.description || originalState.data.state_description,
      state_colour_text: req.body.colour_text || originalState.data.state_colour_text,
      state_colour_background: req.body.colour_background || originalState.data.state_colour_background,
      is_default: req.body.is_default != undefined ? req.body.is_default : originalState.data.is_default,
    });
  }
);
