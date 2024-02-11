import { getAllData, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const InvitesGetRouter = Express.Router();

InvitesGetRouter.get("/", (req, res) => {
  if (req.authedUser?.user_role == "admin") {
    const invites = getAllData<GIDData.invite & { invite_creator_username: string; invite_creator_displayname: string }>(
      `SELECT
        invites.*,
        users.user_name as invite_creator_username,
        users.user_displayname as invite_creator_displayname
      FROM invites
      LEFT JOIN users
      ON users.user_id = invites.invite_creator`
    );

    if (!invites.isSuccessful || !invites.data) throw new Error();

    res.status(200);
    res.json(
      invites.data.map((inv) => {
        return {
          invite_creator: {
            user_id: inv.invite_creator,
            user_name: inv.invite_creator_username,
            user_displayname: inv.invite_creator_displayname,
          },
          invite_id: inv.invite_id,
          invite_code: inv.invite_code,
          invite_limit: inv.invite_limit,
          invite_used_amount: inv.invite_used_amount,
        };
      })
    );
  } else {
    const invites = getAllData<GIDData.invite & { invite_creator_username: string; invite_creator_displayname: string }>(
      `SELECT
        invites.*,
        users.user_name as invite_creator_username,
        users.user_displayname as invite_creator_displayname
      FROM invites
      LEFT JOIN users
      ON users.user_id = invites.invite_creator
      WHERE invites.invite_creator = ?`,
      req.authedUser?.user_id
    );

    if (!invites.isSuccessful || !invites.data) throw new Error();

    res.status(200);
    res.json(
      invites.data.map((inv) => {
        return {
          invite_creator: {
            user_id: inv.invite_creator,
            user_name: inv.invite_creator_username,
            user_displayname: inv.invite_creator_displayname,
          },
          invite_id: inv.invite_id,
          invite_code: inv.invite_code,
          invite_limit: inv.invite_limit,
          invite_used_amount: inv.invite_used_amount,
        };
      })
    );
  }
});

InvitesGetRouter.get(
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
    const invite = getData<GIDData.invite & { invite_creator_username: string; invite_creator_displayname: string }>(
      `SELECT
          invites.*,
          users.user_name as invite_creator_username,
          users.user_displayname as invite_creator_displayname
        FROM invites
        LEFT JOIN users
        ON users.user_id = invites.invite_creator
        WHERE invites.invite_id = ?`,
      req.params.invite_id
    );

    if (!invite.isSuccessful || !invite.data) throw new Error();

    res.status(200);
    res.json({
      invite_creator: {
        user_id: invite.data.invite_creator,
        user_name: invite.data.invite_creator_username,
        user_displayname: invite.data.invite_creator_displayname,
      },
      invite_id: invite.data.invite_id,
      invite_code: invite.data.invite_code,
      invite_limit: invite.data.invite_limit,
      invite_used_amount: invite.data.invite_used_amount,
    });
  }
);
