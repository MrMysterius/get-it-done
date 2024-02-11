import { Result, body, param } from "express-validator";
import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { validateData } from "../../middlewares/validateData";

export const InvitesPutRouter = Express.Router();

InvitesPutRouter.put(
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

  body("invite_creator")
    .trim()
    .notEmpty()
    .isNumeric()
    .customSanitizer((id: number, meta) => {
      const req = meta.req as Express.Request;
      const invite = getData<Pick<GIDData.invite, "invite_id" | "invite_creator">>(
        `SELECT invite_id, invite_creator FROM invites WHERE invite_id = ?`,
        req.params.invite_id
      );
      if (req.authedUser?.user_role != "admin") {
        // req.body.invite_creator = invite.data?.invite_creator;
        id = invite.data?.invite_creator as number;
      }
      return id;
    })
    .toInt()
    .optional(),

  body("invite_limit")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((limit: number) => {
      if (limit < 1 || limit > 100) throw new Error("Invite Limit too low or too high. Min 1 and Max 100.");
      return true;
    })
    .optional(),

  body("invite_code")
    .trim()
    .notEmpty()
    .isAlphanumeric("en-US")
    .customSanitizer((code: string, meta) => {
      const req = meta.req as Express.Request;
      const invite = getData<Pick<GIDData.invite, "invite_id" | "invite_code">>(
        `SELECT invite_id, invite_code FROM invites WHERE invite_id = ?`,
        req.params.invite_id
      );
      if (req.authedUser?.user_role != "admin") {
        code = invite.data?.invite_code as string;
      }
      return code;
    })
    .custom((code: string, meta) => {
      const req = meta.req as Express.Request;
      const invite = getData<Pick<GIDData.invite, "invite_id" | "invite_code">>(`SELECT invite_id, invite_code FROM invites WHERE invite_code = ?`, code);
      if (invite.data && invite.data.invite_id != parseInt(req.params.invite_id)) throw new Error("Invite code allready used elswhere");
      return true;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACUTAL REQUEST HANDLE
  (req, res) => {
    const originalInvite = getData<GIDData.invite>(`SELECT * FROM invites WHERE invite_id = ?`, req.params.invite_id);

    if (!originalInvite.isSuccessful || !originalInvite.data) throw new Error();

    const statement = createTransactionStatement(
      `UPDATE invites
      SET
        invite_creator = @invite_creator,
        invite_code = @invite_code,
        invite_limit = @invite_limit
      WHERE
        invite_id = @invite_id`
    );

    const result = statement.run({
      invite_id: req.params.invite_id,
      invite_creator: req.body.invite_creator || originalInvite.data.invite_creator,
      invite_code: req.body.invite_code || originalInvite.data.invite_code,
      invite_limit: req.body.invite_limit || originalInvite.data.invite_limit,
    });

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      invite_id: req.params.invite_id,
      invite_creator: req.body.invite_creator || originalInvite.data.invite_creator,
      invite_code: req.body.invite_code || originalInvite.data.invite_code,
      invite_limit: req.body.invite_limit || originalInvite.data.invite_limit,
    });
  }
);
