import { body, param } from "express-validator";
import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { generateErrorWithStatus } from "../../functions/generateErrorWithStatus";
import { generatePasswordHash } from "../../functions/generatePasswordHash";
import { user_roles } from "../../types";
import { validateData } from "../../middlewares/validateData";

export const UsersPutRouter = Express.Router();

//? Potentially add middleware to preload some data to reduce database querries for the same thing
UsersPutRouter.put(
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

  body("user_name")
    .trim()
    .notEmpty()
    .escape()
    .isLength({ min: 1, max: 40 })
    .isAlphanumeric("en-US", { ignore: "._-" })
    .custom((name: string) => {
      const user = getData<Pick<GIDData.user, "user_name">>(`SELECT user_name FROM users WHERE user_name = ?`, name);
      if (user.data) throw new Error("User with that username allready exists");
      return true;
    })
    .optional(),

  body("password").trim().notEmpty().isAscii().isLength({ max: 128 }).optional(),

  body("user_displayname").trim().escape().notEmpty().isAscii().isLength({ max: 40 }).optional(),

  body("user_role")
    .trim()
    .custom((v: any) => {
      if (user_roles.findIndex((r) => r == v) == -1) throw new Error("Invalid user role");
      return true;
    })
    .optional(),

  body("invitee_id")
    .trim()
    .isNumeric()
    .custom((id: number) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, id);
      if (!user.data && id != 0) throw new Error("Invitee doesn't exist");
      return true;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (!req.authedUser) throw generateErrorWithStatus("Missing Authed User Data", 500);

    const originalUser = getData<GIDData.user>(`SELECT * FROM users WHERE user_id = ?`, req.params.user_id);

    if (!originalUser.isSuccessful) throw new Error();
    if (!originalUser.data) throw generateErrorWithStatus("User doesn't exist", 400);

    if (req.authedUser.user_role == "admin") {
      const statement = createTransactionStatement(
        `UPDATE users SET user_name = @user_name, user_displayname = @user_displayname, user_password_hash = @user_password_hash, user_role = @user_role, user_invited_from = @user_invited_from WHERE user_id = @user_id`
      );

      const result = statement.run({
        user_id: req.params.user_id,
        user_name: req.body.user_name || originalUser.data.user_name,
        user_password_hash: req.body.password ? generatePasswordHash(req.body.password) : originalUser.data.user_password_hash,
        user_displayname: req.body.user_displayname || originalUser.data.user_displayname,
        user_role: req.body.user_role || originalUser.data.user_role,
        user_invited_from: req.body.invitee_id || originalUser.data.user_invited_from,
      });

      if (!result.isSuccessful || !result.data) throw new Error();

      res.status(200);
      res.json({
        user_id: req.params.user_id,
        user_name: req.body.user_name || originalUser.data.user_name,
        password_updated: req.body.password ? "yes" : "no",
        user_displayname: req.body.user_displayname || originalUser.data.user_displayname,
        user_role: req.body.user_role || originalUser.data.user_role,
        user_invited_from: req.body.invitee_id || originalUser.data.user_invited_from,
        changes_made: result.data.changes,
      });
      return;
    }

    if (req.authedUser.user_id != originalUser.data.user_id) throw generateErrorWithStatus("Unauthorized Access", 403);

    const statement = createTransactionStatement(
      `UPDATE users SET user_name = @user_name, user_displayname = @user_displayname, user_password_hash = @user_password_hash WHERE user_id = @user_id`
    );

    const result = statement.run({
      user_id: req.params.user_id,
      user_name: req.body.user_name || originalUser.data.user_name,
      user_password_hash: req.body.password ? generatePasswordHash(req.body.password) : originalUser.data.user_password_hash,
      user_displayname: req.body.user_displayname || originalUser.data.user_displayname,
    });

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      user_id: req.params.user_id,
      user_name: req.body.user_name || originalUser.data.user_name,
      password_updated: req.body.password ? "yes" : "no",
      user_displayname: req.body.user_displayname || originalUser.data.user_displayname,
      changes_made: result.data.changes,
    });
  }
);
