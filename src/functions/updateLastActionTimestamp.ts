import { createTransactionStatementTyped } from "./databaseFunctions";

export function updateLastActionTimestamp(user_id: GIDData.user["user_id"]) {
  const updateTimestamp = createTransactionStatementTyped<Pick<GIDData.user, "user_id" | "user_last_action_timestamp">>(
    `UPDATE users
    SET user_last_action_timestamp = @user_last_action_timestamp
    WHERE user_id = @user_id`
  );

  const updateTimestampResponse = updateTimestamp.run({ user_id: user_id, user_last_action_timestamp: Date.now().toString() });

  if (!updateTimestampResponse.isSuccessful) {
    throw new Error(`Couldn't update the timestamp of "${user_id}"'s last action.`);
  }
  return updateTimestampResponse;
}
