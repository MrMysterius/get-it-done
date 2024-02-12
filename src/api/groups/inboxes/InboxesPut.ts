import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { escape } from "validator";
import { validateData } from "@/middlewares/validateData";

export const InboxesPutRouter = Express.Router();

InboxesPutRouter.put(
  "/:inbox_code",

  // REQUEST DATA REQUIREMENTS
  param("inbox_code")
    .trim()
    .notEmpty()
    .isAlphanumeric()
    .custom((code: string, meta) => {
      const req = meta.req as Express.Request;
      const inbox_code = getData<GIDData.inbox_code>(`SELECT * FROM inbox_codes WHERE inbox_code = ? AND inbox_owner = ?`, code, req.extra.params.group_id);
      if (!inbox_code.data) throw new Error("This inbox code doesn't exist");

      req.extra.inbox = inbox_code.data;

      return true;
    }),

  body("extras")
    .notEmpty()
    .customSanitizer((obj: any) => {
      return { tags: obj?.tags || [] };
    })
    .customSanitizer((obj: any) => {
      obj.tags = obj.tags.map((tag) => escape(tag));
      return obj;
    })
    .optional(),

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const updateInboxCode = createTransactionStatementTyped<Omit<GIDData.inbox_code, "inbox_owner" | "inbox_id">>(
      `UPDATE inbox_codes
      SET
        inbox_extras = @inbox_extras
      WHERE inbox_code = @inbox_code`
    );

    const result = updateInboxCode.run({
      inbox_code: req.params.inbox_code,
      inbox_extras: JSON.stringify(req.body.extras || JSON.parse(req.extra.inbox.inbox_extras)),
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't update inbox code");

    res.status(200);
    res.json({
      inbox_code: req.params.inbox_code,
      inbox_extras: req.body.extras || JSON.parse(req.extra.inbox.inbox_extras),
    });
  }
);
