import { createTransactionStatement, createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { generateErrorWithStatus } from "../../../functions/generateErrorWithStatus";
import { validateData } from "../../../middlewares/validateData";

export const MembersPostRouter = Express.Router();

MembersPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("user_name")
    .trim()
    .notEmpty()
    .isAlphanumeric("en-US", { ignore: "._-" })
    .isLength({ min: 1, max: 40 })
    .custom((name: string) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_name = ?`, name);
      if (!user.data) throw new Error("This user does not exist");
      return true;
    }),

  body("user_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, id);
      if (!user.data || req.authedUser?.user_role != "admin") return true;
      req.body.user_name = user.data.user_name;
      return true;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (!req.extra.isGroupOwner && req.authedUser?.user_role != "admin") throw generateErrorWithStatus("Unauthorized Access", 403);

    const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_name = ?`, req.body.user_name);
    if (!user.data) throw new Error("User doesn't exist");

    if (req.extra.group.group_owner == user.data.user_id) throw generateErrorWithStatus("Owner can't add themselfs as a member", 400);

    const memberInsert = createTransactionStatementTyped<GIDData.group_member>(
      `INSERT INTO group_members (group_id, user_id)
      VALUES (@group_id, @user_id)`
    );

    const result = memberInsert.run({ group_id: req.extra.params.group_id as number, user_id: user.data.user_id });

    if (!result.isSuccessful || !result.data) throw generateErrorWithStatus("User is allready part of that group", 400);

    res.status(200);
    res.json({
      group_id: req.extra.params.group_id,
      user_id: user.data.user_id,
      user_name: user.data.user_name,
    });
  }
);
