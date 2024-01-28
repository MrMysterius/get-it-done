import { getAllData, getData } from "../../../functions/databaseFunctions";

import Express from "express";
import { param } from "express-validator";
import { validateData } from "../../../middlewares/validateData";

export const TasksGetRouter = Express.Router();

TasksGetRouter.get(
  "/",

  (req, res) => {
    const tasks = getAllData<GIDData.task>(`SELECT * FROM tasks WHERE task_creator = ? AND task_archived = 0`, req.extra.params.group_id);

    if (!tasks.data) throw new Error("Couldn't get tasks");

    const aggregatedTasks = tasks.data.map((task) => {
      const task_tags = getAllData<GIDData.task_tag & GIDData.tag>(
        `SELECT * FROM task_tags LEFT JOIN tags ON task_tags.tag_id = tags.tag_id WHERE task_id = ?`,
        task.task_id
      );

      const comments = getAllData<GIDData.comment & Pick<GIDData.user, "user_name" | "user_displayname">>(
        `SELECT comments.*, users.user_name, users.user_displayname FROM comments LEFT JOIN users ON comments.user_id = users.user_id WHERE comments.task_id = ?`,
        task.task_id
      );

      const state = getData<GIDData.task_state & GIDData.state>(
        `SELECT * FROM task_state LEFT JOIN states ON task_state.state_id = states.state_id WHERE task_state.task_id = ?`,
        task.task_id
      );

      const asignees = getAllData<GIDData.task_asignee & Pick<GIDData.user, "user_id" | "user_name" | "user_displayname">>(
        `SELECT task_asignees.*, users.user_id, users.user_name, users.user_displayname FROM task_asignees LEFT JOIN users ON task_asignees.user_id = users.user_id WHERE task_asignees.task_id = ?`,
        task.task_id
      );

      return { tags: task_tags.data, task, comments: comments.data, state: state.data, asignees: asignees.data };
    });

    res.status(200);
    res.json(
      aggregatedTasks.map(({ task, tags, comments, state, asignees }) => {
        return {
          id: task.task_id,
          title: task.task_title,
          description: task.task_description,
          date_start: task.task_date_start,
          date_due: task.task_date_due,
          time_estimate: task.task_time_estimate,
          time_needed: task.task_time_needed,
          isArchived: task.task_archived,
          state: state
            ? {
                id: state.state_id,
                name: state.state_name,
                description: state.state_description,
                colour_text: state.state_colour_text,
                colour_background: state.state_colour_background,
              }
            : null,
          tags: tags.map((tag) => {
            return {
              id: tag.tag_id,
              name: tag.tag_name,
              description: tag.tag_description,
              type: tag.tag_type,
              colour_text: tag.tag_colour_text,
              colour_background: tag.tag_colour_background,
            };
          }),
          comments: comments.map((comment) => {
            return {
              id: comment.comment_id,
              comment: comment.comment,
              last_changed: comment.comment_last_changed,
              creator: {
                id: comment.user_id,
                name: comment.user_name,
              },
            };
          }),
          asignees: asignees.map((asignee) => {
            return {
              name: asignee.user_name,
              displayname: asignee.user_displayname,
            };
          }),
        };
      })
    );
  }
);

