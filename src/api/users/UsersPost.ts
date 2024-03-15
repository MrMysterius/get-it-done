import { getUserByID, getUserByName } from "@/functions/database/queries/users";

import Express from "express";
import { body } from "express-validator";
import { createNewUser } from "@/functions/database/transactions/users";
import { generateErrorWithStatus } from "../../functions/generateErrorWithStatus";
import { generatePasswordHash } from "../../functions/generatePasswordHash";
import { user_roles } from "../../types/types";
import { validateData } from "../../middlewares/validateData";

export const UsersPostRouter = Express.Router();

UsersPostRouter.post(
  "/",

  // REQUEST DATA REQUIRMENTS
  body("user_name")
    .trim()
    .notEmpty()
    .escape()
    .isLength({ min: 1, max: 40 })
    .isAlphanumeric("en-US", { ignore: "._-" })
    .custom((user_name: string) => {
      const user = getUserByName.get({ user_name: user_name });
      if (user.data) throw new Error("User with that username allready exists");
      return true;
    }),

  body("user_password").trim().notEmpty().isAscii().isLength({ max: 128 }),

  body("user_displayname").trim().escape().notEmpty().isAscii().isLength({ max: 40 }).optional(),

  body("user_role")
    .trim()
    .default("user")
    .custom((v: any) => {
      if (user_roles.findIndex((r) => r == v) == -1) throw new Error("Invalid user role");
      return true;
    }),

  body("invitee_id")
    .trim()
    .default(0)
    .isNumeric()
    .custom((id: number) => {
      const user = getUserByID.get({ user_id: id });
      if (!user.data && id != 0) throw new Error("Invitee doesn't exist");
      return true;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    if (req.authedUser?.user_role != "admin") throw generateErrorWithStatus("Unauthorized Access", 403);

    const result = createNewUser.run({
      user_name: req.body.user_name,
      user_password_hash: generatePasswordHash(req.body.user_password),
      user_displayname: req.body.user_displayname || req.body.user_name,
      user_role: req.body.user_role,
      user_invited_from: req.body.invitee_id || null,
      user_active: 1 as unknown as boolean,
    });

    if (!result.isSuccessful || !result.data || result.data.changes != 1) throw generateErrorWithStatus("Internal Server Error", 500);

    res.status(200);
    res.json({
      user: {
        id: result.data.lastInsertRowid,
        name: req.body.user_name,
        displayname: req.body.user_displayname || req.body.user_name,
        role: req.body.user_role,
      },
    });
  }
);
