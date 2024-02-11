import { getAllData, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { validateData } from "../../../middlewares/validateData";

export const MembersGetRouter = Express.Router();

MembersGetRouter.get(
  "/",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const group_members = getAllData<GIDData.group_member & { member_user_name: string; member_user_displayname: string; isOwner: boolean | null }>(
      `SELECT
        group_members.*,
        users.user_name as member_user_name,
        users.user_displayname as member_user_displayname
      FROM group_members
      LEFT JOIN users
      ON group_members.user_id = users.user_id
      WHERE group_id = ?`,
      req.extra.params.group_id
    );

    if (!group_members.data) throw new Error("Group Not Found");

    const group_owner = getData<Pick<GIDData.user, "user_id" | "user_name" | "user_displayname">>(
      `SELECT user_id, user_name, user_displayname FROM users WHERE user_id = ?`,
      req.extra.group.group_owner
    );

    if (group_owner.data) {
      group_members.data.push({
        group_id: req.extra.params.group_id,
        user_id: group_owner.data.user_id,
        member_user_name: group_owner.data.user_name,
        member_user_displayname: group_owner.data.user_displayname,
        isOwner: true,
      });
    }

    res.status(200);
    res.json(
      group_members.data.map((member) => {
        return {
          user_id: member.user_id,
          user_name: member.member_user_name,
          user_displayname: member.member_user_displayname,
          group_role: member.isOwner ? "owner" : "member",
        };
      })
    );
  }
);
