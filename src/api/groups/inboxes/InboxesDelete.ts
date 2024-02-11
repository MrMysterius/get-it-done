import { body, param } from "express-validator";
import { createTransactionStatementTyped, getData } from "@/functions/databaseFunctions";

import Express from "express";
import { validateData } from "@/middlewares/validateData";

export const InboxesDeleteRouter = Express.Router();

InboxesDeleteRouter.delete(
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

  // DATA CHECK
  validateData,

  // ACTUAL REQUEST HANDLE
  (req, res) => {
    const deleteInboxCode = createTransactionStatementTyped<Pick<GIDData.inbox_code, "inbox_code">>(`DELETE FROM inbox_codes WHERE inbox_code = @inbox_code`);

    const result = deleteInboxCode.run({
      inbox_code: req.params.inbox_code,
    });

    if (!result.data || !result.isSuccessful) throw new Error("Couldn't delete inbox code");

    res.status(200);
    res.json({
      inbox_code: req.params.inbox_code,
    });
  }
);
