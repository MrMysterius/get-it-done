import Express from "express";
import { body } from "express-validator";
import { createTransactionStatementTyped } from "@/functions/databaseFunctions";
import { escape } from "validator";
import { generateInboxCode } from "@/functions/generateInboxCode";
import { validateData } from "@/middlewares/validateData";

export const InboxesPostRouter = Express.Router();

InboxesPostRouter.post(
  "/",

  // REQUEST DATA REQUIREMENTS
  body("extras")
    .default({})
    .notEmpty()
    .customSanitizer((obj: any) => {
      return { tags: obj?.tags || [] };
    })
    .customSanitizer((obj: any) => {
      obj.tags = obj.tags.map((tag) => escape(tag));
      return obj;
    }),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const code = generateInboxCode();

    const insertInboxCode = createTransactionStatementTyped<Omit<GIDData.inbox_code, "inbox_id">>(
      `INSERT INTO inbox_codes (inbox_owner, inbox_code, inbox_extras)
      VALUES (@inbox_owner, @inbox_code, @inbox_extras)`
    );

    const result = insertInboxCode.run({
      inbox_owner: req.extra.params.group_id,
      inbox_code: code,
      inbox_extras: JSON.stringify(req.body.extras),
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't create new inbox code");

    res.status(200);
    res.json({
      inbox_code: code,
      inbox_extras: req.body.extras,
    });
  }
);
