import { createTransactionStatement } from "./databaseFunctions";

export function updateLastActionTimestamp(user_id: number) {
  const statement = createTransactionStatement(`UPDATE users SET user_last_action_timestamp = ? WHERE user_id = ?`);
  const res = statement.run(Date.now().toString(), user_id);
  if (!res.isSuccessful) {
    throw new Error(`Couldn't update user ${user_id}'s last action timestamp`);
  }
  return res;
}
