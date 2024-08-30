import { createTransactionStatement, getData } from "./functions/databaseFunctions";

import Express from "express";
import { body } from "express-validator";
import { generatePasswordHash } from "./functions/generatePasswordHash";
import { validateData } from "./middlewares/validateData";

export const SignUpRouter = Express.Router();

SignUpRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("invite_code")
    .trim()
    .escape()
    .notEmpty()
    .isAlphanumeric()
    .custom((code: string) => {
      const invite = getData<GIDData.invite>(`SELECT * FROM invites WHERE invite_code = ?`, code);
      if (!invite.isSuccessful || !invite.data || invite.data.invite_used_amount >= invite.data.invite_limit) throw new Error("Invalid Invite Code");
      return true;
    }),

  body("username")
    .trim()
    .escape()
    .notEmpty()
    .isAlphanumeric("en-US", { ignore: "._-" })
    .isLength({ min: 1, max: 40 })
    .custom((name: string) => {
      const user = getData<Pick<GIDData.user, "user_id" | "user_name">>(`SELECT user_id, user_name FROM users WHERE user_name = ?`, name);
      if (user.data) throw new Error("Username Allready Exists");
      return true;
    }),

  body("password").trim().notEmpty().isAscii().isLength({ max: 128 }),

  body("redirect")
    .trim()
    .notEmpty()
    .isAscii()
    .customSanitizer((path: string | undefined) => {
      const match = path?.match(/^\/[\w]*$/);
      if (!match) path = undefined;
      return path;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const invite = getData<GIDData.invite>(`SELECT * FROM invites WHERE invite_code = ?`, req.body.invite_code);

    const insertUser = createTransactionStatement(
      `INSERT INTO users (user_name, user_displayname, user_password_hash, user_active, user_invited_from)
      VALUES (@user_name, @user_displayname, @user_password_hash, @user_active, @user_invited_from)`
    );
    const inviteUpdate = createTransactionStatement(
      `UPDATE invites
      SET invite_used_amount = @invite_used_amount
      WHERE invite_id = @invite_id`
    );

    const inviteResult = inviteUpdate.run({
      invite_used_amount: (invite.data as GIDData.invite).invite_used_amount + 1,
      invite_id: (invite.data as GIDData.invite).invite_id,
    });

    if (!inviteResult.isSuccessful || !inviteResult.data) throw new Error();

    const userResult = insertUser.run({
      user_name: req.body.username,
      user_displayname: req.body.username,
      user_password_hash: generatePasswordHash(req.body.password),
      user_active: 1,
      user_invited_from: invite.data?.invite_creator || null,
    });

    if (!userResult.isSuccessful || !userResult.data) throw new Error();

    if (req.body.redirect) {
      res.redirect(302, req.body.redirect);
      return;
    }

    res.status(200);
    res.json({
      user_id: userResult.data.lastInsertRowid,
      user_name: req.body.username,
    });
  }
);
