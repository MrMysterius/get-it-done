import { getAllUsersWithInvitee, getUserWithInvitee } from "@/functions/database/queries/userQueries";

import Express from "express";
import { generateErrorWithStatus } from "@/functions/generateErrorWithStatus";
import { param } from "express-validator";
import { validateData } from "@/middlewares/validateData";

export const UsersGetRouter = Express.Router();

const unauthedAccessError = generateErrorWithStatus("Unauthorized Access", 403);

UsersGetRouter.get("/", (req, res) => {
  if (req.authedUser?.user_role != "admin") throw unauthedAccessError;

  const users = getAllUsersWithInvitee.getAll({});

  if (!users.isSuccessful) throw new Error("Couldn't get users.");

  const userList =
    users.data?.map((u) => {
      const invitee = u.user_invited_from ? { id: u.user_invited_from, name: u.invitee_user_name, displayname: u.invitee_user_displayname } : null;

      return {
        id: u.user_id,
        name: u.user_name,
        displayname: u.user_displayname,
        role: u.user_role,
        last_action: u.user_last_action_timestamp,
        user_active: u.user_active,
        invitee,
      };
    }) || [];

  res.status(200);
  res.json({
    users: userList,
  });
});

UsersGetRouter.get("/:user_id", param("user_id").trim().isNumeric().notEmpty(), validateData, (req, res) => {
  if (req.authedUser?.user_role != "admin") throw unauthedAccessError;

  const user = getUserWithInvitee.get({ user_id: req.params.user_id });

  if (!user.isSuccessful) throw new Error("Couldn't get user.");
  if (!user.data) throw generateErrorWithStatus("This user does not exist", 404);

  const invitee = user.data.user_invited_from
    ? { id: user.data.user_invited_from, name: user.data.invitee_user_name, displayname: user.data.invitee_user_displayname }
    : null;

  res.status(200);
  res.json({
    id: user.data.user_id,
    name: user.data.user_name,
    displayname: user.data.user_displayname,
    role: user.data.user_role,
    last_action: user.data.user_last_action_timestamp,
    user_active: user.data.user_active,
    invitee,
  });
});
