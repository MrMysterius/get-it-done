import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const InvitesDeleteRouter = Express.Router();

InvitesDeleteRouter.delete(
  "/:invite_id",

  // REQUEST DATA REQUIREMENTS
  param("invite_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const invite = getData<Pick<GIDData.invite, "invite_id" | "invite_creator">>(`SELECT invite_id, invite_creator FROM invites WHERE invite_id = ?`, id);
      if (!invite.isSuccessful || !invite.data || (req.authedUser?.user_role == "user" && invite.data.invite_creator != req.authedUser.user_id))
        throw new Error("Invite with this id doesn't exist");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const statement = createTransactionStatement(`DELETE FROM invites WHERE invite_id = @invite_id`);

    const result = statement.run({ invite_id: req.params.invite_id });

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      invite_id: req.params.invite_id,
    });
  }
);
