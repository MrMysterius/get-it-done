import { createTransactionStatement, getData } from "../../functions/databaseFunctions";

import Database from "better-sqlite3";
import Express from "express";
import { body } from "express-validator";
import { generateInviteCode } from "../../functions/generateInviteCode";
import { validateData } from "../../middlewares/validateData";

export const InvitesPostRouter = Express.Router();

InvitesPostRouter.post(
  "/",

  // REQUEST DATA REQUIRMENTS
  body("invite_limit")
    .trim()
    .default(1)
    .notEmpty()
    .isNumeric()
    .custom((limit: string | number) => {
      const lmt = parseInt(limit.toString(), 10);
      if (lmt < 1 || lmt > 100) throw new Error("Invite Limit too low or too high. Min 1 and Max 100.");
      return true;
    }),

  body("invite_code")
    .trim()
    .escape()
    .notEmpty()
    .isAlphanumeric("en-US")
    .custom((code: string) => {
      const codeData = getData<GIDData.invite>(`SELECT invite_id, invite_code FROM invites WHERE invite_code = ?`, code);
      if (codeData.data) throw new Error("Invite code allready exists");
      return true;
    })
    .optional(),

  body("invite_creator")
    .trim()
    .notEmpty()
    .isNumeric()
    .custom((id: number) => {
      const user = getData<GIDData.user>(`SELECT user_id, user_name FROM users WHERE user_id = ?`, id);
      if (!user.data) throw new Error("User does not exist");
      return true;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    let statement = createTransactionStatement(
      `INSERT INTO invites (invite_limit, invite_code, invite_creator) VALUES (@invite_limit, @invite_code, @invite_creator)`
    );

    let insertObject: { invite_limit: number; invite_code: string; invite_creator: number };
    const code = generateInviteCode();

    if (req.authedUser?.user_role == "admin") {
      insertObject = {
        invite_limit: req.body.invite_limit,
        invite_code: req.body.invite_code || code,
        invite_creator: req.body.invite_creator || req.authedUser?.user_id || null,
      };
    } else {
      insertObject = {
        invite_limit: req.body.invite_limit,
        invite_code: code,
        invite_creator: req.body.invite_creator || req.authedUser?.user_id || null,
      };
    }

    const result = statement.run(insertObject);

    if (!result.isSuccessful || !result.data) throw new Error();

    res.status(200);
    res.json({
      invite_id: result.data.lastInsertRowid,
      invite_code: insertObject.invite_code,
      invite_limit: insertObject.invite_limit,
      invite_creator: insertObject.invite_creator,
    });
  }
);
