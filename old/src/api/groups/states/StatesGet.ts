import { getAllData, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const StatesGetRouter = Express.Router();

StatesGetRouter.get(
  "/",

  (req, res) => {
    const states = getAllData<GIDData.state>(`SELECT * FROM states WHERE state_creator = ?`, req.extra.params.group_id);

    if (!states.data) throw new Error("Couldn't get states");

    res.status(200);
    res.json(
      states.data.map((state) => {
        return {
          id: state.state_id,
          name: state.state_name,
          description: state.state_description,
          colour_text: state.state_colour_text,
          colour_background: state.state_colour_background,
          is_default: state.is_default,
        };
      })
    );
  }
);

StatesGetRouter.get(
  "/:state_id",

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

  validateData,

  (req, res) => {
    const state = getData<GIDData.state>(`SELECT * FROM states WHERE state_id = ?`, req.params.state_id);

    if (!state.data) throw new Error("Couldn't get states");

    res.status(200);
    res.json({
      id: state.data.state_id,
      name: state.data.state_name,
      description: state.data.state_description,
      colour_text: state.data.state_colour_text,
      colour_background: state.data.state_colour_background,
      is_default: state.data.is_default,
    });
  }
);
