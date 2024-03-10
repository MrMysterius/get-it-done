import { createTransaction } from "@/functions/databaseFunctions";

export const createNewUser = createTransaction<GIDData.user>()(
  `INSERT INTO users (user_id, user_name, user_password_hash, user_displayname, user_role, user_invited_from, user_active)
  VALUES (@user_id, @user_name, @user_password_hash, @user_displayname, @user_role, @user_invited_from, @user_active)`
);
