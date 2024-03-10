import { getUserWithID, getUserWithUsername } from "@/functions/database/queries/userQueries";

import Express from "express";
import { body } from "express-validator";
import { createNewUser } from "@/functions/database/transactions/userTransactions";
import { generateErrorWithStatus } from "@/functions/generateErrorWithStatus";
import { generatePasswordHash } from "@/functions/generatePasswordHash";
import { generateUniqueIdentifier } from "@/functions/generateUniqueIdentifier";
import { user_roles } from "@/types/types";
import { validateData } from "@/middlewares/validateData";

export const UsersPostRouter = Express.Router();

UsersPostRouter.post(
  "/",

  // REQUEST DATA REQUIRMENTS
  body("name")
    .trim()
    .notEmpty()
    .escape()
    .isLength({ min: 1, max: 40 })
    .isAlphanumeric("en-US", { ignore: "._-" })
    .custom((name: string) => {
      const user = getUserWithUsername.get({ user_name: name });
      if (user.data) throw new Error("User with that username allready exists");
      return true;
    }),

  body("password").trim().notEmpty().isAscii().isLength({ max: 128 }),

  body("displayname").trim().escape().notEmpty().isAscii().isLength({ max: 40 }).optional(),

  body("role")
    .trim()
    .default("user")
    .custom((v: any) => {
      if (user_roles.findIndex((r) => r == v) == -1) throw new Error("Invalid user role");
      return true;
    }),

  body("invitee_id")
    .trim()
    .isString()
    .matches(/usr_[0-9a-zA-Z]{20}/)
    .custom((id: string) => {
      const user = getUserWithID.get({ user_id: id });
      if (!user.data) throw new Error("Invitee doesn't exist");
      return true;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (req.authedUser?.user_role != "admin") throw generateErrorWithStatus("Unauthorized Access", 403);

    const newUserID = generateUniqueIdentifier("usr");

    const result = createNewUser.run({
      user_id: newUserID,
      user_name: req.body.user_name,
      user_password_hash: generatePasswordHash(req.body.password),
      user_displayname: req.body.user_displayname || req.body.user_name,
      user_role: req.body.user_role,
      user_invited_from: req.body.invitee_id || null,
      user_active: true,
    });

    if (!result.isSuccessful || !result.data || result.data.changes != 1) throw generateErrorWithStatus("Internal Server Error", 500);

    res.status(200);
    res.json({
      id: newUserID,
      name: req.body.user_name,
      displayname: req.body.user_displayname || req.body.user_name,
      role: req.body.user_role,
      invited_from: req.body.invitee_id || null,
    });
  }
);
