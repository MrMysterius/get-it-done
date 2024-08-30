import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { validateData } from "../../middlewares/validateData";

export const GroupsPutRouter = Express.Router();

GroupsPutRouter.put(
  "/:group_id",

  // REQUEST DATA REQUIREMENTS
  param("group_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const group = getData<Pick<GIDData.group, "group_id" | "group_owner">>(`SELECT group_id, group_owner FROM groups WHERE group_id = ?`, id);
      if (!group.isSuccessful || !group.data || (req.authedUser?.user_role == "user" && req.authedUser.user_id != group.data.group_owner))
        throw new Error("Group with that ID doesn't exist");
      return true;
    }),

  body("group_name").trim().notEmpty().isAscii().isLength({ min: 1, max: 100 }).optional(),

  body("group_owner")
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
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUESAT HANDLE
  (req, res) => {
    const originalGroup = getData<GIDData.group>(`SELECT * FROM groups WHERE group_id = ?`, req.params.group_id);

    if (!originalGroup.isSuccessful || !originalGroup.data) throw new Error();

    const insertGroup = createTransactionStatementTyped<GIDData.group>(
      `UPDATE groups
      SET 
        group_name = @group_name,
        group_owner = @group_owner
      WHERE
        group_id = @group_id`
    );

    const groupResult = insertGroup.run({
      group_id: originalGroup.data.group_id,
      group_name: req.body.group_name || originalGroup.data.group_name,
      group_owner: req.body.group_owner || originalGroup.data.group_owner,
    });

    if (!groupResult.isSuccessful || !groupResult.data) throw new Error();

    res.status(200);
    res.json({
      group_id: originalGroup.data.group_id,
      group_name: req.body.group_name || originalGroup.data.group_name,
      group_owner: req.body.group_owner || originalGroup.data.group_owner,
    });
  }
);
