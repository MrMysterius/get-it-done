import { updateUsersLastAction } from "./database/transactions/users";

export function updateLastActionTimestamp(user_id: number) {
  const res = updateUsersLastAction.run({ user_id: user_id, user_last_action_timestamp: Date.now().toString() });
  if (!res.isSuccessful) {
    throw new Error(`Couldn't update user ${user_id}'s last action timestamp`);
  }
  return res;
}
