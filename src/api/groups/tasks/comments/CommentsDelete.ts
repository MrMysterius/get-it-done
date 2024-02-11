import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { validateData } from "@/middlewares/validateData";

export const CommentsDeleteRouter = Express.Router();

CommentsDeleteRouter.delete(
  "/:comment_id",

  // REQUEST DATA REQUIREMENTS
  param("comment_id")
    .trim()
    .notEmpty()
    .isNumeric()
    .toInt()
    .custom((id: number, meta) => {
      const req = meta.req as Express.Request;
      const comment = getData<Pick<GIDData.comment, "comment_id">>(
        `SELECT comment_id FROM comments WHERE comment_id = ? AND user_id = ?`,
        id,
        req.authedUser.user_id
      );
      if (!comment.data || !comment.isSuccessful) throw new Error(`Comment doesn't exist or is from another user`);
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteComment = createTransactionStatementTyped<Pick<GIDData.comment, "comment_id">>(`DELETE FROM comments WHERE comment_id = @comment_id`);

    const result = deleteComment.run({
      comment_id: req.params.comment_id,
    });

    if (!result.data || !result.isSuccessful) throw new Error(`Couldn't update comment`);

    res.status(200);
    res.json({
      comment_id: req.params.comment_id,
    });
  }
);
