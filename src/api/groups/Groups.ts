import Express from "express";
import { GroupsDeleteRouter } from "./GroupsDelete";
import { GroupsGetRouter } from "./GroupsGet";
import { GroupsPostRouter } from "./GroupsPost";
import { GroupsPutRouter } from "./GroupsPut";
import { InboxesRouter } from "./inboxes/Inboxes";
import { MembersRouter } from "./members/Members";
import { StatesRouter } from "./states/States";
import { TagsRouter } from "./tags/Tags";
import { TasksRouter } from "./tasks/Tasks";
import { getData } from "../../functions/databaseFunctions";
import { param } from "express-validator";
import { validateData } from "../../middlewares/validateData";

export const GroupsRouter = Express.Router();

GroupsRouter.use("/", GroupsGetRouter);
GroupsRouter.use("/", GroupsPostRouter);
GroupsRouter.use("/", GroupsPutRouter);
GroupsRouter.use("/", GroupsDeleteRouter);

const GroupsSubRouter = Express.Router();

GroupsRouter.use(
  "/:group_id",
  param("group_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const group = getData<Pick<GIDData.group, "group_id" | "group_owner">>(`SELECT group_id, group_owner FROM groups WHERE group_id = ?`, id);
      const group_member = getData<GIDData.group_member>(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`, id, req.authedUser?.user_id);

      if (!group.data) throw new Error("Group with that ID doesn't exist");

      req.extra.isGroupOwner = false;
      let membership = false;
      if (group.data.group_owner == req.authedUser?.user_id) {
        membership = true;
        req.extra.isGroupOwner = true;
      }
      if (group_member.data && group_member.data.user_id == req.authedUser?.user_id) {
        membership = true;
      }

      if (!membership && req.authedUser?.user_role != "admin") throw new Error("Group with that ID doesn't exist");

      req.extra.params.group_id = id;
      req.extra.group = group.data;
      return true;
    }),
  validateData,
  GroupsSubRouter
);

GroupsSubRouter.use("/members", MembersRouter);
GroupsSubRouter.use("/states", StatesRouter);
GroupsSubRouter.use("/tags", TagsRouter);
GroupsSubRouter.use("/tasks", TasksRouter);
GroupsSubRouter.use("/inboxes", InboxesRouter);
