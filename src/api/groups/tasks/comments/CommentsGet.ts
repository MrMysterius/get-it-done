import Express from "express";
import { getAllData } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const CommentsGetRouter = Express.Router();

CommentsGetRouter.get(
  "/",

  // REQUEST DATA REQUIREMENTS

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const comments = getAllData<GIDData.comment & Pick<GIDData.user, "user_name">>(
      `SELECT
        comments.*,
        users.user_name
      FROM comments
      LEFT JOIN users
      ON comments.user_id = users.user_id
      WHERE task_id = ?`,
      req.extra.params.task_id
    );

    if (!comments.data) throw new Error(`Couldn't get comments`);

    res.status(200);
    res.send(
      comments.data.map((comment) => {
        return {
          comment_id: comment.comment_id,
          comment: comment.comment,
          last_changed: comment.comment_last_changed,
          creator: {
            id: comment.user_id,
            name: comment.user_name,
          },
        };
      })
    );
  }
);
