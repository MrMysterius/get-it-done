import { getAllData, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { generateErrorWithStatus } from "../../functions/generateErrorWithStatus";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const UsersGetRouter = Express.Router();

const unauthedAccessError = generateErrorWithStatus("Unauthorized Access", 403);

UsersGetRouter.get("/", (req, res) => {
  if (req.authedUser?.user_role != "admin") throw unauthedAccessError;

  const users = getAllData<GIDData.user & { invitee_user_name: string; invitee_user_displayname: string }>(
    `SELECT
      users.*,
      invite.user_name as invitee_user_name,
      invite.user_displayname as invitee_user_displayname
    FROM users
    LEFT JOIN users as invite
    ON invite.user_id = users.user_invited_from`
  );

  if (!users.isSuccessful) throw new Error();

  res.status(200);
  res.json(
    users.data?.map((u) => {
      const invitee = u.user_invited_from
        ? { user_id: u.user_invited_from, user_name: u.invitee_user_name, user_displayname: u.invitee_user_displayname }
        : null;
      return {
        user_id: u.user_id,
        user_name: u.user_name,
        user_displayname: u.user_displayname,
        user_role: u.user_role,
        last_action: u.user_last_action_timestamp,
        user_active: u.user_active,
        invitee,
      };
    }) || []
  );
});

UsersGetRouter.get("/:user_id", param("user_id").trim().isNumeric().notEmpty(), validateData, (req, res) => {
  if (req.authedUser?.user_role != "admin") throw unauthedAccessError;

  const user = getData<GIDData.user & { invitee_user_name: string; invitee_user_displayname: string }>(
    `SELECT
      users.*,
      invite.user_name as invitee_user_name,
      invite.user_displayname as invitee_user_displayname
    FROM users
    LEFT JOIN users as invite
    ON invite.user_id = users.user_invited_from
    WHERE users.user_id = ?`,
    req.params.user_id
  );

  if (!user.isSuccessful) throw new Error();
  if (!user.data) throw generateErrorWithStatus("This user does not exist", 404);

  const invitee = user.data.user_invited_from
    ? { user_id: user.data.user_invited_from, user_name: user.data.invitee_user_name, user_displayname: user.data.invitee_user_displayname }
    : null;
  res.status(200);
  res.json({
    user_id: user.data.user_id,
    user_name: user.data.user_name,
    user_displayname: user.data.user_displayname,
    user_role: user.data.user_role,
    last_action: user.data.user_last_action_timestamp,
    user_active: user.data.user_active,
    invitee,
  });
});
