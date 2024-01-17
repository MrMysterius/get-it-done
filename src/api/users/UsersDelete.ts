import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { generateErrorWithStatus } from "../../functions/generateErrorWithStatus";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const UsersDeleteRouter = Express.Router();

UsersDeleteRouter.delete(
  "/:user_id",

  // REQUEST DATA REQUIREMENTS

  param("user_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .custom((id: number) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, id);
      if (!user.isSuccessful || !user.data) throw new Error("User doesn't exist");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const statement = createTransactionStatement(`DELETE FROM users WHERE user_id = @user_id`);

    if (!req.authedUser) throw generateErrorWithStatus("Unauthorized Access", 401);

    if (req.authedUser.user_role == "admin" && req.authedUser.user_id != parseInt(req.params.user_id)) {
      const result = statement.run({ user_id: req.params.user_id });

      if (!result.isSuccessful || !result.data) throw new Error();

      res.status(200);
      res.json({
        user_id: req.params.user_id,
        changes_made: result.data.changes,
      });
      return;
    }

    if (req.authedUser.user_id != parseInt(req.params.user_id)) throw generateErrorWithStatus("Unauthorized Acces", 403);

    const result = statement.run({ user_id: req.params.user_id });

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      user_id: req.params.user_id,
      changes_made: result.data.changes,
    });
    return;
  }
);
