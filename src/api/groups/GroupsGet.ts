import { createTransactionStatementTyped, getAllData, getData } from "../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const GroupsGetRouter = Express.Router();

GroupsGetRouter.get("/", (req, res) => {
  if (req.authedUser?.user_role == "admin") {
    const groups = getAllData<GIDData.group & { group_owner_username: string; group_owner_displayname: string }>(
      `SELECT
        groups.*,
        users.user_name as group_owner_username,
        users.user_displayname as group_owner_displayname
      FROM groups
      LEFT JOIN users
      ON groups.group_owner = users.user_id`
    );

    if (!groups.isSuccessful || !groups.data) throw new Error();

    res.status(200);
    res.json(
      groups.data.map((group) => {
        return {
          group_id: group.group_id,
          group_name: group.group_name,
          group_owner: {
            user_id: group.group_owner,
            user_name: group.group_owner_username,
            user_display_name: group.group_owner_displayname,
          },
        };
      })
    );
  } else {
    const groups = getAllData<GIDData.group & { group_owner_username: string; group_owner_displayname: string }>(
      `SELECT
        groups.*,
        users.user_name as group_owner_username,
        users.user_displayname as group_owner_displayname
      FROM groups
      LEFT JOIN users
      ON groups.group_owner = users.user_id
      WHERE groups.group_owner = ?`,
      req.authedUser?.user_id
    );

    const groupsMemberOf = getAllData<GIDData.group & { group_owner_username: string; group_owner_displayname: string }>(
      `SELECT
        groups.*,
        users.user_name as group_owner_username,
        users.user_displayname as group_owner_displayname
      FROM groups
      LEFT JOIN group_members
      ON groups.group_id = group_members.group_id
      LEFT JOIN users
      ON groups.group_owner = users.user_id
      WHERE group_members.user_id = ?`,
      req.authedUser?.user_id
    );

    if (!groups.isSuccessful || !groups.data || !groupsMemberOf.isSuccessful || !groupsMemberOf.data) throw new Error();

    groups.data.push(...groupsMemberOf.data);

    res.status(200);
    res.json(
      groups.data.map((group) => {
        return {
          group_id: group.group_id,
          group_name: group.group_name,
          group_owner: {
            user_id: group.group_owner,
            user_name: group.group_owner_username,
            user_display_name: group.group_owner_displayname,
          },
        };
      })
    );
  }
});

GroupsGetRouter.get(
  "/:group_id",

  // REQUEST DATA REQUIREMENTS
  param("group_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const group = getData<Pick<GIDData.group, "group_id" | "group_owner">>(`SELECT group_id, group_owner FROM groups WHERE group_id = ?`, id);
      const members = getAllData<GIDData.group_member>(`SELECT * FROM group_members WHERE group_id = ?`, id);
      if (
        !group.isSuccessful ||
        !group.data ||
        !members.data ||
        (req.authedUser?.user_role == "user" &&
          (req.authedUser.user_id != group.data.group_owner || !members.data.find((mem) => mem.user_id == req.authedUser.user_id)))
      )
        throw new Error("Group with that ID doesn't exist");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUESAT HANDLE
  (req, res) => {
    const group = getData<GIDData.group & { group_owner_username: string; group_owner_displayname: string }>(
      `SELECT
        groups.*,
        users.user_name as group_owner_username,
        users.user_displayname as group_owner_displayname
      FROM groups
      LEFT JOIN users
      ON groups.group_owner = users.user_id
      WHERE groups.group_id = ?`,
      req.params.group_id
    );

    if (!group.isSuccessful || !group.data) throw new Error();

    res.status(200);
    res.json({
      group_id: group.data.group_id,
      group_name: group.data.group_name,
      group_owner: {
        user_id: group.data.group_owner,
        user_name: group.data.group_owner_username,
        user_display_name: group.data.group_owner_displayname,
      },
    });
  }
);
