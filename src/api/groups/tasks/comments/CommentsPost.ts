import Express from "express";
import { body } from "express-validator";
import { createTransactionStatementTyped } from "@/functions/databaseFunctions";
import { validateData } from "@/middlewares/validateData";

export const CommentsPostRouter = Express.Router();

CommentsPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("comment").trim().escape().notEmpty().isLength({ max: 2000 }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const insertComment = createTransactionStatementTyped<Pick<GIDData.comment, "comment" | "user_id" | "task_id" | "comment_last_changed">>(
      `INSERT INTO comments (task_id, user_id, comment, comment_last_changed)
      VALUES (@task_id, @user_id, @comment, @comment_last_changed)`
    );

    const result = insertComment.run({
      task_id: req.extra.params.task_id,
      user_id: req.authedUser.user_id,
      comment: req.body.comment,
      comment_last_changed: Date.now().toString(),
    });

    if (!result.data || !result.isSuccessful) throw new Error(`Couldn't create new comment`);

    res.status(200);
    res.json({
      comment_id: result.data.lastInsertRowid,
    });
  }
);
