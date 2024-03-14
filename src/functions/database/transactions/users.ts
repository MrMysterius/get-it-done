import { DBTransaction } from "../Transaction";

export const updateUsersLastAction = new DBTransaction<Pick<GIDData.user, "user_id" | "user_last_action_timestamp">>(
  `UPDATE users
  SET user_last_action_timestamp = @user_last_action_timestamp
  WHERE user_id = @user_id`
);
