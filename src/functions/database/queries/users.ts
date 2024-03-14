import { DBQuery } from "../Query";

export const getUserByID = new DBQuery<Pick<GIDData.user, "user_id">, GIDData.user>(`SELECT * FROM "users" WHERE "user_id" = @user_id`);

export const getUserByName = new DBQuery<Pick<GIDData.user, "user_name">, GIDData.user>(`SELECT * FROM "users" WHERE "user_name" = @user_name`);
