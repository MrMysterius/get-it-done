import { createTransactionStatementTyped, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { generateErrorWithStatus } from "../../../functions/generateErrorWithStatus";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const MembersDeleteRouter = Express.Router();

MembersDeleteRouter.delete(
  "/:user_id",

  // REQUEST DATA REQUIREMENTS
  param("user_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const group_member = getData<GIDData.group_member>(`SELECT * FROM group_members WHERE group_id = @group_id AND user_id = @user_id`, {
        group_id: req.extra.params.group_id,
        user_id: id,
      });
      if (!group_member.data) throw new Error("That user id is not a member of that group");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (!req.extra.isGroupOwner && req.authedUser?.user_role != "admin") throw generateErrorWithStatus("Unauthorized Access", 403);

    const deleteUser = createTransactionStatementTyped<GIDData.group_member>(`DELETE FROM group_members WHERE group_id = @group_id AND user_id = @user_id`);

    const result = deleteUser.run({ group_id: req.extra.params.group_id, user_id: parseInt(req.params.user_id) });

    if (!result.isSuccessful || !result.data) throw new Error("Couldn't remove group member");

    res.status(200);
    res.json({
      group_id: req.extra.params.group_id,
      user_id: req.params.user_id,
    });
  }
);
