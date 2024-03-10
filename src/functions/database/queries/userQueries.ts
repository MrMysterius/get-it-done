import { createDataQuery } from "@/functions/databaseFunctions";

export const getAllUsersWithInvitee = createDataQuery<GIDData.user & { invitee_user_name: string; invitee_user_displayname: string }>()(
  `SELECT
    users.*,
    invite.user_name as invitee_user_name,
    invite.user_displayname as invitee_user_displayname
  FROM users
  LEFT JOIN users as invite
  ON invite.user_id = users.user_invited_from`
);

export const getUserWithInvitee = createDataQuery<GIDData.user & { invitee_user_name: string; invitee_user_displayname: string }>()(
  `SELECT
    users.*,
    invite.user_name as invitee_user_name,
    invite.user_displayname as invitee_user_displayname
  FROM users
  LEFT JOIN users as invite
  ON invite.user_id = users.user_invited_from
  WHERE users.user_id = @user_id`
);

export const getUserWithID = createDataQuery<GIDData.user>()(
  `SELECT user_id, user_name
  FROM users
  WHERE user_id = @user_id`
);

export const getUserWithUsername = createDataQuery<GIDData.user>()(
  `SELECT user_id, user_name
  FROM users
  WHERE user_name = @user_name`
);
