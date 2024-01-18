import { createTransactionStatement, createTransactionStatementTyped, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const GroupsPostRouter = Express.Router();

GroupsPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("group_name").trim().notEmpty().isAscii().isLength({ min: 1, max: 100 }),

  body("group_owner")
    .default(0)
    .trim()
    .isNumeric()
    .toInt()
    .customSanitizer((user_id: number, meta) => {
      const req = meta.req as Express.Request;
      if (req.authedUser?.user_role == "user" || user_id == 0) user_id = req.authedUser?.user_id as number;
      return user_id;
    })
    .custom((user_id: number, meta) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, user_id);
      if (!user.data) throw new Error(`Invalid Group Owner`);
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUESAT HANDLE
  (req, res) => {
    const insertGroup = createTransactionStatementTyped<Omit<GIDData.group, "group_id">>(
      `INSERT INTO groups (group_name, group_owner)
      VALUES (@group_name, @group_owner)`
    );

    const groupResult = insertGroup.run({ group_name: req.body.group_name, group_owner: req.body.group_owner });

    if (!groupResult.isSuccessful || !groupResult.data) throw new Error();

    res.status(200);
    res.json({
      group_id: groupResult.data.lastInsertRowid,
      group_name: req.body.group_name,
      group_owner: req.body.group_owner,
    });
  }
);
