import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const StatesPostRouter = Express.Router();

StatesPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
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
    }),

  body("description").trim().default(" ").escape().isAscii().isLength({ max: 300 }),

  body("colour_text").trim().default("#000000").notEmpty().isHexColor(),

  body("colour_background").trim().default("#262626").notEmpty().isHexColor(),

  body("is_default").trim().default(0).isIn([0, 1]).toInt(),

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

    const createState = createTransactionStatementTyped<Omit<GIDData.state, "state_id">>(
      `INSERT INTO states (state_creator, state_name, state_description, state_colour_text, state_colour_background, is_default)
      VALUES (@state_creator, @state_name, @state_description, @state_colour_text, @state_colour_background, @is_default)`
    );

    const result = createState.run({
      state_creator: req.extra.params.group_id,
      state_name: req.body.name,
      state_description: req.body.description,
      state_colour_text: req.body.colour_text,
      state_colour_background: req.body.colour_background,
      is_default: req.body.is_default,
    });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't create state");

    res.status(200);
    res.json({
      state_id: result.data.lastInsertRowid,
      state_creator: req.extra.params.group_id,
      state_name: req.body.name,
      state_description: req.body.description,
      state_colour_text: req.body.colour_text,
      state_colour_background: req.body.colour_background,
      is_default: req.body.is_default,
    });
  }
);
