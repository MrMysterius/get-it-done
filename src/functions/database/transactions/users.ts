import { DBTransaction } from "../Transaction";

export const updateUsersLastAction = new DBTransaction<Pick<GIDData.user, "user_id" | "user_last_action_timestamp">>(
  `UPDATE users
  SET user_last_action_timestamp = @user_last_action_timestamp
  WHERE user_id = @user_id`
);

export const createNewUser = new DBTransaction<Omit<GIDData.user, "user_id" | "user_last_action_timestamp">>(
  `INSERT INTO users (user_name, user_password_hash, user_displayname, user_role, user_invited_from, user_active)
  VALUES (@user_name, @user_password_hash, @user_displayname, @user_role, @user_invited_from, @user_active)`
);
