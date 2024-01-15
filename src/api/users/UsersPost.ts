import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { generateErrorWithStatus } from "../../functions/generateErrorWithStatus";
import { generatePasswordHash } from "../../functions/generatePasswordHash";
import { user_roles } from "../../types";
import { validateData } from "../../middlewares/validateData";

export const UsersPostRouter = Express.Router();

UsersPostRouter.post(
  "/",
  body("user_name").trim().notEmpty().escape().isLength({ min: 1, max: 40 }).isAlphanumeric("en-US", { ignore: "._-" }),
  body("password").trim().notEmpty().isAscii().isLength({ max: 128 }),
  body("user_displayname").trim().notEmpty().isAscii().isLength({ max: 40 }).optional().default(null),
  body("user_role")
    .trim()
    .default("user")
    .custom((v: any) => {
      if (user_roles.findIndex(v) == -1) throw new Error("Invalid user role");
    })
    .optional(),
  body("invitee_id")
    .trim()
    .isNumeric()
    .custom((id: number) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, id);
      if (!user.data) throw new Error("Invitee doesn't exist");
    })
    .optional()
    .default(null),
  validateData,
  (req, res) => {
    if (req.authedUser?.user_role != "admin") throw generateErrorWithStatus("Unauthorized Access", 403);

    const statement = createTransactionStatement(
      `INSERT INTO users (user_name, user_password_hash, user_displayname, user_role, user_invited_from) VALUES (?, ?, ?, ?, ?)`
    );

    const result = statement.run(
      req.body.user_name,
      generatePasswordHash(req.body.password),
      req.body.user_displayname || req.body.user_name,
      req.body.user_role,
      req.body.invitee_id
    );

    if (!result.isSuccessful || !result.data || result.data.changes != 1) throw generateErrorWithStatus("Username allready exists", 400);

    res.status(200);
    res.json({
      user_id: result.data.lastInsertRowid,
      user_name: req.body.user_name,
      user_role: req.body.user_role,
    });
  }
);
