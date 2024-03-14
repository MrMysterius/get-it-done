import { DBQuery } from "../Query";

export const getUserByID = new DBQuery<Pick<GIDData.user, "user_id">, GIDData.user>(`SELECT * FROM "users" WHERE "user_id" = @user_id`);

export const getUserByName = new DBQuery<Pick<GIDData.user, "user_name">, GIDData.user>(`SELECT * FROM "users" WHERE "user_name" = @user_name`);

export const getUsersWithInvitee = new DBQuery<
  {},
  GIDData.user & { invitee_user_name: GIDData.user["user_name"]; invitee_user_displayname: GIDData.user["user_displayname"] }
>(
  `SELECT
    users.*,
    invite.user_name as invitee_user_name,
    invite.user_displayname as invitee_user_displayname
  FROM users
  LEFT JOIN users as invite
  ON invite.user_id = users.user_invited_from`
);

export const getUserWithInviteeByID = new DBQuery<
  Pick<GIDData.user, "user_id">,
  GIDData.user & { invitee_user_name: GIDData.user["user_name"]; invitee_user_displayname: GIDData.user["user_displayname"] }
>(
  `SELECT
    users.*,
    invite.user_name as invitee_user_name,
    invite.user_displayname as invitee_user_displayname
  FROM users
  LEFT JOIN users as invite
  ON invite.user_id = users.user_invited_from
  WHERE users.user_id = @user_id`
);
