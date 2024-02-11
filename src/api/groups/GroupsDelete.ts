import { createTransactionStatementTyped, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const GroupsDeleteRouter = Express.Router();

GroupsDeleteRouter.delete(
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

  // DATA CHECK

  validateData,

  // ACTUAL REQUEST HANDLE

  (req, res) => {
    const deleteGroup = createTransactionStatementTyped<Pick<GIDData.group, "group_id">>(`DELETE FROM groups WHERE group_id = @group_id`);

    const result = deleteGroup.run({ group_id: parseInt(req.params.group_id) });

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      group_id: req.params.group_id,
    });
  }
);