TasksGetRouter.get(
  "/archived",

  (req, res) => {
    const tasks = getAllData<GIDData.task>(`SELECT * FROM tasks WHERE task_creator = ? AND task_archived = 1`, req.extra.params.group_id);

    if (!tasks.data) throw new Error("Couldn't get tasks");

    const aggregatedTasks = tasks.data.map((task) => {
      const task_tags = getAllData<GIDData.task_tag & GIDData.tag>(
        `SELECT * FROM task_tags LEFT JOIN tags ON task_tags.tag_id = tags.tag_id WHERE task_id = ?`,
        task.task_id
      );

      const comments = getAllData<GIDData.comment & Pick<GIDData.user, "user_name" | "user_displayname">>(
        `SELECT comments.*, users.user_name, users.user_displayname FROM comments LEFT JOIN users ON comments.user_id = users.user_id WHERE comments.task_id = ?`,
        task.task_id
      );

      const state = getData<GIDData.task_state & GIDData.state>(
        `SELECT * FROM task_state LEFT JOIN states ON task_state.state_id = states.state_id WHERE task_state.task_id = ?`,
        task.task_id
      );

      const asignees = getAllData<GIDData.task_asignee & Pick<GIDData.user, "user_id" | "user_name" | "user_displayname">>(
        `SELECT task_asignees.*, users.user_id, users.user_name, users.user_displayname FROM task_asignees LEFT JOIN users ON task_asignees.user_id = users.user_id WHERE task_asignees.task_id = ?`,
        task.task_id
      );

      return { tags: task_tags.data, task, comments: comments.data, state: state.data, asignees: asignees.data };
    });

    res.status(200);
    res.json(
      aggregatedTasks.map(({ task, tags, comments, state, asignees }) => {
        return {
          id: task.task_id,
          title: task.task_title,
          description: task.task_description,
          date_start: task.task_date_start,
          date_due: task.task_date_due,
          time_estimate: task.task_time_estimate,
          time_needed: task.task_time_needed,
          isArchived: task.task_archived,
          state: state
            ? {
                id: state.state_id,
                name: state.state_name,
                description: state.state_description,
                colour_text: state.state_colour_text,
                colour_background: state.state_colour_background,
              }
            : null,
          tags: tags.map((tag) => {
            return {
              id: tag.tag_id,
              name: tag.tag_name,
              description: tag.tag_description,
              type: tag.tag_type,
              colour_text: tag.tag_colour_text,
              colour_background: tag.tag_colour_background,
            };
          }),
          comments: comments.map((comment) => {
            return {
              id: comment.comment_id,
              comment: comment.comment,
              last_changed: comment.comment_last_changed,
              creator: {
                id: comment.user_id,
                name: comment.user_name,
              },
            };
          }),
          asignees: asignees.map((asignee) => {
            return {
              name: asignee.user_name,
              displayname: asignee.user_displayname,
            };
          }),
        };
      })
    );
  }
);

TasksGetRouter.get(
  "/:task_id",

  param("task_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: string, meta) => {
      const req = meta.req as Express.Request;
      const tag = getData<Pick<GIDData.task, "task_id" | "task_creator">>(`SELECT task_id, task_creator FROM tasks WHERE task_id = ?`, id);
      if (!tag.data || tag.data.task_creator != req.extra.params.group_id) throw new Error("Tag with that id doesn't exist");
      return true;
    }),

  validateData,

  (req, res) => {
    const task = getData<GIDData.task>(`SELECT * FROM tasks WHERE task_id = ?`, req.params.task_id);

    if (!task.data) throw new Error("Couldn't get task");

    const task_tags = getAllData<GIDData.task_tag & GIDData.tag>(
      `SELECT * FROM task_tags LEFT JOIN tags ON task_tags.tag_id = tags.tag_id WHERE task_id = ?`,
      req.params.task_id
    );

    const comments = getAllData<GIDData.comment & Pick<GIDData.user, "user_name">>(
      `SELECT comments.*, users.user_name FROM comments LEFT JOIN users ON comments.user_id = users.user_id WHERE task_id = ?`,
      req.params.task_id
    );

    const state = getData<GIDData.task_state & GIDData.state>(
      `SELECT * FROM task_state LEFT JOIN states ON task_state.state_id = states.state_id WHERE task_state.task_id = ?`,
      req.params.task_id
    );

    const asignees = getAllData<GIDData.task_asignee & Pick<GIDData.user, "user_id" | "user_name" | "user_displayname">>(
      `SELECT task_asignees.*, users.user_id, users.user_name, users.user_displayname FROM task_asignees LEFT JOIN users ON task_asignees.user_id = users.user_id WHERE task_asignees.task_id = ?`,
      req.params.task_id
    );

    res.status(200);
    res.json({
      id: task.data.task_id,
      title: task.data.task_title,
      description: task.data.task_description,
      date_start: task.data.task_date_start,
      date_due: task.data.task_date_due,
      time_estimate: task.data.task_time_estimate,
      time_needed: task.data.task_time_needed,
      isArchived: task.data.task_archived,
      state: state.data
        ? {
            id: state.data.state_id,
            name: state.data.state_name,
            description: state.data.state_description,
            colour_text: state.data.state_colour_text,
            colour_background: state.data.state_colour_background,
          }
        : null,
      tags: task_tags.data.map((tag) => {
        return {
          id: tag.tag_id,
          name: tag.tag_name,
          description: tag.tag_description,
          type: tag.tag_type,
          colour_text: tag.tag_colour_text,
          colour_background: tag.tag_colour_background,
        };
      }),
      comments: comments.data.map((comment) => {
        return {
          id: comment.comment_id,
          comment: comment.comment,
          last_changed: comment.comment_last_changed,
          creator: {
            id: comment.user_id,
            name: comment.user_name,
          },
        };
      }),
      asignees: asignees.data.map((asignee) => {
        return {
          name: asignee.user_name,
          displayname: asignee.user_displayname,
        };
      }),
    });
  }
);
